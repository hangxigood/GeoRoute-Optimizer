using System.Text.Json.Serialization;

namespace GeoRoute.Core.Models.Requests;

/// <summary>
/// Request to calculate the lodging zone centroid.
/// </summary>
public record CalculateLodgingRequest
{
    public required IReadOnlyList<PointOfInterest> Points { get; init; }
    public double BufferRadiusKm { get; init; } = 5; // Default per frontend
}

/// <summary>
/// Request to optimize a route.
/// </summary>
public record OptimizeRouteRequest
{
    public required IReadOnlyList<PointOfInterest> Points { get; init; }
    public PointOfInterest? StartLocation { get; init; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RouteMode RouteMode { get; init; } = RouteMode.Loop;

    public bool OptimizeSequence { get; init; } = true;
    public IReadOnlyList<string>? ManualSequence { get; init; }
}

/// <summary>
/// Request to generate a PDF export.
/// </summary>
public record ExportPdfRequest
{
    public required OptimizedRoute Route { get; init; }
    public required IReadOnlyList<PointOfInterest> Points { get; init; }
    public PointOfInterest? StartLocation { get; init; }
}
