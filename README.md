# Pika Casino Games Lobby

A modern, responsive games lobby interface built with Next.js 16, React 18, TypeScript, Redux, and SASS.

## Features

- 🎮 **Game Categories Navigation** - Horizontal scrollable menu with active state
- 🔍 **Games Search** - Real-time search with debouncing
- 📱 **Responsive Design** - Mobile-first approach with SASS styling
- ⚡ **Server-Side Rendering (SSR)** - Initial data fetched on the server
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 🧪 **Unit Tests** - Comprehensive test coverage for services and components
- 📦 **Redux State Management** - Centralized state with Redux and redux-thunk

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **State Management**: Redux with redux-thunk
- **Styling**: SASS (SCSS Modules)
- **Testing**: Jest + React Testing Library
- **API**: REST API integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pika-casino-lobby
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
pika-casino-lobby/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with Redux provider
│   ├── page.tsx            # Main lobby page (SSR)
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── CategoriesNav.tsx   # Categories navigation menu
│   ├── SearchBar.tsx       # Search input component
│   ├── GamesList.tsx       # Games grid display
│   ├── LobbyContent.tsx    # Main lobby content wrapper
│   └── ReduxProvider.tsx   # Redux store provider
├── store/                  # Redux store
│   ├── store.ts            # Store configuration
│   ├── hooks.ts            # Typed Redux hooks
│   └── slices/             # Redux slices
│       ├── categoriesSlice.ts
│       └── gamesSlice.ts
├── services/               # API services
│   └── api.ts              # API client functions
├── types/                  # TypeScript type definitions
│   └── index.ts
└── __tests__/              # Unit tests
    ├── components/
    ├── services/
    └── store/
```

## API Integration

The application integrates with the Pika Casino API:

- **Base URL**: `https://casino.api.pikakasino.com/v1/pika`
- **Endpoints**:
  - `GET /en/config` - Fetch game categories
  - `GET /en/games/tiles` - Fetch games with search and pagination

### Query Parameters

- `search` - Search query string
- `pageNumber` - Page number for pagination
- `pageSize` - Number of items per page

## Features Implementation

### Server-Side Rendering (SSR)

The main page (`app/page.tsx`) fetches categories on the server side, providing:
- Faster initial page load
- Better SEO
- Improved user experience

### State Management

Redux with redux-thunk is used for:
- Categories state (list, selected category, loading, errors)
- Games state (list, search query, pagination, loading, errors)
- Async actions handled with redux-thunk middleware

### Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

### Performance Optimizations

- Image lazy loading with Next.js Image component
- Debounced search input (500ms)
- API response caching with Next.js revalidation
- Optimized Redux store structure
- CSS Modules for scoped styling

## Testing

Tests are written using Jest and React Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Code Quality

- TypeScript for type safety
- ESLint for code linting
- Comprehensive comments and documentation
- Consistent code formatting
- Error handling and loading states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is created as a technical assessment.

## Author

Created as part of a frontend assessment for Pika Casino.
