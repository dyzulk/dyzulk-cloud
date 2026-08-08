---
name: neobrutalism-shadcn
description: "Activate when the user mentions neobrutalism, neo-brutalism, neobrutalist, thick borders with hard shadows, or wants to install/style components from neobrutalism.dev. Also activate when working with CSS variables like --main, --shadow, --box-shadow-x, --box-shadow-y, --border-radius, --overlay, --secondary-background, --main-foreground, or Tailwind classes like bg-main, shadow-shadow, rounded-base, font-heading, font-base. Activate when the user runs `pnpm dlx shadcn@latest add https://neobrutalism.dev/r/...` or references the neobrutalism.dev registry. Skip for standard shadcn/ui styling without neobrutalism, general Tailwind questions, or backend PHP logic."
license: MIT
metadata:
  author: dyzulk
---

# Neobrutalism shadcn/ui Development

## When to Apply

Activate this skill when:

- Creating or modifying UI components with neobrutalism styling (thick borders, hard shadows, bold colors)
- Installing components from the `neobrutalism.dev` registry
- Working with neobrutalism-specific CSS variables (`--main`, `--shadow`, `--box-shadow-x`, etc.)
- Styling existing shadcn/ui components in the neobrutalism aesthetic
- Customizing the neobrutalism color theme or shadow configuration
- Building new pages or layouts that should follow the neobrutalism design system

## Documentation

- Official site: https://www.neobrutalism.dev
- GitHub repository: https://github.com/ekmas/neobrutalism-components
- Components are installed via the shadcn CLI pointing to the neobrutalism.dev registry

## Design Principles

Neobrutalism is characterized by:

1. **Thick Black Borders**: All containers, buttons, and interactive elements use `border-2 border-border` (solid black).
2. **Hard Shadows (No Blur)**: Shadows are flat with zero blur radius: `var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border)`.
3. **Bold, Vibrant Colors**: High-contrast palettes with saturated accent colors against stark backgrounds.
4. **Small Border Radius**: Sharp-ish corners with `--border-radius: 5px` (mapped to `rounded-base`).
5. **Bold Typography**: Headings use `font-weight: 700` and body text uses `font-weight: 500`.
6. **Interactive Translate Effects**: Buttons and cards shift position on hover/active using `translate` instead of shadow changes.

## CSS Variables Reference

The neobrutalism design system uses the following CSS variables. These must be defined in the project's global CSS file (e.g., `resources/css/app.css`).

### Root Variables (Light Mode)

```css
:root {
  --border-radius: 5px;
  --box-shadow-x: 4px;
  --box-shadow-y: 4px;
  --reverse-box-shadow-x: -4px;
  --reverse-box-shadow-y: -4px;

  --heading-font-weight: 700;
  --base-font-weight: 500;

  --background: oklch(93.46% 0.0304 254.32);
  --secondary-background: oklch(100% 0 0);
  --foreground: oklch(0% 0 0);
  --main-foreground: oklch(0% 0 0);

  --main: oklch(67.47% 0.1725 259.61);
  --border: oklch(0% 0 0);
  --ring: oklch(0% 0 0);
  --overlay: oklch(0% 0 0 / 0.8);

  --shadow: var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border);

  --chart-1: oklch(67.47% 0.1726 259.49);
  --chart-2: oklch(67.28% 0.2147 24.22);
  --chart-3: oklch(86.03% 0.176 92.36);
  --chart-4: oklch(79.76% 0.2044 153.08);
  --chart-5: oklch(66.34% 0.1806 277.2);
  --chart-active-dot: #000;
}
```

### Dark Mode Variables

```css
.dark {
  --background: oklch(29.12% 0.0633 270.86);
  --secondary-background: oklch(23.93% 0 0);
  --foreground: oklch(92.49% 0 0);
  --main-foreground: oklch(0% 0 0);

  --border: oklch(0% 0 0);
  --ring: oklch(100% 0 0);

  --shadow: var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border);

  --chart-active-dot: #fff;
}
```

### Tailwind v4 Theme Mapping

The CSS variables must be mapped to Tailwind utility classes via `@theme inline`:

```css
@theme inline {
  --color-main: var(--main);
  --color-background: var(--background);
  --color-secondary-background: var(--secondary-background);
  --color-foreground: var(--foreground);
  --color-main-foreground: var(--main-foreground);
  --color-border: var(--border);
  --color-overlay: var(--overlay);
  --color-ring: var(--ring);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --spacing-boxShadowX: var(--box-shadow-x);
  --spacing-boxShadowY: var(--box-shadow-y);
  --spacing-reverseBoxShadowX: var(--reverse-box-shadow-x);
  --spacing-reverseBoxShadowY: var(--reverse-box-shadow-y);

  --radius-base: var(--border-radius);

  --shadow-shadow: var(--shadow);
  --shadow-nav: 4px 4px 0px 0px var(--border);

  --font-weight-base: var(--base-font-weight);
  --font-weight-heading: var(--heading-font-weight);
}
```

### Base Layer

