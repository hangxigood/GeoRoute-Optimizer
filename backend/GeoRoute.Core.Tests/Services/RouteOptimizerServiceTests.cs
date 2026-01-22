using FluentAssertions;
using GeoRoute.Core.Models;
using GeoRoute.Core.Services;

namespace GeoRoute.Core.Tests.Services;

public class RouteOptimizerServiceTests
{
    private readonly RouteOptimizerService _service;

    public RouteOptimizerServiceTests()
    {
        _service = new RouteOptimizerService();
    }

    [Fact]
    public void Optimize_WithLoopMode_ShouldReturnSequenceStartingWithFirstVisits()
    {
        // Arrange
        var points = new List<PointOfInterest>
        {
            new() { Id = "p1", Name = "Banff", Lat = 51.1483, Lng = -115.5700 }, // Banff Gondola
            new() { Id = "p2", Name = "Lake Louise", Lat = 51.4167, Lng = -116.2167 }  // Lake Louise
        };
        var startLocation = new PointOfInterest { Id = "start", Name = "Fairmont", Lat = 51.1670, Lng = -115.5570 }; // Fairmont Banff Springs

        // Act
        var result = _service.Optimize(points, startLocation, RouteMode.Loop);

        // Assert
        result.Should().NotBeNull();
        result.Sequence.Should().HaveCount(2);
        result.RouteMode.Should().Be(RouteMode.Loop);
        // Note: The service returns the sequence of POIs to visit. 
        // The "Loop" nature is handled by the semantic interpretation that we return to start.
        // The sequence itself should contain p1 and p2.
        result.Sequence.Should().Contain("p1");
        result.Sequence.Should().Contain("p2");
    }

    [Fact]
    public void Optimize_WithOneWayMode_ShouldReturnSequence()
    {
        // Arrange
        var points = new List<PointOfInterest>
        {
            new() { Id = "p1", Name = "P1", Lat = 51.1483, Lng = -115.5700 },
            new() { Id = "p2", Name = "P2", Lat = 51.4167, Lng = -116.2167 }
        };
        var startLocation = new PointOfInterest { Id = "start", Name = "Start", Lat = 51.1670, Lng = -115.5570 };

        // Act
        var result = _service.Optimize(points, startLocation, RouteMode.OneWay);

        // Assert
        result.RouteMode.Should().Be(RouteMode.OneWay);
        result.Sequence.Should().HaveCount(2);
    }
    
    [Fact]
    public void Optimize_SimpleLine_ShouldPreserveOrder()
    {
        // Arrange: Start -> P1 (Close) -> P2 (Far)
        var startLocation = new PointOfInterest { Id = "start", Name = "Start", Lat = 0, Lng = 0 };
        var p1 = new PointOfInterest { Id = "p1", Name = "P1", Lat = 0, Lng = 1 }; // Dist = 1 deg
        var p2 = new PointOfInterest { Id = "p2", Name = "P2", Lat = 0, Lng = 10 }; // Dist = 10 deg
        
        var points = new List<PointOfInterest> { p2, p1 }; // Input in wrong order

        // Act
        var result = _service.Optimize(points, startLocation, RouteMode.OneWay);

        // Assert: Optimized should be p1 then p2
        result.Sequence[0].Should().Be("p1");
        result.Sequence[1].Should().Be("p2");
    }

    [Fact]
    public void Optimize_TenPoints_ShouldCompleteWithinTwoSeconds()
    {
        // Arrange
        var points = Enumerable.Range(0, 10).Select(i => new PointOfInterest 
        { 
            Id = $"p{i}", 
            Name = $"Point {i}",
            Lat = 50 + i * 0.1, 
            Lng = -100 + i * 0.1 
        }).ToList();
        var startLocation = new PointOfInterest { Id = "start", Name = "Start", Lat = 50, Lng = -100 };

        // Act
        var watch = System.Diagnostics.Stopwatch.StartNew();
        _service.Optimize(points, startLocation, RouteMode.Loop);
        watch.Stop();

        // Assert
        watch.ElapsedMilliseconds.Should().BeLessThan(2000);
    }
    
    [Fact]
    public void Optimize_WithEmptyPoints_ShouldThrowArgumentException()
    {
        // Arrange
        var points = new List<PointOfInterest>();
        var startLocation = new PointOfInterest { Id = "start", Name = "Start", Lat = 0, Lng = 0 };

        // Act
        Action act = () => _service.Optimize(points, startLocation);

        // Assert
        act.Should().Throw<ArgumentException>();
    }
}
