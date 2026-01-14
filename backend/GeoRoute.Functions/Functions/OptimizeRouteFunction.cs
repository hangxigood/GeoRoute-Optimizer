using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace GeoRoute.Functions.Functions;

public class OptimizeRouteFunction
{
    private readonly IRouteOptimizerService _routeOptimizer;

    public OptimizeRouteFunction(IRouteOptimizerService routeOptimizer)
    {
        _routeOptimizer = routeOptimizer;
    }

    [Function("OptimizeRoute")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "route/optimize")]
        HttpRequest req)
    {
        try
        {
            var request = await req.ReadFromJsonAsync<OptimizeRouteRequest>();

            if (request?.Points == null || request.Points.Count == 0)
            {
                return new BadRequestObjectResult(new { error = "At least one point is required" });
            }

            if (!request.OptimizeSequence && (request.ManualSequence == null || request.ManualSequence.Count == 0))
            {
                return new BadRequestObjectResult(new { error = "ManualSequence is required when OptimizeSequence is false" });
            }

            var result = _routeOptimizer.Optimize(
                request.Points,
                request.StartLocation,
                request.RouteMode,
                request.OptimizeSequence,
                request.ManualSequence);

            return new OkObjectResult(result);
        }
        catch (ArgumentException ex)
        {
            return new BadRequestObjectResult(new { error = ex.Message });
        }
    }
}
