using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models;

namespace GeoRoute.Core.Services;

/// <summary>
/// Route optimization using Nearest Neighbor heuristic with 2-opt improvement.
/// </summary>
public class RouteOptimizerService : IRouteOptimizerService
{
    public OptimizedRoute Optimize(
        IReadOnlyList<PointOfInterest> points,
        PointOfInterest? startLocation,
        RouteMode mode = RouteMode.Loop,
        bool optimizeSequence = true,
        IReadOnlyList<string>? manualSequence = null)
    {
        ArgumentNullException.ThrowIfNull(points);

        if (points.Count == 0)
        {
            throw new ArgumentException("At least one point is required", nameof(points));
        }

        // Build lookup for quick access
        var pointLookup = points.ToDictionary(p => p.Id);

        // Determine sequence
        IReadOnlyList<string> sequence;

        if (optimizeSequence)
        {
            sequence = OptimizeSequenceNearestNeighbor(points, startLocation);
            sequence = ImproveTwoOpt(sequence, pointLookup, startLocation, mode);
        }
        else if (manualSequence != null)
        {
            // Validate manual sequence
            foreach (var id in manualSequence)
            {
                if (!pointLookup.ContainsKey(id))
                {
                    throw new ArgumentException($"Unknown POI ID in manual sequence: {id}", nameof(manualSequence));
                }
            }
            sequence = manualSequence;
        }
        else
        {
            // Use original order
            sequence = points.Select(p => p.Id).ToList();
        }

        return new OptimizedRoute
        {
            Sequence = sequence,
            RouteMode = mode
        };
    }

    /// <summary>
    /// Nearest Neighbor TSP approximation.
    /// </summary>
    private static List<string> OptimizeSequenceNearestNeighbor(
        IReadOnlyList<PointOfInterest> points,
        PointOfInterest? startLocation)
    {
        var unvisited = new HashSet<string>(points.Select(p => p.Id));
        var sequence = new List<string>();
        var pointLookup = points.ToDictionary(p => p.Id);

        // Current position
        double currentLat = startLocation?.Lat ?? points[0].Lat;
        double currentLng = startLocation?.Lng ?? points[0].Lng;

        while (unvisited.Count > 0)
        {
            // Find nearest unvisited point
            string? nearest = null;
            double nearestDist = double.MaxValue;

            foreach (var id in unvisited)
            {
                var point = pointLookup[id];
                var dist = HaversineDistance(currentLat, currentLng, point.Lat, point.Lng);
                if (dist < nearestDist)
                {
                    nearestDist = dist;
                    nearest = id;
                }
            }

            if (nearest != null)
            {
                sequence.Add(nearest);
                unvisited.Remove(nearest);
                var nextPoint = pointLookup[nearest];
                currentLat = nextPoint.Lat;
                currentLng = nextPoint.Lng;
            }
        }

        return sequence;
    }

    /// <summary>
    /// 2-opt improvement for the route.
    /// </summary>
    private static IReadOnlyList<string> ImproveTwoOpt(
        IReadOnlyList<string> sequence,
        Dictionary<string, PointOfInterest> pointLookup,
        PointOfInterest? startLocation,
        RouteMode mode)
    {
        if (sequence.Count < 3)
        {
            return sequence;
        }

        var route = sequence.ToList();
        bool improved = true;

        while (improved)
        {
            improved = false;

            for (int i = -1; i < route.Count - 1; i++)
            {
                for (int j = i + 2; j < route.Count; j++)
                {
                    double currentCost = CalculateSegmentCost(route, pointLookup, startLocation, mode, i, j);
                    double swappedCost = Calculate2OptSwapCost(route, pointLookup, startLocation, mode, i, j);

                    if (swappedCost < currentCost - 0.001) // Small epsilon for floating point
                    {
                        // Perform 2-opt swap (reverse segment between i+1 and j)
                        route = Perform2OptSwap(route, i, j);
                        improved = true;
                    }
                }
            }
        }

        return route;
    }

