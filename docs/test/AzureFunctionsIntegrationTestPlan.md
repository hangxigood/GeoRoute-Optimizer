# Azure Functions API Integration Test Plan: GeoRoute.Functions

This document outlines the integration test strategy for the Azure Functions HTTP endpoints in `GeoRoute.Functions`. These tests validate the HTTP layer, request/response handling, and end-to-end integration with `GeoRoute.Core` services.

## Test Scope

**Target**: Azure Functions HTTP endpoints (serverless API layer)  
**Approach**: Integration testing with in-memory test server  
**Framework**: xUnit + `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore`

## 1. OptimizeRouteFunction (POST /api/route/optimize)

This endpoint orchestrates route optimization using the TSP algorithm from `RouteOptimizerService`.

### Test Cases

| Test Case | PRD ID | HTTP Request | Expected Response |
| :--- | :--- | :--- | :--- |
| **Valid Loop Mode Request** | FR-1.7 | `POST /api/route/optimize`<br>Body: `{ "points": [...], "startLocation": {...}, "routeMode": "Loop", "optimizeSequence": true }` | **200 OK**<br>`{ "sequence": ["p1", "p2"], "routeMode": "Loop" }` |
| **Valid One-Way Mode Request** | FR-1.7 | `POST /api/route/optimize`<br>Body: `{ "points": [...], "routeMode": "OneWay", "optimizeSequence": true }` | **200 OK**<br>`{ "sequence": ["p1", "p2"], "routeMode": "OneWay" }` |
| **Manual Sequence Mode** | US-8 | `POST /api/route/optimize`<br>Body: `{ "points": [...], "optimizeSequence": false, "manualSequence": ["p2", "p1"] }` | **200 OK**<br>`{ "sequence": ["p2", "p1"], ... }` |
| **Empty Points Array** | Error | `POST /api/route/optimize`<br>Body: `{ "points": [] }` | **400 Bad Request**<br>`{ "error": "At least one point is required" }` |
| **Missing Manual Sequence** | Error | `POST /api/route/optimize`<br>Body: `{ "points": [...], "optimizeSequence": false }` | **400 Bad Request**<br>`{ "error": "ManualSequence is required when OptimizeSequence is false" }` |
| **Malformed JSON** | Error | `POST /api/route/optimize`<br>Body: `{ invalid json }` | **400 Bad Request** |

---

## 2. CalculateLodgingFunction (POST /api/lodging/calculate)

This endpoint calculates the geometric centroid and lodging buffer zone for a set of POIs.

### Test Cases

| Test Case | PRD ID | HTTP Request | Expected Response |
| :--- | :--- | :--- | :--- |
| **Valid Centroid Calculation** | FR-1.3 | `POST /api/lodging/calculate`<br>Body: `{ "points": [{"id":"p1","name":"A","lat":0,"lng":0}, {"id":"p2","name":"B","lat":10,"lng":10}] }` | **200 OK**<br>`{ "centroid": {"lat":5,"lng":5}, "bufferRadiusKm": 5, "bookingLinks": {...} }` |
| **Custom Buffer Radius** | FR-1.4 | `POST /api/lodging/calculate`<br>Body: `{ "points": [...], "bufferRadiusKm": 25 }` | **200 OK**<br>`{ "bufferRadiusKm": 25, ... }` |
| **Single Point** | FR-1.3 | `POST /api/lodging/calculate`<br>Body: `{ "points": [{"id":"p1","name":"A","lat":50,"lng":-100}] }` | **200 OK**<br>`{ "centroid": {"lat":50,"lng":-100}, ... }` |
| **Empty Points Array** | Error | `POST /api/lodging/calculate`<br>Body: `{ "points": [] }` | **400 Bad Request**<br>`{ "error": "At least one point is required" }` |
| **Null Request Body** | Error | `POST /api/lodging/calculate`<br>Body: `null` | **400 Bad Request** |

---

## 3. ExportPdfFunction (POST /api/export/pdf)

