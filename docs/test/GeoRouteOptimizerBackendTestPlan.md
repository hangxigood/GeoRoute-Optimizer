# Detailed Test Plan: GeoRoute.Core

This document outlines the specific test cases, input data, and expected outcomes for the `GeoRoute.Core` backend services.

## 1. RouteOptimizerService (FR-1.7, NFR)

The `RouteOptimizerService` handles the Traveling Salesperson Problem (TSP) approximation to sequence visitor stops efficiently.

| Test Case | ID | Input Data | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Loop Mode Optimization** | FR-1.7 | Start: (0,0)<br>Pts: (0,10), (10,0) | Returns sequence of POIs. Logically forms a loop starting and ending at (0,0). |
| **One-Way Mode Optimization** | FR-1.7 | Start: (0,0)<br>Pts: (0,10), (10,10) | Returns sequence of POIs. Path ends at the furthest active point; no return leg. |
| **Heuristic Accuracy** | FR-1.7 | Start: (0,0)<br>Pts: (0,10), (10,10), (10,0) | Resulting sequence should be `[p1, p2, p3]` or `[p3, p2, p1]` to avoid path crossing. |
| **Performance Benchmark** | NFR | 10 Random Points | Execution time for optimization must be **< 2000ms**. |
| **Empty Input Handling** | Error | 0 Points | Throws `ArgumentException`. |

## 2. CentroidCalculatorService (FR-1.3, FR-1.4)

The `CentroidCalculatorService` identifies the strategic geographic center of a cluster of points to recommend lodging zones.

| Test Case | ID | Input Data | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Simple Centroid** | FR-1.3 | Pts: (0,0), (10,10) | Centroid calculated at (5,5). |
| **Cluster Centroid** | FR-1.3 | Pts: (0,0), (0,10), (10,0) | Centroid calculated at approximately (3.33, 3.33). |
| **Single Point Handling** | FR-1.3 | 1 Point: (50,-100) | Centroid is identical to the point (50,-100). |
| **Buffer Radius Persistence** | FR-1.4 | Radius: 25.5km | `LodgingZone` result contains the specific 25.5km radius value. |
| **Booking Link Integrity** | FR-1.5 | Centroid Result | Returns valid URL strings for Booking.com and Airbnb based on coordinates. |

## 3. ExportService (FR-1.10)

The `ExportService` generates the downloadable PDF itinerary from the optimized route data.

| Test Case | ID | Input Data | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **PDF Format Validation** | FR-1.10 | Valid Route + POIs | Returns non-zero `byte[]` starting with `%PDF` file signature. |
| **Data Robustness** | FR-1.10 | Empty Metrics | Should generate a PDF containing stop names even if distance/duration metrics are missing. |
| **Image Handling** | FR-1.10 | Base64 Map Screenshot | PDF includes the embedded map image in the content section. |

## 4. Verification Goals

- **Functional Pass Rate**: 100%
- **Code Coverage**: >90% (Measured via Coverlet)
- **Regression Detection**: Any change to core algorithms must pass all cases listed above before deployment.

---
*Created: 2026-01-22*
