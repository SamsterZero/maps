# State Management

Client-side global state is managed with **Zustand**. There is no server state; all data is local or fetched on demand.

---

## Store Variables

| Variable         | Type                                      | Description                                                      |
|------------------|-------------------------------------------|------------------------------------------------------------------|
| `mode`           | `'view' \| 'add-marker' \| 'plan-route'`  | Controls map interaction mode                                    |
| `mapStyle`       | `'dark' \| 'light' \| 'voyager'`          | Active tile stylesheet                                           |
| `savedPlaces`    | `SavedPlace[]`                            | User bookmarks — synced with `localStorage` on every write       |
| `selectedPlace`  | `SavedPlace \| SearchResult \| null`      | Active focused point on the map (from search or click)           |
| `searchResults`  | `SearchResult[]`                          | Autocomplete suggestions from Nominatim                          |
| `routeWaypoints` | `[lng, lat][]`                            | Ordered coordinate list used for route path plotting             |
| `flyToTrigger`   | `{ lat: number; lng: number; zoom: number } \| null` | Navigation command — consumed by MapContainer       |

```mermaid
classDiagram
  class AtlasifyStore {
    +mode: 'view' | 'add-marker' | 'plan-route'
    +mapStyle: 'dark' | 'light' | 'voyager'
    +savedPlaces: SavedPlace[]
    +selectedPlace: SavedPlace | SearchResult | null
    +searchResults: SearchResult[]
    +routeWaypoints: [lng, lat][]
    +flyToTrigger: FlyToPayload | null
    +setMode(mode) void
    +setMapStyle(style) void
    +addSavedPlace(place) void
    +removeSavedPlace(id) void
    +setSelectedPlace(place) void
    +setSearchResults(results) void
    +addWaypoint(coord) void
    +clearWaypoints() void
    +flyTo(lat, lng, zoom) void
  }
  class SavedPlace {
    +id: string
    +name: string
    +lat: number
    +lng: number
    +category: string
    +color: string
    +createdAt: string
  }
  class SearchResult {
    +id: string
    +name: string
    +lat: number
    +lng: number
    +address: string
  }
  AtlasifyStore "1" --> "*" SavedPlace : savedPlaces
  AtlasifyStore "1" --> "*" SearchResult : searchResults
  AtlasifyStore "1" --> "0..1" SavedPlace : selectedPlace
```

---

## Persistence

- On mount, the store hydrates `savedPlaces` from `localStorage` key `atlasify-saved-places`.
- Any mutation to `savedPlaces` immediately writes the updated array back to `localStorage`.

---

## Mode Behavior

| Mode           | Map Behavior                                                        |
|----------------|---------------------------------------------------------------------|
| `view`         | Default — pan and zoom only                                         |
| `add-marker`   | Next map click opens the "Save Place" form at the clicked coordinate |
| `plan-route`   | Each map click appends a waypoint to `routeWaypoints`               |

```mermaid
stateDiagram-v2
  direction LR
  [*] --> view : app load

  view --> add_marker : setMode('add-marker')
  view --> plan_route : setMode('plan-route')

  add_marker --> view : place saved / cancelled
  plan_route --> view : setMode('view')

  state add_marker {
    [*] --> waiting_for_click
    waiting_for_click --> form_open : map click
    form_open --> [*] : save / cancel
  }

  state plan_route {
    [*] --> accumulating
    accumulating --> accumulating : map click → append waypoint
    accumulating --> [*] : clearWaypoints()
  }
```

---

## References

- Implementation: [`lib/store.ts`](../../lib/store.ts)
- Type definitions: [`data/models.md`](../data/models.md)
