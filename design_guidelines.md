# 7SS Cleaning Roster Automation App - Design Guidelines

## Design Approach
**Design System**: Hybrid approach combining Linear's clean efficiency with Material Design's data-handling principles, optimized for task management and roster tracking.

**Core Principles**: 
- Clarity and scanability for quick task recognition
- Efficient data density without overwhelming users
- Trust-building through structured information display
- Mobile-responsive for on-the-go task checking

## Color Palette

**Dark Mode (Primary)**
- Background: 15 8% 12% (deep charcoal)
- Surface: 15 8% 16% (elevated panels)
- Surface Elevated: 15 8% 20% (cards, modals)
- Primary: 195 85% 55% (ocean blue - for active tasks, CTAs)
- Success: 142 70% 45% (vibrant green - completed tasks)
- Warning: 38 92% 50% (amber - pending/overdue)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%
- Border: 15 8% 25%

**Light Mode**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 195 85% 45%
- Success: 142 70% 35%
- Text Primary: 0 0% 15%
- Border: 0 0% 88%

## Typography

**Font Families**
- Primary: 'Inter', system-ui, sans-serif (via Google Fonts)
- Monospace: 'JetBrains Mono', monospace (for timestamps, resident IDs)

**Type Scale**
- Hero/Page Title: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Table Headers: text-sm font-medium uppercase tracking-wide
- Body/Task Names: text-base font-normal (16px)
- Labels/Meta: text-sm font-medium (14px)
- Captions: text-xs text-secondary (12px)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16 (rare: 20, 24 for major sections)
- Component padding: p-4 to p-8
- Section spacing: space-y-8
- Card gaps: gap-4
- Table cell padding: p-4

**Container Strategy**
- App wrapper: max-w-7xl mx-auto px-4 md:px-8
- Content cards: Full-width with internal max-width constraints
- Tables: Responsive horizontal scroll on mobile

## Component Library

**Navigation**
- Top app bar with logo, week selector, and user avatar
- Tab navigation for "Current Week" | "History" | "Bathroom Rotation" | "Settings"
- Sticky positioning on scroll

**Roster Table**
- Clean bordered table with alternating row backgrounds
- Column headers: Task Name | Assigned To | Status | Proof | Actions
- Avatar badges for residents (colored by resident, consistent throughout)
- Status indicators: checkbox + colored badge (Pending/Complete/Overdue)
- Compact mobile view: Card-based layout stacking task details

**Bathroom Rotation Panel**
- Grid layout: 3 columns (desktop) / 1 column (mobile)
- Each bathroom card: Header with bathroom number, resident dropdown, cleaning mode toggle (Basic/Deep), edit icon
- Inline editing with save/cancel actions
- Visual distinction: Slightly different surface color from main roster

**Task Completion**
- Large checkbox with smooth animation on check
- "Upload Proof" button with camera icon
- Image thumbnail grid (2-4 images) with lightbox on click
- Timestamp display in monospace font
- Before/After label tags on images

**Task Management**
- Floating action button (FAB) for "Add Task" (bottom-right)
- Modal form: Task name input, resident multi-select, frequency dropdown, save/cancel
- Delete with confirmation dialog
- Drag handles for manual reordering (optional enhancement)

**Image Upload Component**
- Drag-and-drop zone with dashed border
- File input trigger button
- Preview thumbnails with remove icon
- Upload progress indicator
- Support for multiple images per task

**Week Navigation**
- Week selector: Arrow buttons + current week display (e.g., "Week of Jan 15 - 21")
- Automatic "Current Week" highlighting
- Quick jump to current week button in history view

**Data Display Cards**
- Summary stats at top: Tasks Completed | Pending | Overdue (with icons)
- Resident leaderboard card (optional): Most completed tasks this month
- Proof gallery: Recent uploads in masonry grid

## Interaction Patterns

**Animations**: Minimal and purposeful
- Checkbox check: Smooth scale + checkmark draw (200ms)
- Modal entry: Fade + slight scale-up (150ms)
- Toast notifications: Slide-in from top-right (300ms)
- Image upload: Progress bar fill animation

**Feedback**
- Success toast: Green with checkmark icon
- Error toast: Red with alert icon
- Loading states: Skeleton screens for tables, spinners for actions
- Hover states: Subtle background change on table rows, buttons

## Images

**Hero Section**: Not applicable - this is a dashboard application, not a marketing site. The app opens directly to the functional roster view.

**User Content Images**
- Proof of cleaning uploads: User-generated before/after photos displayed as thumbnails
- Resident avatars: Circular, 32px-40px, placeholder initials if no photo
- Empty state illustrations: Simple SVG icons for "No tasks yet" or "All caught up!"

**Placement**
- Proof thumbnails: Right column of roster table
- Avatars: Next to resident names throughout
- Empty states: Centered in content area when applicable

## Accessibility

- High contrast ratios (WCAG AAA where possible)
- Keyboard navigation for all interactive elements
- Screen reader labels for status indicators and icons
- Focus visible states with 2px outline in primary color
- aria-labels for icon-only buttons

## Mobile Responsiveness

- Breakpoints: sm (640px), md (768px), lg (1024px)
- Tables collapse to card view below md
- Navigation becomes bottom tab bar on mobile
- Image uploads optimized for mobile camera access
- Touch targets minimum 44px × 44px