```css
@layer base {
  body {
    @apply text-foreground font-base;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

## Tailwind Utility Class Mapping

These are the Tailwind utility classes created by the `@theme inline` mapping:

| CSS Variable | Tailwind Class | Usage |
|---|---|---|
| `--main` | `bg-main`, `text-main` | Primary accent color |
| `--background` | `bg-background` | Page/section background |
| `--secondary-background` | `bg-secondary-background` | Card/panel backgrounds |
| `--foreground` | `text-foreground` | Primary text color |
| `--main-foreground` | `text-main-foreground` | Text on `bg-main` elements |
| `--border` | `border-border` | All border colors |
| `--overlay` | `bg-overlay` | Modal/dialog overlays |
| `--border-radius` | `rounded-base` | Standard border radius |
| `--shadow` | `shadow-shadow` | Standard hard shadow |
| `--box-shadow-x/y` | `translate-x-boxShadowX` | Hover/active translate offsets |
| `--reverse-box-shadow-x/y` | `translate-x-reverseBoxShadowX` | Reverse translate offsets |
| `--base-font-weight` | `font-base` | Body text weight (500) |
| `--heading-font-weight` | `font-heading` | Heading weight (700) |

## Installing Components

### Via shadcn CLI (Recommended)

Install components directly from the neobrutalism.dev registry:

```powershell
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/<component-name>.json
```

Example component installations:

```powershell
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/button.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/accordion.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/card.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/dialog.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/input.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/select.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/badge.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/tooltip.json
```

The CLI downloads the component code into the local `@/components/ui/` directory, overwriting the existing shadcn/ui version with the neobrutalism-styled variant.

### Manual Installation

For components not available via the registry, or when customizing heavily:

1. Copy the component code from the neobrutalism.dev docs page
2. Place it in `@/components/ui/<component-name>.tsx`
3. Install the required peer dependencies (typically `@radix-ui/*` and `lucide-react`)

## Styling Patterns

### Button Pattern

Neobrutalism buttons use hard shadows and translate on interaction:

```tsx
<button className="bg-main text-main-foreground border-2 border-border rounded-base shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
  Click me
</button>
```

### Card Pattern

```tsx
<div className="bg-secondary-background border-2 border-border rounded-base shadow-shadow p-4">
  <h3 className="font-heading">Card Title</h3>
  <p className="font-base">Card content goes here.</p>
</div>
```

### Input Pattern

```tsx
<input
  className="bg-secondary-background border-2 border-border rounded-base px-3 py-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
  placeholder="Type here..."
/>
```

### Overlay/Dialog Pattern

```tsx
<div className="fixed inset-0 bg-overlay z-50">
  <div className="bg-secondary-background border-2 border-border rounded-base shadow-shadow p-6">
    Dialog content
  </div>
</div>
```

## Color Customization

The `--main` color determines the primary accent. To change the color theme, update the `--main` variable in `:root`. Available presets from neobrutalism.dev include:

| Color | OKLCH Value |
|---|---|
| Blue (default) | `oklch(67.47% 0.1725 259.61)` |
| Red | `oklch(67.28% 0.2147 24.22)` |
| Yellow | `oklch(86.03% 0.176 92.36)` |
| Green | `oklch(79.76% 0.2044 153.08)` |
| Purple | `oklch(66.34% 0.1806 277.2)` |

Changing `--main` automatically propagates to all components using `bg-main`, `text-main`, etc.

## Differences from Standard shadcn/ui

| Feature | Standard shadcn/ui | Neobrutalism |
|---|---|---|
| Borders | `border` (1px subtle) | `border-2 border-border` (2px black) |
| Shadows | Soft with blur (`shadow-sm`) | Hard, no blur (`shadow-shadow`) |
| Border Radius | `--radius: 0.625rem` | `--border-radius: 5px` (`rounded-base`) |
| Colors | Neutral oklch palette | High-contrast with vibrant `--main` |
| Typography | System default weights | `font-heading: 700`, `font-base: 500` |
| Hover Effect | Color/opacity changes | `translate` + shadow removal |
| Background | White/Dark | Tinted pastel (`oklch(93.46% ...)`) |

## Common Pitfalls

- Using `rounded-lg` or `rounded-md` instead of `rounded-base` for the neobrutalism border radius
- Using `shadow-sm` or `shadow-md` instead of `shadow-shadow` for the hard shadow effect
- Forgetting to define `--shadow` in `.dark` mode (it must be redefined since `--border` changes)
- Using standard shadcn color tokens (`--primary`, `--secondary`) instead of neobrutalism tokens (`--main`, `--secondary-background`)
- Not applying `border-2 border-border` to interactive elements (the thick border is essential to the aesthetic)
- Using `hover:shadow-lg` instead of `hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none` for the interactive press effect
- Mixing standard shadcn/ui components with neobrutalism components without updating the CSS variables (they use different token names)
- Using native HTML select elements (e.g., NativeSelect). Never use native HTML `<select>` elements in the UI. Always use custom Radix-based `<Select>` components or custom `<Combobox>` with search for searchable options.
