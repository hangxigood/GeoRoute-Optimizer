using GeoRoute.Core.Models;

namespace GeoRoute.Core.Interfaces;

/// <summary>
/// Service for optimizing route sequences using TSP approximation algorithms.
/// </summary>
public interface IRouteOptimizerService
{
    /// <summary>
    /// Optimize the route for the given POIs starting from a location.
    /// </summary>
    /// <param name="points">List of POIs to visit.</param>
    /// <param name="startLocation">Starting point (hotel, airport, etc.). If null, uses first POI.</param>
    /// <param name="mode">Loop (return to start) or OneWay.</param>
    /// <param name="optimizeSequence">If true, reorder for optimization. If false, use manual sequence.</param>
    /// <param name="manualSequence">Manual ordering of POI IDs when optimizeSequence is false.</param>
    OptimizedRoute Optimize(
        IReadOnlyList<PointOfInterest> points,
        PointOfInterest? startLocation,
        RouteMode mode = RouteMode.Loop,
        bool optimizeSequence = true,
        IReadOnlyList<string>? manualSequence = null);
}
