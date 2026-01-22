# Product Requirements Document (PRD): GeoRoute Optimizer

| Metadata | Details |
| :--- | :--- |
| **Version** | 1.0 |
| **Status** | Draft / Phase 1 Definition |
| **Last Updated** | 2026-01-13 |
| **Author** | Hangxi Xiang |

---

## 1. Executive Summary
**Travelers often struggle to convert a "wishlist" of attractions into an actionable itinerary.**
The **GeoRoute Optimizer** is a spatial decision-support tool designed to eliminate the guesswork in trip planning. Unlike standard map tools, it automatically organizes scattered Points of Interest (POIs) into efficient daily routes and mathematically identifies the most strategic areas for lodging to minimize total travel time.

## 2. Target Audience
*   **The "Efficient Explorer"**: Travelers who want to optimize their limited time to see the maximum number of attractions with minimum driving time.
*   **Road-Trippers**: Users planning complex, multi-stop driving journeys across specific regions (e.g., Canadian Rockies, Iceland Ring Road).
*   **Planners**: Individuals who prefer data-backed decisions over intuition when booking accommodation.

## 3. User Stories

| ID | Persona | I want to... | So that... |
| :--- | :--- | :--- | :--- |
| **US-1** | Explorer | Drop pins on a map for all places I want to visit | I can visualize their spatial distribution. |
| **US-2** | Planner | Have the system calculate the best driving sequence | I can avoid backtracking and save fuel/time. | |
| **US-3** | Accom. Booker | Get a recommendation for a "Lodging Zone" | I am centrally located relative to my activities for the day. |
| **US-4** | Traveler | Export my plan (PDF) with travel metrics | I can see travel times/distances offline during my trip. |
| **US-5** | Explorer | Temporarily disable a specific POI | I can see how the route changes without deleting the point entirely. |
| **US-6** | Planner | See travel time and distance between stops | I know how long each leg of the journey takes. |
| **US-7** | Planner | See total trip duration and distance | I can gauge the feasibility of the entire day's plan. |
| **US-8** | Planner | Manually reorder the sequence of stops | I can customize the route to better fit my personal preferences or constraints. |
| **US-9** | Planner | Be alerted if a stop might be closed when I arrive | I don't waste time driving to a closed attraction. |

## 4. Functional Requirements

### Phase 1: Regional Route Optimization (MVP)
*Focus: Solving the spatial efficiency problem for a set of points.*

| ID | Feature Area | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-1.1** | **POI Management** | Users shall be able to add locations via search or map click. | **Critical** |
| **FR-1.2** | **POI Management** | Users shall be able to remove or toggle "active/inactive" status of a POI. | **High** |
| **FR-1.3** | **Lodging Logic** | **(Optional)** The system shall calculate a "Geometric Center" (Centroid) based on the POI distribution. | **High** |
| **FR-1.4** | **Lodging Viz** | **(Optional)** The system shall display a "Preferred Lodging Buffer" (radius) around the centroid on the map. | **High** |
| **FR-1.5** | **External Link** | **(Optional)** The system shall provide a shortcut to view accommodations within the buffer. | **High** |
| **FR-1.6** | **Start Location** | Users shall be able to set a specific Start Point (e.g., Booked Hotel, Airport) manually. | **Critical** |
| **FR-1.7** | **Smart Sequencing** | The system shall calculate the most efficient sequence (TSP) visiting all active POIs, supporting **Loop** and **One-Way** modes. | **Critical** |
| **FR-1.8** | **Visualization** | The system shall render the optimized path on the map connecting points in order. | **Critical** |
| **FR-1.9** | **Metrics Display** | The system shall display travel time and distance for each leg and the total trip. | **Critical** |
| **FR-1.10** | **Data Export** | Users can export the summary (Sequence + Travel times/kms) to a structured format (PDF). | **High** |

### Phase 2: Advanced Routing & Refinement
*Focus: Enhancing the user's control over the spatial route.*

| ID | Feature Area | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-2.1** | **Stop Locking** | Users shall be able to **"Lock"** specific POIs in their sequence. The system shall re-optimize the remaining *unlocked* POIs to minimize travel time while respecting the fixed positions of locked stops. | **High** |
| **FR-2.2** | **Region Selector** | Users shall be able to select a destination region/city (e.g., Banff, Tokyo, Paris) which sets the initial map center and biases address search results to that area. | **High** |

### Phase 3: Multi-Region & Grand Strategy (Post-MVP)
*Focus: Scaling the local solution into a cross-regional journey.*

| ID | Feature Area | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-3.1** | **Multi-Day** | Users shall input a total trip duration (days). | **High** |
| **FR-3.2** | **Clustering** | The system shall automatically group 20+ POIs into "Daily Clusters" based on proximity. | **Critical** |
| **FR-3.3** | **Macro-Routing** | The system shall sequence the "Daily Clusters" (e.g., Day 1: Region A -> Day 2: Region B). | **Critical** |
| **FR-3.4** | **Stay Logic** | The system shall recommend whether to stay in one hub or move hotels based on travel distance. | **Medium** |

## 5. Non-Functional Requirements
*   **Performance**: Route calculation for <10 points must complete in under 2 seconds.
*   **Usability**: The interface must be mobile-responsive for on-the-go adjustments.
*   **Privacy**: User data (POIs) is stored locally or in session storage (initial MVP) without requiring account creation.
*   **Reliability**: The map interface must degrade gracefully if external map tiles load slowly.

## 6. UI/UX Requirements (User Flow)
1.  **Input**: User lands on a full-screen map interface.
2.  **Add POIs**: User adds 5-8 pins representing their "Wishlist" for the day.
3.  **Find Stay Area (Optional)**: User clicks **"Find Best Stay Area"** CTA (ideal for users who haven't booked yet).
4.  **Stay Area Output**:
    *   Map overlays a semi-transparent "Best Stay Area" circle (centroid + buffer).
    *   Sidebar shows external links to Booking.com/Airbnb filtered to this area.
5.  **Set Start & Mode**: User identifies their Start Point (e.g. Map Click or Address) and selects **Loop** or **One-Way** mode.
6.  **Optimize Route**: User clicks **"Optimize My Day"** CTA.
7.  **Route Output**:
    *   Map draws the optimized route line (closing the loop or ending path based on mode).
    *   Sidebar slides out with a **"Placeline"** showing sequence, travel times, and distances.
8.  **Refinement**: User manually reorders stops or **Locks** specific locations (e.g., Lunch) and re-optimizes the remaining path.

## 7. Success Metrics (KPIs)
*   **Time-to-Plan**: 50% reduction in planning time compared to manual Google Maps usage.
*   **Path Efficiency**: >15% reduction in total travel distance vs. random sequencing.
*   **User Sentiment**: "Buy Me a Coffee" click-through rate > 2%.

## 8. Future Roadmap
*   **Phase 4**: City & Transit Mode (Public Transport routing, walking paths, specific transit schedules).
*   **Phase 5**: Real-time traffic integration and seasonal road closures.
*   **Phase 6**: Collaborative planning (multi-user session syncing).