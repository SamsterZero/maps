# Component Specifications

All UI components are React client components rendered under `app/page.tsx`.

## Component Hierarchy

```mermaid
flowchart TD
  Page["app/page.tsx"]

  Page --> MC["MapContainer\ncomponents/map/MapContainer.tsx"]
  Page --> SB["Sidebar\ncomponents/map/Sidebar.tsx"]
  Page --> SR["SearchBar\ncomponents/map/SearchBar.tsx"]
  Page --> WW["WeatherWidget\ncomponents/map/WeatherWidget.tsx"]

  MC --> Tiles["Map Tiles\n(maplibre-gl)"]
  MC --> RL["Route Line Layer\n(LineString)"]
  MC --> RG["Route Glow Layer"]
  MC --> Markers["Place Markers"]
  MC --> GeoBtn["Geolocation Button"]
  MC --> ZoomCtrl["Zoom Controls"]

  SB --> T1["Tab: Bookmarks"]
  SB --> T2["Tab: Route Planner"]
  SB --> T3["Tab: Stats (Recharts)"]

  SR --> Input["Text Input"]
  SR --> Dropdown["Results Dropdown\n(glassmorphic)"]

  style Page fill:#4c1d95,color:#fff,stroke:#7c3aed
  style MC fill:#1e3a5f,color:#fff,stroke:#3b82f6
  style SB fill:#1e3a5f,color:#fff,stroke:#3b82f6
  style SR fill:#1e3a5f,color:#fff,stroke:#3b82f6
  style WW fill:#1e3a5f,color:#fff,stroke:#3b82f6
```

---

## MapContainer

Renders the interactive map canvas.

- **Library**: `react-map-gl` + `maplibre-gl`
- **File**: `components/map/MapContainer.tsx`

### Tile Style URLs

| Theme   | URL                                                                         |
|---------|-----------------------------------------------------------------------------|
| Dark    | `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`          |
| Light   | `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`             |
| Voyager | `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`              |

Active URL is driven by `store.mapStyle`.

### Layers

| Layer           | Type       | Source              | Style                                                   |
|-----------------|------------|---------------------|---------------------------------------------------------|
| Route Line      | `LineString` | `routeWaypoints`  | `line-color: "#8b5cf6"`, `line-width: 5`                |
| Route Glow      | `LineString` | `routeWaypoints`  | Wide low-opacity line beneath route line for glow effect |

### Controls

- **Geolocation**: Custom button — locates the user via the browser Geolocation API, sets `selectedPlace`, and triggers `flyToTrigger`.
- **Zoom**: Custom `+` / `−` overlay buttons.

### Events

- **onClick** (map): Behavior depends on `store.mode`:
  - `add-marker` → opens Save Place form at clicked `[lng, lat]`
  - `plan-route` → appends coordinate to `routeWaypoints`
  - `view` → no-op

```mermaid
flowchart TD
  Click(["map onClick\n[lng, lat]"]) --> Check{{"store.mode?"}}

  Check -- "view" --> Noop["no-op"]
  Check -- "add-marker" --> Form["open Save Place form\nat clicked coordinate"]
  Check -- "plan-route" --> Append["append coord\nto routeWaypoints"]

  Form --> Save{{"user action"}}
  Save -- "save" --> AddPlace["addSavedPlace()\nsetMode('view')"]
  Save -- "cancel" --> Cancel["setMode('view')"]

  Append --> Line["re-render RouteLineLayer\nvia routeWaypoints"]
```

---

## SearchBar

Floating geocoding input widget.

- **File**: `components/map/SearchBar.tsx`
- **Position**: Floating overlay, top of map
- **Service**: Nominatim (see [services/apis.md](../services/apis.md))
- **Debounce**: 600 ms

### Behavior

1. User types in the input field.
2. After 600 ms of inactivity, a Nominatim request is fired.
3. Results populate `store.searchResults` and render in a dropdown.
4. Selecting a result sets `store.selectedPlace` and fires `store.flyToTrigger`.

```mermaid
flowchart TD
  Input(["User types"]) --> Debounce{"600 ms debounce"}
  Debounce -- "still typing" --> Debounce
  Debounce -- "idle" --> Fetch["GET Nominatim /search"]
  Fetch --> Results["setSearchResults"]
  Results --> Dropdown["Render dropdown"]
  Dropdown --> Select(["User selects result"])
  Select --> SP["setSelectedPlace"]
  Select --> FT["flyTo trigger"]
```

### Visuals

- **Dropdown**: Glassmorphic panel with hover highlights per result item.

---

## WeatherWidget

Floating widget showing current weather at the active location.

- **File**: `components/map/WeatherWidget.tsx`
- **Position**: Floating overlay, bottom-left or top-right of map
- **Trigger**: Renders when `store.selectedPlace` is non-null

### Displayed Data

| Field           | Source Field              |
|-----------------|---------------------------|
| Temperature     | `current.temperature_2m`  |
| Condition icon  | `current.weather_code` → Lucide icon mapping |
| Wind Speed      | `current.wind_speed_10m`  |
| Humidity        | `current.relative_humidity_2m` |

---

## Sidebar

Collapsible panel with three tabs.

- **File**: `components/map/Sidebar.tsx`
- **Position**: Left overlay on top of map

### Tab 1 — Bookmarks

- Filter saved places by `category`
- Delete individual bookmarks
- Save a new place from a clicked coordinate (opens inline form)

### Tab 2 — Route Planner

- Lists all `routeWaypoints` in order
- Displays total route distance via `turf.length(line, { units: 'kilometers' })`
- Allows removing individual waypoints

### Tab 3 — Stats

- Groups `savedPlaces` by `category`
- Renders a bar chart per category count using **Recharts**
