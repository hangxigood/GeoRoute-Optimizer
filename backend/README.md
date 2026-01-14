# GeoRoute Backend

.NET backend for GeoRoute Optimizer, providing route optimization, lodging zone calculation, and PDF export services.

## 📁 Project Structure

```
/backend
├── GeoRoute.Core/              # 📦 Shared library (all business logic)
│   ├── Services/               # Core service implementations
│   ├── Models/                 # Domain models and DTOs
│   └── Interfaces/             # Service interfaces
│
├── GeoRoute.Api/               # 🖥️ Local development API
│   └── Controllers/            # Thin controller wrappers
│
└── GeoRoute.Functions/         # ☁️ Azure Functions (production)
    └── Functions/              # HTTP trigger functions
```

## 🚀 Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (or .NET 9 for Azure Functions)
- [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local) (for Functions development)

### Running Locally (Web API)

```bash
cd backend
dotnet run --project GeoRoute.Api
```

The API will start at `http://localhost:7001`.

### Running Azure Functions Locally

```bash
cd backend/GeoRoute.Functions
func start
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lodging/calculate` | POST | Calculate lodging zone centroid |
| `/api/route/optimize` | POST | Optimize route sequence |
| `/api/export/pdf` | POST | Generate PDF itinerary |

### Example: Calculate Lodging Zone

```bash
curl -X POST http://localhost:7001/api/lodging/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {"id": "p1", "name": "Banff Gondola", "lat": 51.1483, "lng": -115.5700},
      {"id": "p2", "name": "Lake Louise", "lat": 51.4167, "lng": -116.2167}
    ],
    "bufferRadiusKm": 15
  }'
```

### Example: Optimize Route

```bash
curl -X POST http://localhost:7001/api/route/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {"id": "p1", "name": "Stop A", "lat": 51.1, "lng": -115.5},
      {"id": "p2", "name": "Stop B", "lat": 51.2, "lng": -115.6}
    ],
    "startLocation": {"id": "start", "name": "My Hotel", "lat": 51.0, "lng": -115.0},
    "routeMode": "loop",
    "optimizeSequence": true
  }'
```

## 🧪 Running Tests

```bash
cd backend
dotnet test
```

## 🏗️ Building

```bash
cd backend
dotnet build
```

## ☁️ Deployment

The Azure Functions project is configured for deployment to Azure Functions Consumption Plan. See the main documentation for deployment instructions.

## 📚 Technologies

- **.NET 10** (API) / **.NET 9** (Azure Functions)
- **NetTopologySuite** - Geospatial calculations
- **QuestPDF** - PDF generation
- **Azure Functions** - Serverless deployment
