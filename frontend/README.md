# Dynatrace Problems Dashboard - Frontend

Modern, interactive web application for exploring and analyzing Dynatrace problems with advanced visualizations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start on `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Base UI components
│   │   ├── auth/            # Authentication components
│   │   ├── layout/          # Layout components
│   │   ├── dashboard/       # Dashboard components
│   │   └── charts/          # Chart components (ECharts)
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ProblemsPage.tsx
│   ├── store/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── filtersStore.ts
│   │   └── problemsStore.ts
│   ├── lib/
│   │   ├── api/             # API client
│   │   ├── utils/           # Utility functions
│   │   └── constants/       # Constants
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🎨 Features

### Authentication
- Secure login with JWT
- Session persistence
- Auto-logout after inactivity
- Protected routes

### Dashboard
- **8 KPI Cards** with real-time metrics
- **Time Series Chart** - Problems over time with severity breakdown
- **Heatmap** - Impact vs Severity matrix
- **Pie Chart** - Duration distribution
- Smooth animations and transitions

### Problems Table
- Paginated table with sorting
- Real-time filtering
- Badge-based status indicators
- Responsive design

### Visualizations (Apache ECharts)
- Interactive charts with zoom and pan
- Tooltips with detailed information
- Export functionality
- Dark mode optimized

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **State Management:** Zustand
- **Styling:** Tailwind CSS 3
- **Charts:** Apache ECharts
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Validation:** Zod
- **Date Handling:** date-fns
- **Icons:** Lucide React

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors

# Testing
npm test             # Run tests
npm run test:coverage # Run tests with coverage
```

## 🔐 Demo Credentials

```
Username: czegarra
Password: czegarra
```

## 🎨 Design System

### Colors

**Primary Colors:**
- Background: `#0f172a`
- Card Background: `#1e293b`
- Borders: `#334155`

**Accent Colors:**
- Blue: `#3b82f6`
- Purple: `#8b5cf6`
- Cyan: `#06b6d4`

**Severity Colors:**
- Critical (Availability): `#ef4444`
- Error: `#f59e0b`
- Warning (Performance): `#eab308`
- Info (Resource): `#3b82f6`
- Custom: `#8b5cf6`

**Impact Colors:**
- Infrastructure: `#6366f1`
- Services: `#ec4899`
- Application: `#f97316`
- Environment: `#10b981`

### Typography

- **Headings:** Inter (Bold, Extrabold)
- **Body:** Inter
- **Monospace:** JetBrains Mono

## 🌐 API Integration

The frontend connects to the backend API at `/api/v1` (proxied through Vite).

### Key Endpoints Used:
- `POST /auth/login` - Authentication
- `GET /analytics/kpis` - Dashboard KPIs
- `GET /analytics/time-series` - Time series data
- `GET /analytics/impact-severity-matrix` - Heatmap data
- `GET /problems` - Problems list with filters

## 🎯 Key Features

### Glassmorphism UI
- Backdrop blur effects
- Transparent backgrounds
- Subtle borders and shadows

### Smooth Animations
- Page transitions with Framer Motion
- Count-up effects for numbers
- Hover and focus states
- Loading states

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Flexible grid layouts
- Scrollable tables on mobile

### Performance Optimizations
- Code splitting
- Lazy loading
- Memoized components
- Optimized bundle size

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=/api/v1
```

### Vite Proxy

The Vite dev server proxies API requests to the backend:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

```bash
# Build for production
npm run build

# Output will be in the 'dist' folder
# Deploy to your hosting service (Netlify, Vercel, etc.)
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Tailwind CSS for styling
3. Follow component structure
4. Write meaningful commit messages
5. Test before committing

## 📄 License

MIT
