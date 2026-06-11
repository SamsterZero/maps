# External Service APIs

Atlasify integrates with two external REST APIs. Both are free and require no API key.

---

## Geocoding — OpenStreetMap Nominatim

Used by **SearchBar** for place autocomplete.

- **Base URL**: `https://nominatim.openstreetmap.org/search`
- **Method**: `GET`
- **Debounce**: Requests are throttled with a **600 ms** input debounce to avoid rate-limiting.

### Query Parameters

| Parameter       | Value              | Description                      |
|-----------------|--------------------|----------------------------------|
| `q`             | `string`           | Search query text from user input |
| `format`        | `json`             | Response format                  |
| `addressdetails`| `1`                | Include full address breakdown    |
| `limit`         | `5`                | Max results returned             |

### Request / Response Flow

```mermaid
sequenceDiagram
  actor User
  participant SearchBar
  participant Store as Zustand Store
  participant Nom as Nominatim API

  User->>SearchBar: types query text
  Note over SearchBar: 600 ms debounce
  SearchBar->>Nom: GET /search?q=...&format=json&limit=5
  Nom-->>SearchBar: NominatimItem[]
  SearchBar->>SearchBar: map items → SearchResult[]
  SearchBar->>Store: setSearchResults(results)
  Store-->>SearchBar: searchResults updated
  SearchBar-->>User: renders dropdown
  User->>SearchBar: selects a result
  SearchBar->>Store: setSelectedPlace(result)
  SearchBar->>Store: flyTo(lat, lng, zoom)
```

### Response Mapping → `SearchResult`

```typescript
// Nominatim response item → SearchResult
{
  id:      item.place_id,
  name:    item.display_name,
  lat:     parseFloat(item.lat),
  lng:     parseFloat(item.lon),
  address: item.display_name,
}
```

---

## Weather — Open-Meteo

Used by **WeatherWidget** to display current conditions at `selectedPlace`.

- **Base URL**: `https://api.open-meteo.com/v1/forecast`
- **Method**: `GET`
- **Trigger**: Fires whenever `selectedPlace` changes to a non-null value.

### Query Parameters

| Parameter   | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| `latitude`  | `selectedPlace.lat`                                                   |
| `longitude` | `selectedPlace.lng`                                                   |
| `current`   | `temperature_2m,is_day,weather_code,wind_speed_10m,relative_humidity_2m` |

### Request / Response Flow

```mermaid
sequenceDiagram
  participant Store as Zustand Store
  participant WW as WeatherWidget
  participant OM as Open-Meteo API

  Store-->>WW: selectedPlace changes (non-null)
  WW->>OM: GET /v1/forecast?latitude=...&longitude=...&current=...
  alt success
    OM-->>WW: { current: { temperature_2m, weather_code, ... } }
    WW-->>WW: map weather_code → Lucide icon
    WW-->>WW: render temperature, wind, humidity
  else error / network failure
    OM-->>WW: error response
    WW-->>WW: show error state / hide widget
  end
```

### Displayed Fields

| API Field              | UI Label       | Notes                                  |
|------------------------|----------------|----------------------------------------|
| `temperature_2m`       | Temperature    | Degrees Celsius                        |
| `weather_code`         | Condition icon | Mapped to Lucide icons                 |
| `wind_speed_10m`       | Wind Speed     | km/h                                   |
| `relative_humidity_2m` | Humidity       | Percentage                             |
| `is_day`               | Day/Night hint | Used for icon variant selection        |

---

## Internal Logic / Geospatial

| Utility            | Library     | Usage                                               |
|--------------------|-------------|-----------------------------------------------------|
| Route distance     | `@turf/turf` | `turf.length(line, { units: 'kilometers' })` — computes total route length from `routeWaypoints` |

```mermaid
flowchart LR
  WP["routeWaypoints\n[ lng, lat ][]"]
  GJ["GeoJSON LineString\n turf.lineString(waypoints)"]
  D["Distance (km)\n turf.length(line, 'kilometers')"]
  UI["Sidebar — Route Planner\ndisplays total distance"]

  WP --> GJ --> D --> UI
```
