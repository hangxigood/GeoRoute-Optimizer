# GeoRoute Optimizer

**[🔴 Live Demo](https://geo-route-optimizer.vercel.app/)**

GeoRoute Optimizer is a powerful web application designed to help travelers plan efficient multi-stop trips. By leveraging advanced route optimization algorithms and interactive mapping, it simplifies the process of creating complex travel itineraries.

## 🚀 Features

- **Interactive Map Interface**: Built with the ArcGIS JavaScript API for seamless exploration, POI search, and route visualization.
- **Intelligent Route Optimization**:
  - Solves the Traveling Salesperson Problem (TSP) using 2-opt and nearest neighbor algorithms.
  - Supports both **Loop** (round-trip) and **One-Way** route modes.
- **Smart Lodging Recommendations**: Automatically calculates the optimal area to stay based on your selected points of interest (centralized lodging logic).
- **Itinerary Export**: Generate professional PDF itineraries including:
  - Day-by-day route breakdown.
  - Turn-by-turn metrics (distance & time).
  - High-quality map screenshots.
- **Real-time Metrics**: View total trip distance and estimated driving time instantly.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (React)
- **Mapping**: [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)
- **Styling**: Tailwind CSS & Vanilla CSS for premium aesthetics
- **State Management**: React Hooks & Context

### Backend
- **Runtime**: [Azure Functions](https://azure.microsoft.com/en-us/products/functions/) (.NET 9 Isolated Worker)
- **Core Logic**: C# .NET 9 Class Libraries
- **Architecture**: Clean Architecture (API, Core, Infrastructure separation)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- .NET 9.0 SDK
- Azure Functions Core Tools (for local backend debugging)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/GeoRoute-Optimizer.git
cd GeoRoute-Optimizer
```

### 2. Frontend Setup
Navigate to the root directory (where `package.json` is located).

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file for local development:
   ```env
   NEXT_PUBLIC_ARCGIS_API_KEY=your_arcgis_api_key_here
   NEXT_PUBLIC_API_URL=http://localhost:7071/api
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

### 3. Backend Setup
Navigate to the backend directory.

```bash
cd backend
```

1. Restore .NET dependencies:
   ```bash
   dotnet restore
   ```

2. Run the Azure Functions locally:
   ```bash
   cd GeoRoute.Functions
   func start
   ```
   The backend API will be available at `http://localhost:7071/api`.

## 📦 Deployment

### Frontend (Vercel)
The frontend is optimized for deployment on Vercel.
1. Connect your GitHub repository to Vercel.
2. Add your `NEXT_PUBLIC_ARCGIS_API_KEY` and `NEXT_PUBLIC_API_URL` in the Vercel Project Settings.

### Backend (Azure)
A deployment script is included for Azure Functions.

```bash
# Usage: ./backend/deploy-functions.sh <APP_NAME> <RESOURCE_GROUP> <FRONTEND_URL>
./backend/deploy-functions.sh GeoRoute-Optimizer-Prod MyResourceGroup https://my-app.vercel.app
```

## 📄 API Endpoints

- `POST /api/route/optimize`: Optimizes the sequence of POIs.
- `POST /api/lodging/calculate`: Determines the best geographic center for lodging.
- `POST /api/export/pdf`: Generates a PDF itinerary.

## 📄 License
[MIT](LICENSE)
