namespace GeoRoute.Core.Models;

/// <summary>
/// Represents a Point of Interest with geographic coordinates.
/// </summary>
public record PointOfInterest
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required double Lat { get; init; }
    public required double Lng { get; init; }
}
