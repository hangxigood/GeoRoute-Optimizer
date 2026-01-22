using FluentAssertions;
using GeoRoute.Core.Models;
using GeoRoute.Core.Services;

namespace GeoRoute.Core.Tests.Services;

public class CentroidCalculatorServiceTests
{
    private readonly CentroidCalculatorService _service;

    public CentroidCalculatorServiceTests()
    {
        _service = new CentroidCalculatorService();
    }

    [Fact]
    public void Calculate_WithTwoPoints_ShouldReturnMidpoint()
    {
        // Arrange
        var points = new List<PointOfInterest>
        {
            new() { Id = "p1", Name = "P1", Lat = 0, Lng = 0 },
            new() { Id = "p2", Name = "P2", Lat = 10, Lng = 10 }
        };

        // Act
        var result = _service.Calculate(points);

        // Assert
        result.Centroid.Lat.Should().Be(5);
        result.Centroid.Lng.Should().Be(5);
    }
    
    [Fact]
    public void Calculate_WithThreePoints_ShouldReturnGeometricCenter()
    {
        // Arrange
        // (0,0), (0,10), (10,0) -> Centroid should be roughly (3.33, 3.33)
        // Note: Geometric centroid on a sphere is slightly different from planar average, 
        // but for small distances/coordinates near 0,0 it's close to average.
        // NTS handles the actual geometry math.
        var points = new List<PointOfInterest>
        {
            new() { Id = "p1", Name = "P1", Lat = 0, Lng = 0 },
            new() { Id = "p2", Name = "P2", Lat = 0, Lng = 10 },
            new() { Id = "p3", Name = "P3", Lat = 10, Lng = 0 }
        };

        // Act
        var result = _service.Calculate(points);

        // Assert
        result.Centroid.Lat.Should().BeApproximately(3.333, 0.001);
        result.Centroid.Lng.Should().BeApproximately(3.333, 0.001);
    }

    [Fact]
    public void Calculate_WithBufferRadius_ShouldPreserveRadius()
    {
        // Arrange
        var points = new List<PointOfInterest> { new() { Id = "p1", Name = "P1", Lat = 0, Lng = 0 } };
        double radius = 25.5;

        // Act
        var result = _service.Calculate(points, radius);

        // Assert
        result.BufferRadiusKm.Should().Be(radius);
    }

    [Fact]
    public void Calculate_WithSinglePoint_ShouldReturnPointItself()
    {
        // Arrange
        var points = new List<PointOfInterest> { new() { Id = "p1", Name = "P1", Lat = 50, Lng = -100 } };

        // Act
        var result = _service.Calculate(points);

        // Assert
        result.Centroid.Lat.Should().Be(50);
        result.Centroid.Lng.Should().Be(-100);
    }

    [Fact]
    public void Calculate_WithNoPoints_ShouldThrowArgumentException()
    {
        // Arrange
        var points = new List<PointOfInterest>();

        // Act
        Action act = () => _service.Calculate(points);

        // Assert
        act.Should().Throw<ArgumentException>();
    }
}
