using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models.Requests;
using Microsoft.AspNetCore.Mvc;

namespace GeoRoute.Api.Controllers;

[ApiController]
[Route("api/route")]
public class RouteController : ControllerBase
{
    private readonly IRouteOptimizerService _routeOptimizer;

    public RouteController(IRouteOptimizerService routeOptimizer)
    {
        _routeOptimizer = routeOptimizer;
    }

    /// <summary>
    /// Optimize route sequence for the given POIs.
    /// </summary>
    [HttpPost("optimize")]
    public IActionResult Optimize([FromBody] OptimizeRouteRequest request)
    {
        if (request.Points == null || request.Points.Count == 0)
        {
            return BadRequest(new { error = "At least one point is required" });
        }

        if (!request.OptimizeSequence && (request.ManualSequence == null || request.ManualSequence.Count == 0))
        {
            return BadRequest(new { error = "ManualSequence is required when OptimizeSequence is false" });
        }

        try
        {
            var result = _routeOptimizer.Optimize(
                request.Points,
                request.StartLocation,
                request.RouteMode,
                request.OptimizeSequence,
                request.ManualSequence);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
