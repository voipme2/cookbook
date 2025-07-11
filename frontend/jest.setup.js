import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  X: () => <div data-testid="x-icon">X</div>,
})) 