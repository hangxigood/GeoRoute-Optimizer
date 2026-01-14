namespace GeoRoute.Core.Models;

/// <summary>
/// Represents a geographic coordinate (latitude/longitude).
/// </summary>
public record LatLng(double Lat, double Lng);

/// <summary>
/// Represents a lodging zone with centroid and buffer radius.
/// </summary>
public record LodgingZone
{
    public required LatLng Centroid { get; init; }
    public required double BufferRadiusKm { get; init; }
    public BookingLinks? BookingLinks { get; init; }
}

/// <summary>
/// Pre-generated booking service search links.
/// </summary>
public record BookingLinks
{
    public string? BookingCom { get; init; }
    public string? Airbnb { get; init; }
}
