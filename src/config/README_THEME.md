# 🎨 Theme Configuration Guide

## Primary Color: #0d9c5c

**Brand Green**: `#0d9c5c` (Vibrant Agricultural Green)
- **RGB**: `rgb(13, 156, 92)`
- **HSL**: `hsl(153, 85%, 33%)`

---

## Usage

### In React/TypeScript Components

```typescript
import theme, { PRIMARY_COLOR, PRIMARY_GRADIENT } from '@/config/theme';

// Use colors
const buttonStyle = {
  backgroundColor: theme.colors.primary.main,
  color: theme.colors.primary.lightest,
};

// Use gradients
const heroStyle = {
  background: theme.colors.gradients.hero,
};
```

### In Tailwind Classes

The primary color is already configured in `tailwind.config.ts` and `index.css`:

```tsx
<button className="bg-primary text-primary-foreground">
  Click Me
</button>

<div className="bg-gradient-to-r from-green-600 to-emerald-600">
  Gradient Background
</div>
```

### Sidebar Colors

Sidebar uses the primary green color:
```tsx
<div className="bg-sidebar text-sidebar-foreground">
  Sidebar Content
</div>
```

---

## Available Color Scales

### Primary Green
- `primary.main` - #0d9c5c (Main brand color)
- `primary.light` - #10b56d (Lighter shade)
- `primary.lighter` - #14ce7e (Even lighter)
- `primary.lightest` - #e6f9f1 (Background tint)
- `primary.dark` - #0a7d49 (Darker shade)
- `primary.darker` - #085e36 (Even darker)
- `primary.darkest` - #053d24 (Deep dark)

### Gradients
- `gradients.primary` - Simple primary gradient
- `gradients.hero` - Hero section gradient
- `gradients.subtle` - Subtle background gradient
- `gradients.sidebar` - Sidebar gradient
- `gradients.button` - Button gradient
- `gradients.hover` - Hover state gradient

---

## Typography

### Fonts
```typescript
theme.fonts.primary   // System font stack
theme.fonts.heading   // Heading font stack
theme.fonts.mono      // Monospace font
```

### Font Sizes
```typescript
theme.fontSize.xs    // 12px
theme.fontSize.sm    // 14px
theme.fontSize.base  // 16px
theme.fontSize.lg    // 18px
theme.fontSize.xl    // 20px
theme.fontSize['2xl'] // 24px
theme.fontSize['3xl'] // 30px
theme.fontSize['4xl'] // 36px
theme.fontSize['5xl'] // 48px
```

### Font Weights
```typescript
theme.fontWeight.light     // 300
theme.fontWeight.normal    // 400
theme.fontWeight.medium    // 500
theme.fontWeight.semibold  // 600
theme.fontWeight.bold      // 700
theme.fontWeight.black     // 900
```

---

## Spacing

```typescript
theme.spacing.xs   // 4px
theme.spacing.sm   // 8px
theme.spacing.md   // 16px
theme.spacing.lg   // 24px
theme.spacing.xl   // 32px
theme.spacing['2xl'] // 48px
theme.spacing['3xl'] // 64px
```

---

## Shadows

```typescript
theme.shadows.sm        // Small shadow
theme.shadows.md        // Medium shadow
theme.shadows.lg        // Large shadow
theme.shadows.xl        // Extra large shadow
theme.shadows.green     // Green tinted shadow
theme.shadows.greenLg   // Large green shadow
```

---

## Component Styles

### Buttons

```typescript
// Primary Button
theme.components.button.primary.bg      // #0d9c5c
theme.components.button.primary.hover   // #10b56d
theme.components.button.primary.active  // #0a7d49

// Secondary Button
theme.components.button.secondary.bg    // #e6f9f1
theme.components.button.secondary.text  // #0d9c5c
```

### Cards

```typescript
theme.components.card.bg        // #ffffff
theme.components.card.border    // #e5e7eb
theme.components.card.shadow    // Subtle shadow
theme.components.card.hover     // Hover shadow
```

---

## Utility Functions

### withOpacity

Add opacity to any hex color:

```typescript
import { withOpacity } from '@/config/theme';

const semiTransparent = withOpacity('#0d9c5c', 0.5);
// Returns: 'rgba(13, 156, 92, 0.5)'
```

---

## Examples

### Green Button with Gradient

```tsx
import theme from '@/config/theme';

<button
  style={{
    background: theme.colors.gradients.button,
    color: theme.colors.text.inverse,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  }}
>
  Click Me
</button>
```

### Card with Green Shadow

```tsx
<div
  style={{
    background: theme.colors.background.main,
    boxShadow: theme.shadows.green,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  }}
>
  Card Content
</div>
```

### Hero Section with Gradient

```tsx
<div
  style={{
    background: theme.colors.gradients.hero,
    minHeight: '400px',
    color: theme.colors.text.inverse,
  }}
>
  <h1 style={{ fontSize: theme.fontSize['5xl'], fontWeight: theme.fontWeight.black }}>
    Welcome
  </h1>
</div>
```

---

## Tailwind Integration

The theme is already integrated with Tailwind CSS. Use these classes:

### Colors
- `text-primary` - Primary green text
- `bg-primary` - Primary green background
- `border-primary` - Primary green border
- `hover:bg-primary` - Primary green on hover

### Sidebar
- `bg-sidebar` - Sidebar background
- `text-sidebar-foreground` - Sidebar text
- `bg-sidebar-accent` - Sidebar hover/active state

### Custom Gradients
- `bg-gradient-to-r from-green-600 to-emerald-600`
- `bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50`

---

## Maintenance

To update the primary color:

1. Update `theme.ts`: Change `colors.primary.main`
2. Update `index.css`: Change `--primary` and `--sidebar-background`
3. Update `tailwind.config.ts`: If needed

**Current Primary Color**: `#0d9c5c`

---

**Last Updated**: April 17, 2026
**Brand Color**: #0d9c5c
**Theme Version**: 1.0.0