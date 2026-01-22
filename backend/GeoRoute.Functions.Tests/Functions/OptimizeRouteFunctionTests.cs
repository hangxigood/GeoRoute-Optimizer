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

public class OptimizeRouteFunctionTests : FunctionTestBase
{
    private readonly Mock<IRouteOptimizerService> _mockRouteOptimizer;
    private readonly OptimizeRouteFunction _function;

    public OptimizeRouteFunctionTests()
    {
        _mockRouteOptimizer = new Mock<IRouteOptimizerService>();
        _function = new OptimizeRouteFunction(_mockRouteOptimizer.Object);
    }

    [Fact]
    public async Task OptimizeRoute_WithValidLoopModeRequest_Returns200()
    {
        // Arrange
        var points = CreateTestPoints();
        var startLocation = CreateTestPoint("start", "Start", 51.1670, -115.5570);
        var request = new OptimizeRouteRequest
        {
            Points = points,
            StartLocation = startLocation,
            RouteMode = RouteMode.Loop,
            OptimizeSequence = true
        };

        var expectedResult = new OptimizedRoute
        {
            Sequence = new List<string> { "p1", "p2" },
            RouteMode = RouteMode.Loop
        };

        _mockRouteOptimizer
            .Setup(x => x.Optimize(
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                It.IsAny<PointOfInterest>(),
                RouteMode.Loop,
                true,
                null))
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
    public async Task OptimizeRoute_WithValidOneWayModeRequest_Returns200()
    {
        // Arrange
        var points = CreateTestPoints();
        var request = new OptimizeRouteRequest
        {
            Points = points,
            RouteMode = RouteMode.OneWay,
            OptimizeSequence = true
        };

        var expectedResult = new OptimizedRoute
        {
            Sequence = new List<string> { "p1", "p2" },
            RouteMode = RouteMode.OneWay
        };

        _mockRouteOptimizer
            .Setup(x => x.Optimize(
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                null,
                RouteMode.OneWay,
                true,
                null))
            .Returns(expectedResult);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result;
        var actualRoute = okResult.Value as OptimizedRoute;
        actualRoute.Should().NotBeNull();
        actualRoute!.RouteMode.Should().Be(RouteMode.OneWay);
    }

    [Fact]
    public async Task OptimizeRoute_WithManualSequence_Returns200()
    {
        // Arrange
        var points = CreateTestPoints();
        var manualSequence = new List<string> { "p2", "p1" };
        var request = new OptimizeRouteRequest
        {
            Points = points,
            OptimizeSequence = false,
            ManualSequence = manualSequence
        };

        var expectedResult = new OptimizedRoute
        {
            Sequence = manualSequence,
            RouteMode = RouteMode.Loop
        };

        _mockRouteOptimizer
            .Setup(x => x.Optimize(
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                null,
                RouteMode.Loop,
                false,
                manualSequence))
            .Returns(expectedResult);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result;
        var actualRoute = okResult.Value as OptimizedRoute;
        actualRoute!.Sequence.Should().Equal("p2", "p1");
    }

    [Fact]
    public async Task OptimizeRoute_WithEmptyPoints_Returns400()
    {
        // Arrange
        var request = new OptimizeRouteRequest
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
    public async Task OptimizeRoute_WithMissingManualSequence_Returns400()
    {
        // Arrange
        var points = CreateTestPoints();
        var request = new OptimizeRouteRequest
        {
            Points = points,
            OptimizeSequence = false,
            ManualSequence = null
        };

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequest = (BadRequestObjectResult)result;
        var errorResponse = badRequest.Value;
        errorResponse.Should().NotBeNull();
    }

    [Fact]
    public async Task OptimizeRoute_WhenServiceThrowsArgumentException_Returns400()
    {
        // Arrange
        var points = CreateTestPoints();
        var request = new OptimizeRouteRequest
        {
            Points = points,
            OptimizeSequence = true
        };

        _mockRouteOptimizer
            .Setup(x => x.Optimize(
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                It.IsAny<PointOfInterest>(),
                It.IsAny<RouteMode>(),
                It.IsAny<bool>(),
                It.IsAny<IReadOnlyList<string>>()))
            .Throws(new ArgumentException("Invalid POI data"));

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
