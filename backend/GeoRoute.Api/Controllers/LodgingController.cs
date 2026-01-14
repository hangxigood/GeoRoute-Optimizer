using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models.Requests;
using Microsoft.AspNetCore.Mvc;

namespace GeoRoute.Api.Controllers;

[ApiController]
[Route("api/lodging")]
public class LodgingController : ControllerBase
{
    private readonly ICentroidCalculatorService _centroidCalculator;

    public LodgingController(ICentroidCalculatorService centroidCalculator)
    {
        _centroidCalculator = centroidCalculator;
    }

    /// <summary>
    /// Calculate the geometric centroid of POIs for lodging recommendations.
    /// </summary>
    [HttpPost("calculate")]
    public IActionResult Calculate([FromBody] CalculateLodgingRequest request)
    {
        if (request.Points == null || request.Points.Count == 0)
        {
            return BadRequest(new { error = "At least one point is required" });
        }

        try
        {
            var result = _centroidCalculator.Calculate(request.Points, request.BufferRadiusKm);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
