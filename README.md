# Backend

A Node.js/Express backend application built with TypeScript.

## Features

- Authentication with JWT
- Banner management
- User management
- Discount scheduling with node-cron
- File upload support with multer

## Prerequisites

- Node.js (v18 or higher)
- pnpm

## Installation
 
```bash
pnpm install  
```

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Development

```bash
pnpm dev
```

## Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── index.ts              # Application entry point
├── data/                 # JSON data files
│   ├── banner.json
│   └── users.json
├── middleware/           # Express middleware
│   └── auth.ts
├── routes/              # API routes
│   ├── auth.ts
│   └── banner.ts
└── utils/               # Utility functions
    └── discountScheduler.ts
```

## License

Private
