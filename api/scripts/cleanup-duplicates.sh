#!/bin/bash

# Database configuration
DB_USER=${PGUSER:-cookbook}
DB_HOST=${PGHOST:-localhost}
DB_NAME=${PGDATABASE:-cookbook}
DB_PASSWORD=${PGPASSWORD:-cookbook123}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to find duplicates
find_duplicates() {
    print_info "Searching for duplicate recipes..."
    echo
    
    # Create a temporary SQL file
    cat > /tmp/find_duplicates.sql << 'EOF'
SELECT 
    recipe->>'name' as name,
    COUNT(*) as count,
    string_agg(id, ', ' ORDER BY id) as ids,
    string_agg(CASE WHEN recipe->>'imageUrl' != '' THEN 'Yes' ELSE 'No' END, ', ' ORDER BY id) as has_images,
    string_agg(recipe->>'author', ', ' ORDER BY id) as authors
FROM recipes 
GROUP BY recipe->>'name' 
HAVING COUNT(*) > 1
ORDER BY recipe->>'name';
EOF

    # Execute the query
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f /tmp/find_duplicates.sql 2>/dev/null
    
    # Clean up temp file
    rm -f /tmp/find_duplicates.sql
}

# Function to show recipe details
show_recipe_details() {
    local recipe_name="$1"
    
    print_info "Details for '$recipe_name':"
    echo
    
    # Create SQL to get details
    cat > /tmp/recipe_details.sql << EOF
SELECT 
    id,
    recipe->>'author' as author,
    recipe->>'description' as description,
    CASE WHEN recipe->>'imageUrl' != '' THEN 'Yes' ELSE 'No' END as has_image
FROM recipes 
WHERE recipe->>'name' = '$recipe_name'
ORDER BY id;
EOF

    # Execute the query
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f /tmp/recipe_details.sql 2>/dev/null
    
    # Clean up temp file
    rm -f /tmp/recipe_details.sql
}

# Function to remove duplicates
remove_duplicates() {
    local recipe_name="$1"
    local keep_id="$2"
    
    print_info "Removing duplicate recipes for '$recipe_name'..."
    echo
    
    # Get all IDs for this recipe
    cat > /tmp/get_duplicates.sql << EOF
SELECT id, recipe->>'imageUrl' as image_url
FROM recipes 
WHERE recipe->>'name' = '$recipe_name'
ORDER BY id;
EOF

    # Execute and capture results
    local duplicates=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -f /tmp/get_duplicates.sql 2>/dev/null | grep -v "^$" | grep -v "$keep_id")
    
    if [ -z "$duplicates" ]; then
        print_warning "No duplicates found to remove."
        rm -f /tmp/get_duplicates.sql
        return
    fi
    
    # Process each duplicate
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            # Extract ID and image URL from the line
            local id=$(echo "$line" | awk '{print $1}' | tr -d ' ')
            local image_url=$(echo "$line" | awk '{for(i=2;i<=NF;i++) printf "%s ", $i}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            print_info "Removing: $id"
            
            # Delete from database
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DELETE FROM recipes WHERE id = '$id';" >/dev/null 2>&1
            
            # Remove image file if it exists
            if [[ "$image_url" == *"/recipes/"* ]]; then
                local image_path="src/images/${id}.jpg"
                if [ -f "$image_path" ]; then
                    rm -f "$image_path"
                    print_info "  Removed image: ${id}.jpg"
                fi
            fi
        fi
    done <<< "$duplicates"
    
    # Clean up temp file
    rm -f /tmp/get_duplicates.sql
    
    print_success "Duplicate cleanup completed for '$recipe_name'"
}

# Function to run interactive cleanup
interactive_cleanup() {
    print_info "Starting interactive duplicate cleanup..."
    echo
    
    # Find duplicates
    local duplicates_output=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "
        SELECT 
            recipe->>'name' as name,
            COUNT(*) as count,
            string_agg(id, ', ' ORDER BY id) as ids
        FROM recipes 
        GROUP BY recipe->>'name' 
        HAVING COUNT(*) > 1
        ORDER BY recipe->>'name';
    " 2>/dev/null)
    
    if [ -z "$duplicates_output" ] || [ "$duplicates_output" = " name | count | ids " ] || [ "$duplicates_output" = "----+-------+-----" ]; then
        print_success "No duplicate recipes found!"
        return
    fi
    
    # Process each duplicate
    while IFS= read -r line; do
        if [ -n "$line" ] && [[ "$line" != *"name | count | ids"* ]] && [[ "$line" != *"----"* ]]; then
            # Parse the line
            local recipe_name=$(echo "$line" | awk -F'|' '{print $1}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            local count=$(echo "$line" | awk -F'|' '{print $2}' | tr -d ' ')
            local ids=$(echo "$line" | awk -F'|' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            if [ -n "$recipe_name" ] && [ "$count" -gt 1 ]; then
                echo
                print_info "Found duplicate: '$recipe_name' ($count copies)"
                show_recipe_details "$recipe_name"
                
                # Convert comma-separated IDs to array
                IFS=', ' read -ra ID_ARRAY <<< "$ids"
                
                echo "Available copies:"
                for i in "${!ID_ARRAY[@]}"; do
                    echo "  $((i+1)). ${ID_ARRAY[i]}"
                done
                
                # Ask which one to keep
                read -p "Which copy would you like to keep? (1-$count, or 'skip'): " choice
                
                if [ "$choice" = "skip" ]; then
                    print_warning "Skipping '$recipe_name'..."
                    continue
                fi
                
                if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "$count" ]; then
                    local keep_id="${ID_ARRAY[$((choice-1))]}"
                    print_info "Keeping: $keep_id"
                    
                    read -p "Remove the other copies? (y/n): " confirm
                    if [[ "$confirm" =~ ^[Yy]$ ]] || [[ "$confirm" =~ ^[Yy][Ee][Ss]$ ]]; then
                        remove_duplicates "$recipe_name" "$keep_id"
                    else
                        print_warning "Skipping removal for '$recipe_name'..."
                    fi
                else
                    print_error "Invalid choice, skipping..."
                fi
            fi
        fi
    done <<< "$duplicates_output"
    
    print_success "Interactive cleanup completed!"
}

# Main script logic
main() {
    echo "🍳 Cookbook Duplicate Cleanup Script"
    echo "=================================="
    echo
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        print_error "psql is not installed or not in PATH"
        exit 1
    fi
    
    # Check database connection
    if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
        print_error "Cannot connect to database. Check your database configuration."
        exit 1
    fi
    
    case "${1:-interactive}" in
        "list"|"find")
            find_duplicates
            ;;
        "remove")
            if [ -z "$2" ] || [ -z "$3" ]; then
                print_error "Usage: $0 remove 'Recipe Name' 'ID to keep'"
                exit 1
            fi
            remove_duplicates "$2" "$3"
            ;;
        "interactive"|"")
            interactive_cleanup
            ;;
        *)
            echo "Usage: $0 [command]"
            echo "Commands:"
            echo "  list, find     - Show all duplicates"
            echo "  remove <name> <id> - Remove duplicates for specific recipe"
            echo "  interactive    - Interactive cleanup (default)"
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 