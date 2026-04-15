# Last-Mile Sprint — Design DNA

> Design tokens derived from the project's dark transit dashboard aesthetic
> (inspired by the Stitch "Last-Mile Sprint Dashboard" project screenshot).
> Stitch MCP server was not available at generation time; tokens were extracted
> manually from the reference screenshot and project context.

---

## Color Palette

### Base / Background
| Token             | Hex       | Usage                              |
|-------------------|-----------|------------------------------------|
| `bg-base`         | `#0D0D0D` | App canvas, map background         |
| `bg-surface`      | `#141414` | Sidebar, card body                 |
| `bg-surface-2`    | `#1C1C1C` | Elevated cards, hover states       |
| `bg-surface-3`    | `#242424` | Inputs, secondary panels           |
| `bg-overlay`      | `rgba(255,255,255,0.03)` | Map tile grid overlay |

### Brand / Accent — Teal
| Token             | Hex       | Usage                              |
|-------------------|-----------|------------------------------------|
| `accent-teal`     | `#00BFA5` | Active states, borders, pills      |
| `accent-teal-dim` | `#00897B` | Hover on teal elements             |
| `accent-teal-bg`  | `rgba(0,191,165,0.12)` | Teal surface tint    |

### Semantic — Verdict Colors
| Token             | Hex / Class      | Verdict           |
|-------------------|------------------|-------------------|
| `verdict-walk`    | `#22C55E` (green-500) | WALK         |
| `verdict-brisk`   | `#EAB308` (yellow-500) | WALK BRISKLY |
| `verdict-sprint`  | `#F97316` (orange-500) | SPRINT       |
| `verdict-wait`    | `#EF4444` (red-500) | WAIT FOR NEXT  |

### Text
| Token             | Hex       | Usage                              |
|-------------------|-----------|------------------------------------|
| `text-primary`    | `#F5F5F5` | Headings, vehicle names            |
| `text-secondary`  | `#A0A0A0` | Labels, metadata                   |
| `text-muted`      | `#5A5A5A` | Disabled, placeholders             |
| `text-teal`       | `#00BFA5` | Active stop names, teal text       |

### Border
| Token             | Hex       | Usage                              |
|-------------------|-----------|------------------------------------|
| `border-default`  | `#2A2A2A` | Card borders, dividers             |
| `border-active`   | `#00BFA5` | Active sidebar item left border    |

---

## Typography

### Font Stack
```
Primary:   'Inter', 'DM Sans', system-ui, sans-serif
Monospace: 'JetBrains Mono', 'Fira Code', monospace  (used for time/buffer values)
```

### Scale
| Token        | Size    | Weight | Line Height | Usage                    |
|--------------|---------|--------|-------------|--------------------------|
| `text-app-title` | 15px | 700   | 1.2         | "Last-Mile Sprint" sidebar title |
| `text-vehicle`   | 18px | 700   | 1.3         | Vehicle name on card     |
| `text-platform`  | 11px | 600   | 1           | Platform badge text      |
| `text-label`     | 11px | 500   | 1.4         | Data row labels          |
| `text-value`     | 14px | 600   | 1.4         | Data row values (mono)   |
| `text-stop`      | 13px | 500   | 1.5         | Stop list items          |
| `text-verdict`   | 12px | 700   | 1           | Verdict banner text      |
| `text-pace`      | 12px | 600   | 1           | Pace pill labels         |

---

## Spacing Scale

Based on 4px base unit:

| Token    | Value  | Usage                              |
|----------|--------|------------------------------------|
| `sp-1`   | `4px`  | Micro gaps                         |
| `sp-2`   | `8px`  | Icon + label gaps                  |
| `sp-3`   | `12px` | Inner card padding (tight)         |
| `sp-4`   | `16px` | Card padding, section gaps         |
| `sp-5`   | `20px` | Sidebar padding                    |
| `sp-6`   | `24px` | Card-to-card gap                   |
| `sp-8`   | `32px` | Section separators                 |

