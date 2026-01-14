# API Contract for GeoRoute Optimizer

**Version**: 1.0  
**Last Updated**: 2026-01-14  
**Base URL**: 
- Local: `http://localhost:7001/api`
- Production: `https://georoute-func.azurewebsites.net/api` (Azure Functions)

---

## 1. Lodging Zone Calculation

Calculates the geometric center (centroid) of the provided Points of Interest (POIs) and defines a buffer zone for lodging recommendations.

### Endpoint
`POST /lodging/calculate`

### Request Headers
| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |

### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `points` | `Array<Object>` | Yes | List of POIs to include in the calculation. |
| `points[].id` | `string` | Yes | Unique identifier for the POI. |
| `points[].name` | `string` | Yes | Name of the POI. |
| `points[].lat` | `number` | Yes | Latitude of the POI. |
| `points[].lng` | `number` | Yes | Longitude of the POI. |
| `bufferRadiusKm` | `number` | No | Radius in kilometers for the lodging search area. Default: `5` (per frontend implementation). |

#### Example Request
```json
{
  "points": [
    { "id": "p1", "name": "Banff Gondola", "lat": 51.1483, "lng": -115.5700 },
    { "id": "p2", "name": "Lake Louise", "lat": 51.4167, "lng": -116.2167 }
  ],
  "bufferRadiusKm": 15
}
```

### Response Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `centroid` | `Object` | The calculated geometric center. |
| `centroid.lat` | `number` | Latitude of the centroid. |
| `centroid.lng` | `number` | Longitude of the centroid. |
| `bufferRadiusKm` | `number` | The radius used for the calculation. |
| `bookingLinks` | `Object` | (Optional) Pre-generated links for booking services. |
| `bookingLinks.bookingCom` | `string` | Search URL for Booking.com. |
| `bookingLinks.airbnb` | `string` | Search URL for Airbnb. |

#### Example Response
```json
{
  "centroid": { "lat": 51.2956, "lng": -115.9909 },
  "bufferRadiusKm": 15,
  "bookingLinks": {
    "bookingCom": "https://www.booking.com/searchresults.html?ss=51.2956,-115.9909&radius=15",
    "airbnb": "https://www.airbnb.com/s/homes?lat=51.2956&lng=-115.9909"
  }
}
```

---

## 2. Route Optimization

Calculates the optimal order of stops for a given set of POIs. Supports both "Loop" (return to start) and "One-Way" modes. Can also recalculate metrics for a manually defined sequence.

### Endpoint
`POST /route/optimize`

### Request Headers
| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |

### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `points` | `Array<Object>` | Yes | List of POIs to visit. Structure same as in Lodging request. |
| `startLocation` | `Object` | No | The starting point (Hotel, Airport, etc.). Nullable. |
| `startLocation.name` | `string` | Yes | Name of the start location. |
| `startLocation.lat` | `number` | Yes | Latitude. |
| `startLocation.lng` | `number` | Yes | Longitude. |
| `routeMode` | `string` | Yes | `"loop"` (return to start) or `"one-way"` (end at last stop). Default: `"loop"`. |
| `optimizeSequence` | `boolean` | Yes | `true` to let backend reorder points; `false` to respect `manualSequence`. |
| `manualSequence` | `Array<string>` | No | List of POI IDs in specific order. Required if `optimizeSequence` is `false`. |

#### Example Request
```json
{
  "points": [
    { "id": "p1", "name": "Stop A", "lat": 51.1, "lng": -115.5 },
    { "id": "p2", "name": "Stop B", "lat": 51.2, "lng": -115.6 }
  ],
  "startLocation": { "name": "My Hotel", "lat": 51.0, "lng": -115.0 },
  "routeMode": "loop",
  "optimizeSequence": true,
  "manualSequence": null
}
```

### Response Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `sequence` | `Array<string>` | The optimized order of POI IDs. |
| `routeMode` | `string` | The mode used for calculation (`"loop"` or `"one-way"`). |

> [!NOTE]
> Distance, duration, and turn-by-turn legs are **not** returned by the backend. The frontend uses the optimized `sequence` to query the ArcGIS Route Service directly for real-world road metrics and geometry.

#### Example Response
```json
{
  "sequence": ["p1", "p2"],
  "routeMode": "loop"
}
```

---

## 3. PDF Export

Generates a PDF itinerary for the current route and POIs.

### Endpoint
`POST /export/pdf`

### Request Headers
| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |

### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `route` | `Object` | Yes | The complete `OptimizedRoute` object returned from `/route/optimize`. |
| `points` | `Array<Object>` | Yes | The list of POIs (same structure as above) to include details for. |
| `startLocation` | `Object` | No | The starting location definition. |

#### Example Request
```json
{
  "route": {
    "sequence": ["p1", "p2"],
    "routeMode": "loop"
  },
  "points": [ ... ],
  "startLocation": { ... }
}
```

### Response
- **Content-Type**: `application/pdf` (or `application/octet-stream`)
- **Body**: Binary PDF blob.

---

## Error Handling

All endpoints follow standard HTTP status codes:

- `200 OK`: Request succeeded.
- `400 Bad Request`: Invalid input (e.g., missing required fields, invalid coordinates).
- `500 Internal Server Error`: Server-side processing failure.
