using GeoRoute.Core.Models;
using Moq;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GeoRoute.Functions.Tests.TestHelpers;

/// <summary>
/// Base class for Azure Functions integration tests.
/// Provides common test utilities and HTTP client configuration.
/// </summary>
public abstract class FunctionTestBase : IDisposable
{
    protected readonly HttpClient HttpClient;
    protected readonly JsonSerializerOptions JsonOptions;

    protected FunctionTestBase()
    {
        // Configure JSON serialization to match Azure Functions
        JsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() }
        };

        // Create HTTP client for testing
        HttpClient = new HttpClient
        {
            BaseAddress = new Uri("http://localhost:7071/api/")
        };
    }

    /// <summary>
    /// Helper method to create a valid PointOfInterest for testing.
    /// </summary>
    protected static PointOfInterest CreateTestPoint(string id, string name, double lat, double lng)
    {
        return new PointOfInterest
        {
            Id = id,
            Name = name,
            Lat = lat,
            Lng = lng
        };
    }

    /// <summary>
    /// Helper method to create a list of test points.
    /// </summary>
    protected static List<PointOfInterest> CreateTestPoints()
    {
        return new List<PointOfInterest>
        {
            CreateTestPoint("p1", "Point 1", 51.1483, -115.5700),
            CreateTestPoint("p2", "Point 2", 51.4167, -116.2167)
        };
    }

    public void Dispose()
    {
        HttpClient?.Dispose();
        GC.SuppressFinalize(this);
    }
}
