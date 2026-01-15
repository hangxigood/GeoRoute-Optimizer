using GeoRoute.Core.Models;

namespace GeoRoute.Core.Interfaces;

/// <summary>
/// Service for generating PDF itinerary exports.
/// </summary>
public interface IExportService
{
    /// <summary>
    /// Generate a PDF document for the given route and POIs.
    /// </summary>
    byte[] GeneratePdf(
        OptimizedRoute route,
        IReadOnlyList<PointOfInterest> points,
        PointOfInterest? startLocation,
        RouteMetrics? metrics = null,
        string? mapImageBase64 = null);
}