    private static List<string> Perform2OptSwap(List<string> route, int i, int j)
    {
        var newRoute = new List<string>();
        
        // When i = -1, we're swapping from before the first element (start location)
        // In this case, we just reverse from index 0 to j
        if (i == -1)
        {
            // Reverse elements from 0 to j
            for (int k = j; k >= 0; k--)
            {
                newRoute.Add(route[k]);
            }
            
            // Add remaining elements
            for (int k = j + 1; k < route.Count; k++)
            {
                newRoute.Add(route[k]);
            }
        }
        else
        {
            // Normal case: Add elements from start to i
            for (int k = 0; k <= i; k++)
            {
                newRoute.Add(route[k]);
            }
            
            // Add elements from i+1 to j in reverse
            for (int k = j; k > i; k--)
            {
                newRoute.Add(route[k]);
            }
            
            // Add remaining elements
            for (int k = j + 1; k < route.Count; k++)
            {
                newRoute.Add(route[k]);
            }
        }
        
        return newRoute;
    }

    private static double CalculateSegmentCost(
        List<string> route,
        Dictionary<string, PointOfInterest> pointLookup,
        PointOfInterest? startLocation,
        RouteMode mode,
        int i,
        int j)
    {
        double cost = 0;

        // Edge from i to i+1
        double fromILat, fromILng;
        bool hasFromI;
        if (i == -1)
        {
            hasFromI = startLocation != null;
            fromILat = startLocation?.Lat ?? 0;
            fromILng = startLocation?.Lng ?? 0;
        }
        else
        {
            var fromPoi = pointLookup[route[i]];
            hasFromI = true;
            fromILat = fromPoi.Lat;
            fromILng = fromPoi.Lng;
        }
        var toI = pointLookup[route[i + 1]];
        if (hasFromI)
        {
            cost += HaversineDistance(fromILat, fromILng, toI.Lat, toI.Lng);
        }

        // Edge from j to j+1 (or back to start if j is last and mode is Loop)
        var fromJ = pointLookup[route[j]];
        if (j + 1 < route.Count)
        {
            var toJ = pointLookup[route[j + 1]];
            cost += HaversineDistance(fromJ.Lat, fromJ.Lng, toJ.Lat, toJ.Lng);
        }
        else if (mode == RouteMode.Loop && startLocation != null)
        {
            cost += HaversineDistance(fromJ.Lat, fromJ.Lng, startLocation.Lat, startLocation.Lng);
        }

        return cost;
    }

    private static double Calculate2OptSwapCost(
        List<string> route,
        Dictionary<string, PointOfInterest> pointLookup,
        PointOfInterest? startLocation,
        RouteMode mode,
        int i,
        int j)
    {
        double cost = 0;

        // After swap: edge from i to j
        double fromILat, fromILng;
        bool hasFromI;
        if (i == -1)
        {
            hasFromI = startLocation != null;
            fromILat = startLocation?.Lat ?? 0;
            fromILng = startLocation?.Lng ?? 0;
        }
        else
        {
            var fromPoi = pointLookup[route[i]];
            hasFromI = true;
            fromILat = fromPoi.Lat;
            fromILng = fromPoi.Lng;
        }
        var toI = pointLookup[route[j]]; // j becomes the next after i
        if (hasFromI)
        {
            cost += HaversineDistance(fromILat, fromILng, toI.Lat, toI.Lng);
        }

        // After swap: edge from i+1 to j+1 (i+1 is now where j was)
        var fromJ = pointLookup[route[i + 1]]; // i+1 is now at position j
        if (j + 1 < route.Count)
        {
            var toJ = pointLookup[route[j + 1]];
            cost += HaversineDistance(fromJ.Lat, fromJ.Lng, toJ.Lat, toJ.Lng);
        }
        else if (mode == RouteMode.Loop && startLocation != null)
        {
            cost += HaversineDistance(fromJ.Lat, fromJ.Lng, startLocation.Lat, startLocation.Lng);
        }

        return cost;
    }

    /// <summary>
    /// Calculate distance between two points using the Haversine formula.
    /// </summary>
    private static double HaversineDistance(double lat1, double lng1, double lat2, double lng2)
    {
        const double EarthRadiusKm = 6371;

        var dLat = DegreesToRadians(lat2 - lat1);
        var dLng = DegreesToRadians(lng2 - lng1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180;
}
