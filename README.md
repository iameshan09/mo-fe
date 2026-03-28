# MO Marketplace - Frontend

A product management and e-commerce interface built with React, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Routing**: React Router DOM 7
- **UI**: shadcn/ui + Tailwind CSS 4 + Lucide icons
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Theme**: Dark mode support via next-themes

## Features

- Browse and search products
- View product details with smart variant selection
- Create products with multiple variants (authenticated)
- Variant management with attribute-based selection and stock checking
- Quick buy functionality with quantity selection
- JWT authentication (login/register)
- Responsive design with dark mode

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- Backend API running (see [mo-be](../mo-be/))

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set the API URL if the backend is not on the default:
   ```bash
   export VITE_API_URL=http://localhost:3000/api/v1
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api/v1` |

## Pages

| Path | Auth | Description |
|------|------|-------------|
| `/` | No | Product listing with search |
| `/products/:id` | No | Product detail with variant selector |
| `/products/new` | Yes | Create a new product |
| `/login` | No | User login |
| `/register` | No | User registration |

## Scripts

```bash
npm run dev         # Start dev server with HMR
npm run build       # Type check + production build
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

## Project Structure

```
src/
├── api/            # Axios client and API endpoint functions
├── components/     # React components
│   ├── ui/        # shadcn UI primitives (Button, Card, Dialog, etc.)
│   ├── Layout.tsx
│   ├── QuickBuy.tsx
│   ├── VariantSelector.tsx
│   └── AddVariantDialog.tsx
├── pages/          # Page components (ProductList, ProductDetail, etc.)
├── store/          # Auth context and state management
├── types/          # TypeScript type definitions
├── lib/            # Utility functions
├── App.tsx         # Root component with routing
└── main.tsx        # Entry point
```
