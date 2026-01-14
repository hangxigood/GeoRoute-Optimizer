using GeoRoute.Core.Models;

namespace GeoRoute.Core.Interfaces;

/// <summary>
/// Service for calculating lodging zone centroids.
/// </summary>
public interface ICentroidCalculatorService
{
    /// <summary>
    /// Calculate the geometric centroid of the provided POIs and return a lodging zone.
    /// </summary>
    LodgingZone Calculate(IReadOnlyList<PointOfInterest> points, double bufferRadiusKm = 5);
}
