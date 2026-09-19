# UI/UX Design System & Accessibility

## Design System

### Components Used

- **Buttons**: Consistent `h-10` height, `rounded-md`, `text-sm font-medium`
- **Inputs**: Consistent `h-10` height, `rounded-md`, focus ring
- **Cards**: `rounded-lg border border-border bg-card p-4/6`
- **Badges**: `rounded-full px-2 py-0.5 text-xs font-medium`
- **Modals**: Fixed overlay, `rounded-lg border border-border bg-card`
- **Tables**: Responsive with mobile card fallback
- **Empty States**: Icon + title + description + action pattern
- **Skeletons**: `animate-pulse rounded-md bg-accent`

### Typography

| Element | Style |
|---------|-------|
| Page title | `text-2xl font-bold text-foreground` |
| Section title | `text-sm font-medium text-foreground` |
| Body | `text-sm text-foreground` |
| Secondary | `text-sm text-muted-foreground` |
| Caption | `text-xs text-muted-foreground` |
| Code/slugs | `font-mono text-foreground` |

### Spacing

- Page padding: `p-4 sm:p-6`
- Card gap: `gap-4`
- Section margin: `mt-6`
- Element gap: `gap-2`

## Responsive Strategy

### Breakpoints

- Mobile: < 640px (single column, stacked layout)
- Tablet: 640px - 1024px (2 columns where appropriate)
- Desktop: > 1024px (sidebar + content, 4-column grids)

### Mobile Navigation

- Hamburger menu on mobile (< 1024px)
- Full sidebar on desktop (>= 1024px)
- Mobile nav slides down from header

### Link Library

- Desktop: Full table with all columns
- Mobile: Card-based layout with compact actions

### Charts

- ResponsiveContainer from Recharts handles all screen sizes
- Minimum height maintained for readability

## Accessibility

### Keyboard Navigation

- All interactive elements are focusable
- Visible focus states: `focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring`
- Modal focus management (focus trap not implemented, but Escape closes)
- Skip links not implemented (dashboard has clear navigation)

### ARIA

- `role="alert"` on error messages
- `role="navigation"` on nav elements
- `aria-label` on icon-only buttons
- `aria-current="page"` on active nav items
- `aria-live="polite"` on toast notifications

### Color Contrast

- Primary text: `text-foreground` (high contrast)
- Secondary text: `text-muted-foreground` (sufficient contrast)
- Error: `text-destructive-foreground` on `bg-destructive/10`
- Success: `text-green-700` on `bg-green-100`

### Images

- Avatar: `alt={`${name}'s avatar`}`
- Decorative icons: `aria-hidden` or hidden from screen readers

## Toast System

```javascript
import { useToast } from "../contexts/ToastContext";
const toast = useToast();
toast.success("Link created");
toast.error("Failed to create link");
toast.info("Copied to clipboard");
```

Toast auto-dismisses after 3 seconds.

## Empty States

Every data-dependent section has an empty state:
- Title explaining what happened
- Description with next steps
- Optional action button

## Loading States

- Page loads: Skeleton placeholders matching final layout
- Button actions: Disabled state with loading text
- Charts: Skeleton during data fetch

## Bio Themes

| Theme | Background | Text | Buttons |
|-------|-----------|------|---------|
| Minimal Light | Light gray | Dark | Gray borders |
| Dark Slate | Dark slate | White | Slate borders |
| Gradient | Purple→Blue→Cyan | White | Glass-morphism |

## Files Created/Modified

- `client/src/contexts/ToastContext.jsx` — Toast notification system
- `client/src/components/common/UIComponents.jsx` — EmptyState, Skeleton, StatCardSkeleton
- `client/src/pages/NotFound.jsx` — 404 page
- `client/src/layouts/DashboardLayout.jsx` — Mobile navigation
- `client/src/pages/Login.jsx` — Polished auth page
- `client/src/pages/Register.jsx` — Polished auth page
- `client/src/pages/ForgotPassword.jsx` — Polished auth page
- `client/src/pages/ResetPassword.jsx` — Polished auth page
- `client/src/pages/VerifyEmail.jsx` — Polished with status icons
- `client/src/pages/Dashboard.jsx` — Real overview data
- `client/src/pages/Links.jsx` — Toast feedback, mobile cards, empty states
- `client/src/pages/Analytics.jsx` — Skeletons, empty states
- `client/src/pages/LinkAnalytics.jsx` — Better loading/error/empty states
- `client/src/pages/BioEditor.jsx` — Toast feedback
