# Architecture Overview

Atlasify is a **client-side Next.js map application** with no dedicated backend. All state is managed in-browser; external data is fetched directly from third-party APIs.

---

## Modulith Structure

The application is organized as a **modulith** — a single Next.js app with clearly separated internal modules, each owning its own concern:

| Module       | Responsibility                                                   |
|--------------|------------------------------------------------------------------|
| `data`       | Type definitions and LocalStorage persistence schema             |
| `state`      | Global client state via Zustand                                  |
| `services`   | External API integrations (Geocoding, Weather)                   |
| `components` | UI rendering units (Map, Sidebar, SearchBar, WeatherWidget)      |
| `design`     | Design tokens, theme, and visual language                        |

```mermaid
block-beta
  columns 5
  data["📦 data\nTypes & Storage"]
  state["🗂️ state\nZustand Store"]
  services["🌐 services\nExternal APIs"]
  components["🧩 components\nUI Components"]
  design["🎨 design\nTokens & Theme"]

  data --> state
  services --> state
  state --> components
  design --> components
```

---

## Tech Stack

| Concern          | Technology                          |
|------------------|-------------------------------------|
| Framework        | Next.js (App Router)                |
| Map Rendering    | `react-map-gl` + `maplibre-gl`      |
| State Management | `zustand`                           |
| Styling          | Tailwind CSS + custom CSS           |
| Geocoding        | OpenStreetMap Nominatim (REST)      |
| Weather          | Open-Meteo (REST)                   |
| Geospatial Utils | `@turf/turf`                        |
| Charts           | `recharts`                          |
| Icons            | `lucide-react`                      |
| Persistence      | `localStorage`                      |

---

## Data Flow

```mermaid
flowchart TD
    User(["👤 User Interaction"])
    LS[("💾 localStorage")]
    Store(["🗂️ Zustand Store"])
    MC["🗺️ MapContainer"]
    SB["📋 Sidebar"]
    SR["🔍 SearchBar"]
    WW["🌤️ WeatherWidget"]
    Nom["🌍 Nominatim API"]
    OM["☁️ Open-Meteo API"]

    LS -- "hydrate savedPlaces on mount" --> Store
    User -- "interacts" --> Store
    User -- "types query" --> SR

    Store -- "mapStyle, flyToTrigger, routeWaypoints, mode" --> MC
    Store -- "savedPlaces, routeWaypoints" --> SB
    Store -- "selectedPlace" --> WW
    Store -- "searchResults" --> SR

    SR -- "GET /search?q=..." --> Nom
    Nom -- "SearchResult[]" --> Store

    WW -- "GET /v1/forecast?lat=..." --> OM
    OM -- "WeatherData" --> WW

    Store -- "write savedPlaces" --> LS

    style Store fill:#4c1d95,color:#fff,stroke:#7c3aed
    style LS fill:#1e3a5f,color:#fff,stroke:#3b82f6
    style Nom fill:#14532d,color:#fff,stroke:#22c55e
    style OM fill:#14532d,color:#fff,stroke:#22c55e
```

---

## Routing

Atlasify is a **single-page application**. All UI is rendered under the root route `/` via `app/page.tsx`. There are no additional pages or API routes.

---

## References

- [Data Models](../data/models.md)
- [State Management](../state/store.md)
- [External Services](../services/apis.md)
- [Component Specs](../components/components.md)
- [Design System](../design/theme.md)