This endpoint generates a downloadable PDF itinerary from route data.

### Test Cases

| Test Case | PRD ID | HTTP Request | Expected Response |
| :--- | :--- | :--- | :--- |
| **Valid PDF Export** | FR-1.10 | `POST /api/export/pdf`<br>Body: `{ "route": {"sequence":["p1"],"routeMode":"Loop"}, "points": [...], "startLocation": {...} }` | **200 OK**<br>Content-Type: `application/pdf`<br>Body: PDF bytes (starts with `%PDF`) |
| **With Metrics** | FR-1.9 | `POST /api/export/pdf`<br>Body: `{ "route": {...}, "points": [...], "metrics": {"totalDistanceKm":100,"totalDurationMin":120,"legs":[...]} }` | **200 OK**<br>PDF contains distance/time data |
| **With Map Screenshot** | FR-1.10 | `POST /api/export/pdf`<br>Body: `{ ..., "mapImageBase64": "data:image/png;base64,..." }` | **200 OK**<br>PDF includes embedded image |
| **Missing Route** | Error | `POST /api/export/pdf`<br>Body: `{ "points": [...] }` | **400 Bad Request**<br>`{ "error": "Route is required" }` |
| **Missing Points** | Error | `POST /api/export/pdf`<br>Body: `{ "route": {...}, "points": [] }` | **400 Bad Request**<br>`{ "error": "At least one point is required" }` |
| **Service Exception** | Error | Invalid internal state | **500 Internal Server Error**<br>`{ "error": "..." }` |

---

## 4. Cross-Cutting Concerns

### CORS Validation
| Test Case | Expected Behavior |
| :--- | :--- |
| **Preflight Request** | OPTIONS requests return appropriate CORS headers |
| **Origin Header** | Requests from allowed origins succeed |

### Content Negotiation
| Test Case | Expected Behavior |
| :--- | :--- |
| **JSON Request** | `Content-Type: application/json` accepted |
| **Invalid Content-Type** | Graceful error handling |

---

## 5. Test Implementation Strategy

### Tools & Frameworks
- **xUnit**: Test runner
- **Microsoft.AspNetCore.Mvc.Testing**: In-memory test server (WebApplicationFactory pattern)
- **FluentAssertions**: Readable assertions
- **System.Net.Http.Json**: Simplified HTTP request/response handling

### Test Project Structure
```
backend/
└── GeoRoute.Functions.Tests/
    ├── GeoRoute.Functions.Tests.csproj
    ├── Functions/
    │   ├── OptimizeRouteFunctionTests.cs
    │   ├── CalculateLodgingFunctionTests.cs
    │   └── ExportPdfFunctionTests.cs
    └── TestHelpers/
        └── FunctionTestBase.cs
```

### Sample Test Pattern
```csharp
[Fact]
public async Task OptimizeRoute_WithValidRequest_Returns200()
{
    // Arrange
    var request = new OptimizeRouteRequest { ... };
    
    // Act
    var response = await _client.PostAsJsonAsync("/api/route/optimize", request);
    
    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var result = await response.Content.ReadFromJsonAsync<OptimizedRoute>();
    result.Sequence.Should().NotBeEmpty();
}
```

---

## 6. Verification Goals

- **HTTP Status Codes**: All endpoints return correct status codes (200, 400, 500)
- **Response Schema**: JSON responses match expected models
- **Error Handling**: Validation errors return descriptive messages
- **Content-Type**: PDF endpoint returns `application/pdf` with valid bytes
- **Performance**: All endpoints respond within acceptable latency (< 3s for optimization)

---

## 7. Running Integration Tests

```bash
# From project root
dotnet test backend/GeoRoute.Functions.Tests/GeoRoute.Functions.Tests.csproj

# With coverage
dotnet test backend/GeoRoute.Functions.Tests/GeoRoute.Functions.Tests.csproj --collect:"XPlat Code Coverage"
```

---

*Created: 2026-01-22*  
*Target: Phase 1 MVP (Azure Functions Deployment)*
