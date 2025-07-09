# Cookbook Next.js Migration

This is the Next.js 15+ version of the Cookbook application, migrated from the original React + Vite setup.

## Features

- **Server-Side Rendering**: Recipes are fetched on the server for better performance
- **App Router**: Uses Next.js 15 App Router for modern routing
- **Material-UI**: Maintains the same UI components and theme
- **React Query**: Client-side state management for mutations and caching
- **TypeScript**: Full TypeScript support
- **Image Upload**: Support for recipe images
- **Search**: Real-time recipe search functionality

## Migration Benefits

### Performance Improvements
- **Server Components**: Recipe data is fetched on the server, reducing client-side JavaScript
- **Streaming**: Progressive loading of content
- **Image Optimization**: Built-in Next.js image optimization
- **Code Splitting**: Automatic code splitting by route

### Developer Experience
- **Type Safety**: Full TypeScript support throughout
- **Hot Reload**: Fast development with Turbopack
- **Built-in API Routes**: No need for separate Express server for simple endpoints
- **Better Error Handling**: Built-in error boundaries and not-found pages

### Pi-Friendly Optimizations
- **Reduced Bundle Size**: Server components reduce client JavaScript
- **Better Caching**: React Query with optimized cache settings
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── page.tsx           # Home page
│   ├── new/page.tsx       # New recipe form
│   ├── view/[recipeId]/   # Recipe view page
│   ├── import/page.tsx    # Import/export page
│   └── api/               # API routes
├── components/            # React components
│   ├── Layout.tsx         # Main layout wrapper
│   ├── NavBar.tsx         # Navigation component
│   ├── SearchBox.tsx      # Search functionality
│   ├── ViewRecipe.tsx     # Recipe display
│   └── providers/         # Context providers
├── lib/                   # Utilities and configuration
│   ├── api.ts            # API client
│   └── theme.ts          # Material-UI theme
└── types/                # TypeScript type definitions
```

## Backend Integration

This Next.js app connects to your existing Express backend running on port 3001. The backend provides:

- Recipe CRUD operations
- Image upload and serving
- Search functionality
- Data persistence

## Deployment

### For Raspberry Pi

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "cookbook-nextjs" -- start
   pm2 save
   pm2 startup
   ```

### Docker Deployment

The app can be containerized with the existing Docker setup. Update the docker-compose.yml to include the Next.js app.

## Performance Monitoring

Monitor the app performance on your Pi:

- **Memory Usage**: Check with `htop` or `free -h`
- **CPU Usage**: Monitor with `top` or `htop`
- **Network**: Use `iftop` for network monitoring
- **Logs**: Check Next.js logs for errors

## Future Enhancements

- **Service Worker**: Add offline support
- **Virtual Scrolling**: For large recipe lists
- **Image Lazy Loading**: Optimize image loading
- **Progressive Web App**: Add PWA capabilities
- **Database Integration**: Direct database access for better performance
