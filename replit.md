# 7SS Cleaning Roster Automation App

## Overview

The 7SS Cleaning Roster Automation App is a web application designed to manage weekly cleaning duties for the first floor of 7SS. It automates task rotation among residents (Perpetua, Eman, Allegra, Atilla, Dania, Illy), tracks task completion with photo proof uploads, and provides editable bathroom cleaning assignments. The application displays current and historical weekly rosters, with tasks automatically rotating based on predefined sequences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing.

**State Management**: TanStack Query (React Query) for server state management with optimistic updates and automatic refetching. No global state library needed as most state is server-driven.

**UI Components**: Radix UI primitives wrapped with custom styling via shadcn/ui component library. The design follows a hybrid approach combining Linear's clean efficiency with Material Design principles, optimized for task management and roster tracking.

**Styling**: Tailwind CSS with custom CSS variables for theming. Supports both light and dark modes with theme persistence in localStorage. Uses Inter font for primary text and JetBrains Mono for monospace elements.

**Form Handling**: React Hook Form with Zod schema validation via @hookform/resolvers.

**File Structure**: 
- `/client/src/components` - Reusable UI components
- `/client/src/pages` - Page-level components
- `/client/src/hooks` - Custom React hooks
- `/client/src/lib` - Utility functions and query client configuration

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API structure with endpoints under `/api/*` prefix. Key endpoints include:
- `GET /api/current-week` - Retrieve current week's roster and tasks
- `GET /api/history` - Retrieve all historical weekly rosters
- `POST /api/tasks` - Create custom tasks
- Task completion and bathroom assignment management endpoints

**Middleware**: 
- JSON body parsing with raw body capture for webhook verification
- Request/response logging for API routes
- Custom error handling

**Business Logic**: 
- `RosterRotationManager` class handles automatic weekly roster creation and task rotation logic
- Predefined rotation sequences for main cleaning tasks (trash, sweeping, dusting)
- Default bathroom rotation sequences with editable assignments
- Week calculation based on Monday as week start (ISO week standard)

### Data Storage

**Database**: PostgreSQL via Neon serverless driver with WebSocket connection pooling.

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Schema Design**:
- `users` - User authentication (username/password)
- `weekly_rosters` - Weekly roster tracking with week number and year
- `tasks` - Individual cleaning tasks with assignments and rotation tracking
- `task_completions` - Task completion records with photo proof URLs and timestamps
- `bathroom_assignments` - Bathroom-specific assignments with cleaning mode (basic/deep)

**Migrations**: Drizzle Kit for schema migrations stored in `/migrations` directory.

**File Storage**: Replit Object Storage for uploaded proof images via `@replit/object-storage`.

### External Dependencies

**Database Service**: Neon serverless PostgreSQL database (configured via `DATABASE_URL` environment variable).

**UI Component Library**: Radix UI for accessible, unstyled component primitives.

**Styling Framework**: Tailwind CSS for utility-first styling with PostCSS processing.

**Font Hosting**: Google Fonts for Inter and JetBrains Mono font families.

**Development Tools**:
- Replit-specific plugins for development banner, error overlay, and cartographer (source mapping)
- TSX for TypeScript execution in development
- ESBuild for production bundling

**Image Handling**: Multer for multipart form data processing (memory storage before upload to object storage).

**Date Utilities**: date-fns for date manipulation, formatting, and week calculations.

**Validation**: Zod for runtime type validation and schema creation.

**Type Safety**: TypeScript with strict mode enabled across the entire codebase, shared types between client and server via `/shared` directory.