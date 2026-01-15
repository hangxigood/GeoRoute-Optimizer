namespace GeoRoute.Core.Models;

/// <summary>
/// Represents a single leg of a route between two stops.
/// </summary>
public record RouteLeg
{
    public required string FromId { get; init; }
    public required string ToId { get; init; }
    public double DistanceKm { get; init; }
    public double DurationMin { get; init; }
}

/// <summary>
/// Frontend-calculated route metrics from ArcGIS Route Service.
/// </summary>
public record RouteMetrics
{
    public double TotalDistanceKm { get; init; }
    public double TotalDurationMin { get; init; }
    public IReadOnlyList<RouteLeg>? Legs { get; init; }
}
