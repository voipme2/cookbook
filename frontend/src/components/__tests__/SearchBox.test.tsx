import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBox } from '../SearchBox'

// Mock the API module
jest.mock('../../lib/api', () => ({
  api: {
    searchRecipesWithFilters: jest.fn(),
  },
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(),
}))

describe('SearchBox', () => {
  const mockRecipes = [
    {
      id: '1',
      name: 'Chicken Pasta',
      description: 'Delicious chicken pasta dish',
      options: {
        isVegetarian: false,
        isVegan: false,
        isDairyFree: false,
        isGlutenFree: false,
        isCrockPot: false,
      },
      groups: [
        { id: '1', name: 'Italian' },
        { id: '2', name: 'Dinner' }
      ],
    },
    {
      id: '2',
      name: 'Vegetarian Salad',
      description: 'Fresh vegetarian salad',
      options: {
        isVegetarian: true,
        isVegan: true,
        isDairyFree: true,
        isGlutenFree: true,
        isCrockPot: false,
      },
      groups: [
        { id: '3', name: 'Healthy' },
        { id: '4', name: 'Lunch' }
      ],
    },
    {
      id: '3',
      name: 'Beef Stew',
      description: 'Hearty beef stew',
      options: {
        isVegetarian: false,
        isVegan: false,
        isDairyFree: true,
        isGlutenFree: true,
        isCrockPot: true,
      },
      groups: [
        { id: '5', name: 'Comfort Food' }
      ],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Filter Mode', () => {
    it('renders search input with correct placeholder', () => {
      render(<SearchBox mode="filter" allRecipes={mockRecipes} />)
      
      const searchInput = screen.getByPlaceholderText('Filter recipes...')
      expect(searchInput).toBeInTheDocument()
    })

    it('filters recipes by text search', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()
      
      render(
        <SearchBox 
          mode="filter" 
          allRecipes={mockRecipes} 
          onFilterChange={onFilterChange}
        />
      )

      const searchInput = screen.getByPlaceholderText('Filter recipes...')
      await user.type(searchInput, 'chicken')

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith([
          expect.objectContaining({ name: 'Chicken Pasta' })
        ])
      })
    })

    it('filters recipes by dietary restrictions', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()
      
      render(
        <SearchBox 
          mode="filter" 
          allRecipes={mockRecipes} 
          onFilterChange={onFilterChange}
        />
      )

      // Open filters
      const filterButton = screen.getByTitle('Toggle filters')
      await user.click(filterButton)

      // Check vegetarian filter
      const vegetarianCheckbox = screen.getByLabelText('🥬 Vegetarian')
      await user.click(vegetarianCheckbox)

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith([
          expect.objectContaining({ name: 'Vegetarian Salad' })
        ])
      })
    })

    it('combines text search with dietary filters', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()
      
      render(
        <SearchBox 
          mode="filter" 
          allRecipes={mockRecipes} 
          onFilterChange={onFilterChange}
        />
      )

      // Type search text
      const searchInput = screen.getByPlaceholderText('Filter recipes...')
      await user.type(searchInput, 'salad')

      // Open filters and check vegetarian
      const filterButton = screen.getByTitle('Toggle filters')
      await user.click(filterButton)
      
      const vegetarianCheckbox = screen.getByLabelText('🥬 Vegetarian')
      await user.click(vegetarianCheckbox)

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith([
          expect.objectContaining({ name: 'Vegetarian Salad' })
        ])
      })
    })

    it('filters recipes by group names in search', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()
      
      render(
        <SearchBox 
          mode="filter" 
          allRecipes={mockRecipes} 
          onFilterChange={onFilterChange}
        />
      )

      // Search for a group name
      const searchInput = screen.getByPlaceholderText('Filter recipes...')
      await user.type(searchInput, 'italian')

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith([
          expect.objectContaining({ name: 'Chicken Pasta' })
        ])
      })
    })

    it('clears all filters when clear button is clicked', async () => {
      const user = userEvent.setup()
      const onFilterChange = jest.fn()
      
      render(
        <SearchBox 
          mode="filter" 
          allRecipes={mockRecipes} 
          onFilterChange={onFilterChange}
        />
      )

      // Open filters and check vegetarian
      const filterButton = screen.getByTitle('Toggle filters')
      await user.click(filterButton)
      
      const vegetarianCheckbox = screen.getByLabelText('🥬 Vegetarian')
      await user.click(vegetarianCheckbox)

      // Clear filters
      const clearButton = screen.getByTitle('Clear filters')
      await user.click(clearButton)

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(mockRecipes)
      })
    })

    it('shows clear button when filters are active', async () => {
      const user = userEvent.setup()
      
      render(<SearchBox mode="filter" allRecipes={mockRecipes} />)

      // Initially, clear button should not be visible
      expect(screen.queryByTitle('Clear filters')).not.toBeInTheDocument()

      // Open filters and check vegetarian
      const filterButton = screen.getByTitle('Toggle filters')
      await user.click(filterButton)
      
      const vegetarianCheckbox = screen.getByLabelText('🥬 Vegetarian')
      await user.click(vegetarianCheckbox)

      // Now clear button should be visible
      expect(screen.getByTitle('Clear filters')).toBeInTheDocument()
    })
  })

  describe('Global Mode', () => {
    it('renders search input with correct placeholder', () => {
      render(<SearchBox mode="global" />)
      
      const searchInput = screen.getByPlaceholderText('Search recipes...')
      expect(searchInput).toBeInTheDocument()
    })

    it('shows filter button', () => {
      render(<SearchBox mode="global" />)
      
      const filterButton = screen.getByTitle('Toggle filters')
      expect(filterButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<SearchBox mode="filter" allRecipes={mockRecipes} />)
      
      const searchInput = screen.getByPlaceholderText('Filter recipes...')
      expect(searchInput).toHaveAttribute('type', 'text')
      
      const filterButton = screen.getByTitle('Toggle filters')
      expect(filterButton).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<SearchBox mode="filter" allRecipes={mockRecipes} />)

      const searchInput = screen.getByPlaceholderText('Filter recipes...')
      
      // Tab to search input
      await user.tab()
      expect(searchInput).toHaveFocus()
      
      // Tab to filter button
      await user.tab()
      const filterButton = screen.getByTitle('Toggle filters')
      expect(filterButton).toHaveFocus()
    })
  })
}) 