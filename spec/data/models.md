# Data Models & Types

All core TypeScript interfaces used across the application.

---

## SavedPlace (Bookmarks)

Represents a location saved by the user with metadata.

```typescript
interface SavedPlace {
  id: string;          // UUID v4
  name: string;        // User-defined title
  description: string; // Address or description
  lat: number;         // Latitude
  lng: number;         // Longitude
  category: "food" | "nature" | "work" | "cultural" | "other";
  color: string;       // Hex color for marker and analytics
  createdAt: string;   // ISO-8601 Timestamp
}
```

---

## SearchResult

Represents a place returned by the geocoding service.

```typescript
interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}
```

---

## LocalStorage Schema

Saved places are persisted client-side:

| Key                      | Value                     |
|--------------------------|---------------------------|
| `atlasify-saved-places`  | JSON array of `SavedPlace` |

The store hydrates from localStorage on mount and writes back on every modification to `savedPlaces`.

---

## Entity Relationships

```mermaid
erDiagram
  ZUSTAND_STORE {
    string mode
    string mapStyle
    object flyToTrigger
  }
  SAVED_PLACE {
    string id PK
    string name
    string description
    float  lat
    float  lng
    string category
    string color
    string createdAt
  }
  SEARCH_RESULT {
    string id PK
    string name
    float  lat
    float  lng
    string address
  }
  LOCAL_STORAGE {
    string key
    json   value
  }

  ZUSTAND_STORE ||--o{ SAVED_PLACE    : "savedPlaces[]"
  ZUSTAND_STORE ||--o{ SEARCH_RESULT  : "searchResults[]"
  ZUSTAND_STORE ||--o| SAVED_PLACE    : "selectedPlace (nullable)"
  ZUSTAND_STORE ||--o| SEARCH_RESULT  : "selectedPlace (nullable)"
  LOCAL_STORAGE ||--o{ SAVED_PLACE    : "atlasify-saved-places (JSON)"
```
