using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace GeoRoute.Functions.Functions;

public class CalculateLodgingFunction
{
    private readonly ICentroidCalculatorService _centroidCalculator;

    public CalculateLodgingFunction(ICentroidCalculatorService centroidCalculator)
    {
        _centroidCalculator = centroidCalculator;
    }

    [Function("CalculateLodging")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "lodging/calculate")]
        HttpRequest req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<CalculateLodgingRequest>();

            if (request?.Points == null || request.Points.Count == 0)
            {
                return new BadRequestObjectResult(new { error = "At least one point is required" });
            }

            var result = _centroidCalculator.Calculate(request.Points, request.BufferRadiusKm);
            return new OkObjectResult(result);
        }
        catch (ArgumentException ex)
        {
            return new BadRequestObjectResult(new { error = ex.Message });
        }
    }
}
