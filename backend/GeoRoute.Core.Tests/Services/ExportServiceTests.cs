using FluentAssertions;
using GeoRoute.Core.Models;
using GeoRoute.Core.Services;

namespace GeoRoute.Core.Tests.Services;

public class ExportServiceTests
{
    private readonly ExportService _service;

    public ExportServiceTests()
    {
        _service = new ExportService();
    }

    [Fact]
    public void GeneratePdf_WithValidData_ShouldReturnBytes()
    {
        // Arrange
        var points = new List<PointOfInterest>
        {
            new() { Id = "p1", Name = "Point 1", Lat = 0, Lng = 0 },
            new() { Id = "p2", Name = "Point 2", Lat = 1, Lng = 1 }
        };
        var route = new OptimizedRoute
        {
            Sequence = new List<string> { "p1", "p2" },
            RouteMode = RouteMode.OneWay
        };
        var startLocation = new PointOfInterest { Id = "start", Name = "Start", Lat = -1, Lng = -1 };
        
        var metrics = new RouteMetrics 
        { 
            TotalDistanceKm = 100, 
            TotalDurationMin = 120,
            Legs = new List<RouteLeg>() 
        };

        // Act
        var result = _service.GeneratePdf(route, points, startLocation, metrics);

        // Assert
        result.Should().NotBeNull();
        result.Length.Should().BeGreaterThan(0);
        // We could inspect the PDF header bytes (e.g. %PDF), but checking non-empty is sufficient for basic verification.
        result.Should().StartWith(new byte[] { 0x25, 0x50, 0x44, 0x46 }); // "%PDF" signature
    }

    [Fact]
    public void GeneratePdf_WithMinimalData_ShouldNotThrow()
    {
        // Arrange
        var points = new List<PointOfInterest>();
        var route = new OptimizedRoute
        {
            Sequence = new List<string>(),
            RouteMode = RouteMode.Loop
        };
        
        // Act
        Action act = () => _service.GeneratePdf(route, points, null);

        // Assert
        act.Should().NotThrow();
    }
}
