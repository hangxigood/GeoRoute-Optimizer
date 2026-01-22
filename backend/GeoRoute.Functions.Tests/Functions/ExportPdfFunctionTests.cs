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

public class ExportPdfFunctionTests : FunctionTestBase
{
    private readonly Mock<IExportService> _mockExportService;
    private readonly ExportPdfFunction _function;

    public ExportPdfFunctionTests()
    {
        _mockExportService = new Mock<IExportService>();
        _function = new ExportPdfFunction(_mockExportService.Object);
    }

    [Fact]
    public async Task ExportPdf_WithValidRequest_Returns200WithPdfContent()
    {
        // Arrange
        var points = CreateTestPoints();
        var route = new OptimizedRoute
        {
            Sequence = new List<string> { "p1", "p2" },
            RouteMode = RouteMode.Loop
        };
        var request = new ExportPdfRequest
        {
            Route = route,
            Points = points,
            StartLocation = CreateTestPoint("start", "Start", 51.1670, -115.5570)
        };

        // PDF file signature
        var pdfBytes = new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34 }; // %PDF-1.4

        _mockExportService
            .Setup(x => x.GeneratePdf(
                It.IsAny<OptimizedRoute>(),
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                It.IsAny<PointOfInterest>(),
                null,
                null))
            .Returns(pdfBytes);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<FileContentResult>();
        var fileResult = (FileContentResult)result;
        fileResult.ContentType.Should().Be("application/pdf");
        fileResult.FileDownloadName.Should().Be("itinerary.pdf");
        fileResult.FileContents.Should().StartWith(new byte[] { 0x25, 0x50, 0x44, 0x46 }); // %PDF
    }

    [Fact]
    public async Task ExportPdf_WithMetrics_Returns200()
    {
        // Arrange
        var points = CreateTestPoints();
        var route = new OptimizedRoute
        {
            Sequence = new List<string> { "p1", "p2" },
            RouteMode = RouteMode.Loop
        };
        var metrics = new RouteMetrics
        {
            TotalDistanceKm = 100,
            TotalDurationMin = 120,
            Legs = new List<RouteLeg>
            {
                new() { FromId = "start", ToId = "p1", DistanceKm = 50, DurationMin = 60 }
            }
        };
        var request = new ExportPdfRequest
        {
            Route = route,
            Points = points,
            Metrics = metrics
        };

        var pdfBytes = new byte[] { 0x25, 0x50, 0x44, 0x46 };

        _mockExportService
            .Setup(x => x.GeneratePdf(
                It.IsAny<OptimizedRoute>(),
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                null,
                It.IsAny<RouteMetrics>(),
                null))
            .Returns(pdfBytes);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<FileContentResult>();
        _mockExportService.Verify(x => x.GeneratePdf(
            It.IsAny<OptimizedRoute>(),
            It.IsAny<IReadOnlyList<PointOfInterest>>(),
            null,
            It.Is<RouteMetrics>(m => m.TotalDistanceKm == 100),
            null), Times.Once);
    }

    [Fact]
    public async Task ExportPdf_WithMapScreenshot_Returns200()
    {
        // Arrange
        var points = CreateTestPoints();
        var route = new OptimizedRoute
        {
            Sequence = new List<string> { "p1" },
            RouteMode = RouteMode.Loop
        };
        var mapImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        var request = new ExportPdfRequest
        {
            Route = route,
            Points = points,
            MapImageBase64 = mapImageBase64
        };

        var pdfBytes = new byte[] { 0x25, 0x50, 0x44, 0x46 };

        _mockExportService
            .Setup(x => x.GeneratePdf(
                It.IsAny<OptimizedRoute>(),
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                null,
                null,
                mapImageBase64))
            .Returns(pdfBytes);

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<FileContentResult>();
        _mockExportService.Verify(x => x.GeneratePdf(
            It.IsAny<OptimizedRoute>(),
            It.IsAny<IReadOnlyList<PointOfInterest>>(),
            null,
            null,
            It.Is<string>(s => s == mapImageBase64)), Times.Once);
    }

    [Fact]
    public async Task ExportPdf_WithMissingRoute_Returns400()
    {
        // Arrange
        var points = CreateTestPoints();
        var request = new ExportPdfRequest
        {
            Route = null!,
            Points = points
        };

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task ExportPdf_WithEmptyPoints_Returns400()
    {
        // Arrange
        var route = new OptimizedRoute
        {
            Sequence = new List<string> { "p1" },
            RouteMode = RouteMode.Loop
        };
        var request = new ExportPdfRequest
        {
            Route = route,
            Points = new List<PointOfInterest>()
        };

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task ExportPdf_WhenServiceThrowsException_Returns500()
    {
        // Arrange
        var points = CreateTestPoints();
        var route = new OptimizedRoute
        {
            Sequence = new List<string> { "p1" },
            RouteMode = RouteMode.Loop
        };
        var request = new ExportPdfRequest
        {
            Route = route,
            Points = points
        };

        _mockExportService
            .Setup(x => x.GeneratePdf(
                It.IsAny<OptimizedRoute>(),
                It.IsAny<IReadOnlyList<PointOfInterest>>(),
                It.IsAny<PointOfInterest>(),
                It.IsAny<RouteMetrics>(),
                It.IsAny<string>()))
            .Throws(new Exception("PDF generation failed"));

        var httpRequest = CreateHttpRequest(request);

        // Act
        var result = await _function.Run(httpRequest);

        // Assert
        result.Should().BeOfType<ObjectResult>();
        var objectResult = (ObjectResult)result;
        objectResult.StatusCode.Should().Be(500);
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
