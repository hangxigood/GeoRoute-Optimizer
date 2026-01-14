using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GeoRoute.Core;

/// <summary>
/// Extension methods for registering GeoRoute.Core services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds GeoRoute core services to the DI container.
    /// </summary>
    public static IServiceCollection AddGeoRouteCore(this IServiceCollection services)
    {
        services.AddSingleton<ICentroidCalculatorService, CentroidCalculatorService>();
        services.AddSingleton<IRouteOptimizerService, RouteOptimizerService>();
        services.AddSingleton<IExportService, ExportService>();

        return services;
    }
}
