# Design System & Theme

---

## Color Palette

| Role            | Value / Class                                   | Usage                                       |
|-----------------|-------------------------------------------------|---------------------------------------------|
| Primary Accent  | `violet-600 → indigo-500` gradient              | Buttons, active tabs, route line color      |
| Route Line      | `#8b5cf6` (violet-500)                          | Map route `LineString` layer                |
| Background (dark) | `bg-zinc-950/80`                              | Glassmorphic panel base in dark mode        |
| Background (light)| `bg-white/80`                                 | Glassmorphic panel base in light mode       |
| Border          | `border border-white/10` or `border-zinc-800`   | Subtle panel borders                        |

```mermaid
flowchart LR
  subgraph Accent ["Primary Accent — violet-600 → indigo-500"]
    A1["Buttons"]
    A2["Active Tabs"]
    A3["Route Line #8b5cf6"]
  end
  subgraph Bg ["Panel Backgrounds"]
    B1["Dark  bg-zinc-950/80"]
    B2["Light bg-white/80"]
  end
  subgraph Border ["Borders"]
    C1["border-white/10 (dark)"]
    C2["border-zinc-800 (light)"]
  end
  subgraph Text ["Typography"]
    T1["text-zinc-400  labels"]
    T2["text-violet-400  active"]
  end

  style Accent fill:#4c1d95,color:#fff,stroke:#7c3aed
  style Bg fill:#18181b,color:#fff,stroke:#52525b
  style Border fill:#27272a,color:#fff,stroke:#3f3f46
  style Text fill:#1e1b4b,color:#fff,stroke:#4338ca
```

---

## Glassmorphism

All floating panels (Sidebar, SearchBar dropdown, WeatherWidget) use a consistent frosted-glass treatment:

```css
/* Glassmorphic panel */
backdrop-filter: blur(24px);          /* backdrop-blur-xl */
background: rgba(9, 9, 11, 0.80);    /* bg-zinc-950/80 in dark mode */
border: 1px solid rgba(255,255,255,0.08);
border-radius: 1rem;
```

Light mode swaps `bg-zinc-950/80` → `bg-white/80`.

---

## Typography

| Element       | Class / Style               |
|---------------|-----------------------------|
| Body          | System font stack (Next.js default) |
| UI Labels     | `text-sm`, `text-zinc-400`  |
| Headings      | `text-base font-semibold`   |
| Active/accent | `text-violet-400`           |

---

## Layout

- **Root**: `h-screen w-screen overflow-hidden` — full-viewport, no scroll
- **Map**: Fills the entire viewport as the base layer
- **Panels**: Positioned absolutely over the map (`position: absolute` / Tailwind `absolute`)
  - Sidebar: left edge, full height
  - SearchBar: top-center or top-left
  - WeatherWidget: bottom-left or top-right

```mermaid
flowchart TB
  subgraph Viewport ["Viewport  h-screen w-screen"]
    Map["🗺️ MapContainer\n(base layer — fills 100%)"]

    subgraph Overlays ["Absolute overlays"]
      direction LR
      SB["🔍 SearchBar\ntop-left / top-center"]
      WW["🌤️ WeatherWidget\nbottom-left / top-right"]
    end

    Sidebar["📋 Sidebar\nleft edge, full height"]
  end

  Map -.-> Overlays
  Map -.-> Sidebar

  style Map fill:#0f172a,color:#94a3b8,stroke:#334155
  style Sidebar fill:#4c1d95,color:#fff,stroke:#7c3aed
  style SB fill:#1e3a5f,color:#fff,stroke:#3b82f6
  style WW fill:#14532d,color:#fff,stroke:#22c55e
  style Viewport fill:#09090b,color:#71717a,stroke:#27272a
```

## Map Themes

The map itself has three visual themes controlled by `store.mapStyle`:

| Value     | Tile Style   | Feel                     |
|-----------|--------------|--------------------------|
| `dark`    | Dark Matter  | Nighttime / high-contrast |
| `light`   | Positron     | Clean / minimal           |
| `voyager` | Voyager      | Outdoor / topographic     |

---

## Interactive States

| Element         | Default          | Hover / Active                          |
|-----------------|------------------|-----------------------------------------|
| Sidebar tab     | `text-zinc-400`  | Gradient underline, `text-violet-400`   |
| Bookmark card   | Subtle border    | Slight background lift                  |
| Button (primary)| Violet-indigo gradient | Brightness increase on hover       |
| Search result   | Transparent      | `bg-white/10` highlight                 |
