using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models.Requests;
using Microsoft.AspNetCore.Mvc;

namespace GeoRoute.Api.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    /// <summary>
    /// Generate a PDF itinerary for the route.
    /// </summary>
    [HttpPost("pdf")]
    public IActionResult GeneratePdf([FromBody] ExportPdfRequest request)
    {
        if (request.Route == null)
        {
            return BadRequest(new { error = "Route is required" });
        }

        if (request.Points == null || request.Points.Count == 0)
        {
            return BadRequest(new { error = "At least one point is required" });
        }

        try
        {
            var pdfBytes = _exportService.GeneratePdf(
                request.Route,
                request.Points,
                request.StartLocation,
                request.Metrics,
                request.MapImageBase64);

            return File(pdfBytes, "application/pdf", "itinerary.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
