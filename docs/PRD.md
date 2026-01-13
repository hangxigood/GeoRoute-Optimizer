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
*   **The "Efficient Explorer"**: Travelers who want to optimize their limited time to see the maximum number of attractions with minimum driving/transit time.
*   **Road-Trippers**: Users planning complex, multi-stop journeys across specific regions (e.g., Canadian Rockies, Iceland Ring Road).
*   **Planners**: Individuals who prefer data-backed decisions over intuition when booking accommodation.

## 3. User Stories

| ID | Persona | I want to... | So that... |
| :--- | :--- | :--- | :--- |
| **US-1** | Explorer | Drop pins on a map for all places I want to visit | I can visualize their spatial distribution. |
| **US-2** | Planner | Have the system calculate the best visit order | I can avoid backtracking and save time. |
| **US-3** | Accom. Booker | Get a recommendation for a "Lodging Zone" | I am centrally located relative to my activities for the day. |
| **US-4** | Traveler | Export my plan (PDF/iCal) with travel metrics | I can see travel times/distances offline during my trip. |
| **US-5** | Explorer | Temporarily disable a specific POI | I can see how the route changes without deleting the point entirely. |
| **US-6** | Planner | See travel time and distance between stops | I know how long each leg of the journey takes. |
| **US-7** | Planner | See total trip duration and distance | I can gauge the feasibility of the entire day's plan. |
| **US-8** | Planner | Set a "Stay Time" for each location | I can see a realistic schedule of when I'll arrive and depart each place. |
| **US-9** | Planner | Manually reorder the sequence of stops | I can customize the route to better fit my personal preferences or constraints. |

## 4. Functional Requirements

### Phase 1: Single-Day / Single-Region Optimization (MVP)
*Focus: Solving the "local" problem of a 24-hour window.*

| ID | Feature Area | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-1.1** | **POI Management** | Users shall be able to add locations via search or map click. | **Critical** |
| **FR-1.2** | **POI Management** | Users shall be able to remove or toggle "active/inactive" status of a POI. | **High** |
| **FR-1.3** | **Lodging Logic** | The system shall calculate a "Geometric Center" (Centroid) based on the POI distribution. | **Critical** |
| **FR-1.4** | **Lodging Viz** | The system shall display a "Preferred Lodging Buffer" (radius) around the centroid on the map. | **Critical** |
| **FR-1.5** | **External Link** | The system shall provide a shortcut to view accommodations (e.g., Booking.com/Airbnb) within the buffer. | **High** |
| **FR-1.6** | **Start Point** | Users shall be able to select a hotel/lodging within the buffer as the trip's start point. | **Critical** |
| **FR-1.7** | **Smart Sequencing** | The system shall calculate the most efficient sequence (TSP/Routing algorithm) to visit all active POIs, starting and ending at the selected lodging. | **Critical** |
| **FR-1.8** | **Visualization** | The system shall render the optimized path on the map connecting points in order. | **Critical** |
| **FR-1.9** | **Metrics Display** | The system shall display travel time and distance for each leg and the total trip. | **Critical** |
| **FR-1.10** | **Manual Reordering** | Users shall be able to manually drag-and-drop stops to reorder the sequence, triggering a recalculation of travel times. | **High** |
| **FR-1.11** | **Data Export** | Users can export the daily summary (Sequence + Travel times/kms) to a structured format (PDF/iCal). | **High** |

### Phase 2: Time Management & Itinerary Building
*Focus: Converting the spatial route into a time-accurate schedule.*

| ID | Feature Area | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-2.1** | **Trip Window** | Users shall input a "Start Time" and "End Time" (e.g., 9:00 AM - 5:00 PM) for their day. | **Critical** |
| **FR-2.2** | **Auto-Distribution** | The system shall automatically calculate specific stay durations by averaging available time (Total Window - Travel Time) across all POIs. | **Critical** |
| **FR-2.3** | **Min Duration Alert** | If the auto-distributed stay time is < 1 hour per POI, the system shall alert the user that the schedule is too crowded. | **Critical** |
| **FR-2.4** | **Manual Override** | Users shall be able to manually override the auto-calculated stay time for specific locations. | **High** |
| **FR-2.5** | **Timeline Gen** | The system shall generate a detailed timeline (Arrive -> Stay -> Depart -> Travel). | **Critical** |

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
3.  **Find Stay Area**: User clicks **"Find Best Stay Area"** CTA.
4.  **Stay Area Output**:
    *   Map overlays a semi-transparent "Best Stay Area" circle (centroid + buffer).
    *   Sidebar shows external links to Booking.com/Airbnb filtered to this area.
5.  **Select Hotel**: User clicks on map or enters address to set their hotel/lodging as the **Start Point**.
6.  **Optimize Route**: User clicks **"Optimize My Day"** CTA.
7.  **Route Output**:
    *   Map draws the optimized route line starting and ending at the hotel.
    *   Sidebar slides out with a **"Placeline"** showing sequence, travel times, and distances.
8.  **Refinement**: User drags a POI or reorders stops; route recalculates in real-time.

## 7. Success Metrics (KPIs)
*   **Time-to-Plan**: 50% reduction in planning time compared to manual Google Maps usage.
*   **Path Efficiency**: >15% reduction in total travel distance vs. random sequencing.
*   **User Sentiment**: "Buy Me a Coffee" click-through rate > 2%.

## 8. Future Roadmap
*   **Phase 4**: Real-time traffic integration and seasonal road closures.
*   **Phase 5**: Collaborative planning (multi-user session syncing).