---

## Border Radius

| Token      | Value   | Usage                              |
|------------|---------|------------------------------------|
| `radius-sm`| `4px`   | Badges, pills                      |
| `radius-md`| `8px`   | Cards, inputs                      |
| `radius-lg`| `12px`  | Modals, large panels               |
| `radius-full` | `9999px` | Pace toggle pills, round badges |

---

## Component Specs

### Sidebar
```
Width:          260px (desktop), 100% (mobile drawer)
Background:     #141414
Border-right:   1px solid #2A2A2A
Padding:        20px 16px
```

#### App Title
```
Font:           15px / 700 / Inter
Color:          #F5F5F5
Icon:           ⚡ or lightning bolt SVG (teal, 16×16)
Gap:            8px between icon and text
```

#### Stop List Item
```
Padding:        10px 12px
Border-radius:  6px
Font:           13px / 500
Color (default): #A0A0A0
Color (active):  #00BFA5
Border-left (active): 3px solid #00BFA5
Background (active):  rgba(0,191,165,0.08)
Hover background: rgba(255,255,255,0.04)
```

#### Pace Toggle
```
Container bg:   #1C1C1C
Border-radius:  9999px
Padding:        4px
Gap:            2px
Pill (default): transparent, color #A0A0A0, 12px/600
Pill (active):  bg #00BFA5, color #0D0D0D, 12px/700
Pill padding:   6px 16px
```

### Departure Card
```
Background:     #141414
Border:         1px solid #2A2A2A
Border-radius:  10px
Overflow:       hidden
Min-width:      260px
```

#### Card Header
```
Padding:        16px 16px 12px
Vehicle name:   18px / 700 / #F5F5F5
```

#### Platform Badge
```
Background:     rgba(0,191,165,0.15)
Color:          #00BFA5
Font:           11px / 600
Padding:        3px 8px
Border-radius:  9999px
Border:         1px solid rgba(0,191,165,0.3)
```

#### Data Rows
```
Padding:        0 16px 16px
Row gap:        10px
Label:          11px / 500 / #5A5A5A / uppercase / letter-spacing: 0.05em
Value:          14px / 600 / #F5F5F5 / monospace
```

#### Verdict Banner
```
Width:          100% (full card width)
Padding:        10px 16px
Font:           12px / 700 / #0D0D0D (dark text on colored bg)
Text-transform: uppercase
Letter-spacing: 0.08em
Colors:
  WALK           → #22C55E
  WALK BRISKLY   → #EAB308
  SPRINT         → #F97316
  WAIT FOR NEXT  → #EF4444
```

### Loading Spinner
```
Size:           40px × 40px
Border:         3px solid rgba(0,191,165,0.2)
Border-top:     3px solid #00BFA5
Border-radius:  50%
Animation:      spin 0.8s linear infinite
```

---

## Layout

### Desktop Grid
```
App layout:     flex row (sidebar + main)
Cards grid:     3-column CSS grid, gap 20px
Card min-width: 260px
Main padding:   24px
```

### Mobile
```
App layout:     flex column
Sidebar:        collapsible or top bar
Cards grid:     1-column stack, gap 16px
```

---

## Map Background CSS
```css
background-color: #0D0D0D;
background-image:
  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
background-size: 40px 40px;
```

---

## Tailwind Config Tokens

```js
// tailwind.config.js extensions
colors: {
  base: '#0D0D0D',
  surface: '#141414',
  surface2: '#1C1C1C',
  surface3: '#242424',
  teal: {
    DEFAULT: '#00BFA5',
    dim: '#00897B',
    bg: 'rgba(0,191,165,0.12)',
  },
  border: '#2A2A2A',
  txt: {
    primary: '#F5F5F5',
    secondary: '#A0A0A0',
    muted: '#5A5A5A',
  },
}
```
