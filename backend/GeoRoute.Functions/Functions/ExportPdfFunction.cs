using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace GeoRoute.Functions.Functions;

public class ExportPdfFunction
{
    private readonly IExportService _exportService;

    public ExportPdfFunction(IExportService exportService)
    {
        _exportService = exportService;
    }

    [Function("ExportPdf")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "export/pdf")]
        HttpRequest req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<ExportPdfRequest>();

            if (request?.Route == null)
            {
                return new BadRequestObjectResult(new { error = "Route is required" });
            }

            if (request.Points == null || request.Points.Count == 0)
            {
                return new BadRequestObjectResult(new { error = "At least one point is required" });
            }

            var pdfBytes = _exportService.GeneratePdf(
                request.Route,
                request.Points,
                request.StartLocation,
                request.Metrics,
                request.MapImageBase64);

            return new FileContentResult(pdfBytes, "application/pdf")
            {
                FileDownloadName = "itinerary.pdf"
            };
        }
        catch (Exception ex)
        {
            return new ObjectResult(new { error = ex.Message })
            {
                StatusCode = 500
            };
        }
    }
}
