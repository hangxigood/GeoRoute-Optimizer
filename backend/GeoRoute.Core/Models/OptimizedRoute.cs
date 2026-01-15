using System.Text.Json.Serialization;

namespace GeoRoute.Core.Models;

/// <summary>
/// Mode for route calculation.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RouteMode
{
    /// <summary>
    /// Return to start location after visiting all POIs.
    /// </summary>
    Loop,

    /// <summary>
    /// End at the last POI without returning to start.
    /// </summary>
    OneWay
}

/// <summary>
/// Represents an optimized route sequence.
/// Distance and duration metrics are calculated on the frontend using ArcGIS Route Service.
/// </summary>
public record OptimizedRoute
{
    /// <summary>
    /// Ordered list of POI IDs representing the optimized sequence.
    /// </summary>
    public required IReadOnlyList<string> Sequence { get; init; }

    /// <summary>
    /// The route mode used for this calculation.
    /// </summary>
    public required RouteMode RouteMode { get; init; }
}
