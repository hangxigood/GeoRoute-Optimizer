using FluentAssertions;
using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models;
using GeoRoute.Core.Models.Requests;
using GeoRoute.Functions.Functions;
using GeoRoute.Functions.Tests.TestHelpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Text;
using System.Text.Json;

namespace GeoRoute.Functions.Tests.Functions;

public class CalculateLodgingFunctionTests : FunctionTestBase
{
    private readonly Mock<ICentroidCalculatorService> _mockCentroidCalculator;
    private readonly CalculateLodgingFunction _function;

    public CalculateLodgingFunctionTests()
    {
        _mockCentroidCalculator = new Mock<ICentroidCalculatorService>();
        _function = new CalculateLodgingFunction(_mockCentroidCalculator.Object);
    }

    [Fact]
    public async Task CalculateLodging_WithValidRequest_Returns200()
    {
        // Arrange
        var points = CreateTestPoints();
        var request = new CalculateLodgingRequest
        {
            Points = points,
            BufferRadiusKm = 5
        };

        var expectedResult = new LodgingZone
        {
            Centroid = new LatLng(51.2825, -115.8934),
            BufferRadiusKm = 5,
            BookingLinks = new BookingLinks
            {
                BookingCom = "https://www.booking.com/...",
                Airbnb = "https://www.airbnb.com/..."
            }
        };

        _mockCentroidCalculator
            .Setup(x => x.Calculate(It.IsAny<IReadOnlyList<PointOfInterest>>(), 5))
            .Returns(expectedResult);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result;
        okResult.Value.Should().BeEquivalentTo(expectedResult);
    }

    [Fact]
    public async Task CalculateLodging_WithCustomBufferRadius_Returns200()
    {
        // Arrange
        var points = CreateTestPoints();
        var customRadius = 25.0;
        var request = new CalculateLodgingRequest
        {
            Points = points,
            BufferRadiusKm = customRadius
        };

        var expectedResult = new LodgingZone
        {
            Centroid = new LatLng(51.2825, -115.8934),
            BufferRadiusKm = customRadius,
            BookingLinks = new BookingLinks
            {
                BookingCom = "https://www.booking.com/...",
                Airbnb = "https://www.airbnb.com/..."
            }
        };

        _mockCentroidCalculator
            .Setup(x => x.Calculate(It.IsAny<IReadOnlyList<PointOfInterest>>(), customRadius))
            .Returns(expectedResult);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result;
        var lodgingZone = okResult.Value as LodgingZone;
        lodgingZone!.BufferRadiusKm.Should().Be(customRadius);
    }

    [Fact]
    public async Task CalculateLodging_WithSinglePoint_Returns200()
    {
        // Arrange
        var singlePoint = new List<PointOfInterest>
        {
            CreateTestPoint("p1", "Point 1", 50, -100)
        };
        var request = new CalculateLodgingRequest
        {
            Points = singlePoint
        };

        var expectedResult = new LodgingZone
        {
            Centroid = new LatLng(50, -100),
            BufferRadiusKm = 5,
            BookingLinks = new BookingLinks
            {
                BookingCom = "https://www.booking.com/...",
                Airbnb = "https://www.airbnb.com/..."
            }
        };

        _mockCentroidCalculator
            .Setup(x => x.Calculate(It.IsAny<IReadOnlyList<PointOfInterest>>(), It.IsAny<double>()))
            .Returns(expectedResult);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result;
        var lodgingZone = okResult.Value as LodgingZone;
        lodgingZone!.Centroid.Lat.Should().Be(50);
        lodgingZone.Centroid.Lng.Should().Be(-100);
    }

    [Fact]
    public async Task CalculateLodging_WithEmptyPoints_Returns400()
    {
        // Arrange
        var request = new CalculateLodgingRequest
        {
            Points = new List<PointOfInterest>()
        };

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequest = (BadRequestObjectResult)result;
        badRequest.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task CalculateLodging_WhenServiceThrowsArgumentException_Returns400()
    {
        // Arrange
        var points = CreateTestPoints();
        var request = new CalculateLodgingRequest
        {
            Points = points
        };

        _mockCentroidCalculator
            .Setup(x => x.Calculate(It.IsAny<IReadOnlyList<PointOfInterest>>(), It.IsAny<double>()))
            .Throws(new ArgumentException("Invalid points"));

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    private HttpRequest CreateHttpRequest(object body)
    {
        var json = JsonSerializer.Serialize(body, JsonOptions);
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));

        var context = new DefaultHttpContext();
        context.Request.Body = stream;
        context.Request.ContentType = "application/json";

        return context.Request;
    }
}
