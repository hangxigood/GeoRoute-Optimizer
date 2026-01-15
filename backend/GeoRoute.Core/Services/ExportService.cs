using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GeoRoute.Core.Services;

/// <summary>
/// Generates PDF itinerary exports using QuestPDF.
/// </summary>
public class ExportService : IExportService
{
    static ExportService()
    {
        // Set QuestPDF license for community use
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GeneratePdf(
        OptimizedRoute route,
        IReadOnlyList<PointOfInterest> points,
        PointOfInterest? startLocation,
        RouteMetrics? metrics = null,
        string? mapImageBase64 = null)
    {
        var pointLookup = points.ToDictionary(p => p.Id);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(c => ComposeHeader(c, route));
                page.Content().Element(c => ComposeContent(c, route, pointLookup, startLocation, metrics, mapImageBase64));
                page.Footer().Element(ComposeFooter);
            });
        });

        using var stream = new MemoryStream();
        document.GeneratePdf(stream);
        return stream.ToArray();
    }

    private static void ComposeHeader(IContainer container, OptimizedRoute route)
    {
        container.Column(column =>
        {
            column.Item().Text("GeoRoute Optimizer")
                .FontSize(24)
                .Bold()
                .FontColor(Colors.Blue.Darken2);

            column.Item().Text("Your Travel Itinerary")
                .FontSize(14)
                .FontColor(Colors.Grey.Darken1);

            column.Item().PaddingTop(10).Row(row =>
            {
                row.RelativeItem().Text($"Mode: {route.RouteMode}")
                    .FontSize(10)
                    .FontColor(Colors.Grey.Medium);

                row.RelativeItem().AlignRight().Text($"Generated: {DateTime.Now:yyyy-MM-dd}")
                    .FontSize(10)
                    .FontColor(Colors.Grey.Medium);
            });

            column.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
        });
    }

    private static void ComposeContent(
        IContainer container,
        OptimizedRoute route,
        Dictionary<string, PointOfInterest> pointLookup,
        PointOfInterest? startLocation,
        RouteMetrics? metrics = null,
        string? mapImageBase64 = null)
    {
        container.PaddingVertical(20).Column(column =>
        {
            // Map image if provided
            if (!string.IsNullOrEmpty(mapImageBase64))
            {
                try
                {
                    var imageData = Convert.FromBase64String(mapImageBase64.Split(',')[^1]);
                    column.Item().PaddingBottom(15).Image(imageData).FitWidth();
                }
                catch
                {
                    // Silently skip if image decode fails
                }
            }

            // Summary box
            column.Item().Background(Colors.Blue.Lighten5).Padding(15).Column(summary =>
            {
                summary.Item().Text("Trip Summary")
                    .FontSize(14)
                    .Bold();

                summary.Item().PaddingTop(10).Row(row =>
                {
                    row.RelativeItem().Column(c =>
                    {
                        c.Item().Text("Stops").FontSize(10).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"{route.Sequence.Count}").FontSize(16).Bold();
                    });

                    row.RelativeItem().Column(c =>
                    {
                        c.Item().Text("Mode").FontSize(10).FontColor(Colors.Grey.Darken1);
                        c.Item().Text(route.RouteMode.ToString()).FontSize(16).Bold();
                    });

                    if (metrics != null)
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Distance").FontSize(10).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{metrics.TotalDistanceKm:F1} km").FontSize(16).Bold();
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Duration").FontSize(10).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(FormatDuration(metrics.TotalDurationMin)).FontSize(16).Bold();
                        });
                    }
                });
            });

            // Itinerary
            column.Item().PaddingTop(20).Text("Itinerary")
                .FontSize(14)
                .Bold();

            // Start location
            if (startLocation != null)
            {
                column.Item().PaddingTop(10).Row(row =>
                {
                    row.ConstantItem(30).AlignCenter().Text("📍").FontSize(16);
                    row.RelativeItem().Column(c =>
                    {
                        c.Item().Text(startLocation.Name).Bold();
                        c.Item().Text("Starting Point").FontSize(9).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"{startLocation.Lat:F4}, {startLocation.Lng:F4}")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Darken1);
                    });
                });

                // Show leg from start to first POI if metrics available
                if (metrics?.Legs != null && route.Sequence.Count > 0)
                {
                    var firstPoiId = route.Sequence.First();
                    var leg = metrics.Legs.FirstOrDefault(l => 
                        (l.FromId == startLocation.Name) && 
                        (l.ToId == pointLookup.GetValueOrDefault(firstPoiId)?.Name || l.ToId == firstPoiId));
                    
                    if (leg != null)
                    {
                        column.Item().PaddingLeft(30).PaddingTop(3).Text($"↓ {leg.DistanceKm:F1} km • {FormatDuration(leg.DurationMin)}")
                            .FontSize(9)
                            .FontColor(Colors.Blue.Medium);
                    }
                }
            }

            // Optimized sequence
            int stopNumber = 1;
            var sequenceList = route.Sequence.ToList();
            
            for (int i = 0; i < sequenceList.Count; i++)
            {
                var poiId = sequenceList[i];
                if (pointLookup.TryGetValue(poiId, out var poi))
                {
                    column.Item().PaddingTop(10).Row(row =>
                    {
                        row.ConstantItem(30).AlignCenter()
                            .Background(Colors.Blue.Medium)
                            .Width(24)
                            .Height(24)
                            .AlignCenter()
                            .AlignMiddle()
                            .Text($"{stopNumber}")
                            .FontSize(12)
                            .FontColor(Colors.White)
                            .Bold();

                        row.RelativeItem().PaddingLeft(10).Column(c =>
                        {
                            c.Item().Text(poi.Name).Bold();
                            c.Item().Text($"{poi.Lat:F4}, {poi.Lng:F4}")
                                .FontSize(9)
                                .FontColor(Colors.Grey.Darken1);
                        });
                    });

                    // Show leg info to next stop if metrics available
                    if (metrics?.Legs != null && i < sequenceList.Count - 1)
                    {
                        var nextPoiId = sequenceList[i + 1];
                        var leg = metrics.Legs.FirstOrDefault(l => 
                            (l.FromId == poi.Name || l.FromId == poiId) && 
                            (l.ToId == pointLookup.GetValueOrDefault(nextPoiId)?.Name || l.ToId == nextPoiId));
                        
                        if (leg != null)
                        {
                            column.Item().PaddingLeft(30).PaddingTop(3).Text($"↓ {leg.DistanceKm:F1} km • {FormatDuration(leg.DurationMin)}")
                                .FontSize(9)
                                .FontColor(Colors.Blue.Medium);
                        }
                    }
                    // Show leg back to start for loop mode
                    else if (metrics?.Legs != null && i == sequenceList.Count - 1 && route.RouteMode == RouteMode.Loop && startLocation != null)
                    {
                        var leg = metrics.Legs.FirstOrDefault(l => 
                            (l.FromId == poi.Name || l.FromId == poiId) && 
                            (l.ToId == startLocation.Name));
                        
                        if (leg != null)
                        {
                            column.Item().PaddingLeft(30).PaddingTop(3).Text($"↓ {leg.DistanceKm:F1} km • {FormatDuration(leg.DurationMin)}")
                                .FontSize(9)
                                .FontColor(Colors.Blue.Medium);
                        }
                    }

                    stopNumber++;
                }
            }

            // Return to start indicator for loop mode
            if (route.RouteMode == RouteMode.Loop && startLocation != null)
            {
                column.Item().PaddingTop(10).Row(row =>
                {
                    row.ConstantItem(30).AlignCenter().Text("↩️").FontSize(16);
                    row.RelativeItem().Text($"Return to {startLocation.Name}")
                        .FontSize(10)
                        .FontColor(Colors.Grey.Darken1);
                });
            }
        });
    }

    private static void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Text(text =>
        {
            text.Span("Generated by GeoRoute Optimizer • ")
                .FontSize(9)
                .FontColor(Colors.Grey.Medium);
            text.CurrentPageNumber().FontSize(9).FontColor(Colors.Grey.Medium);
            text.Span(" / ").FontSize(9).FontColor(Colors.Grey.Medium);
            text.TotalPages().FontSize(9).FontColor(Colors.Grey.Medium);
        });
    }

    private static string FormatDuration(double minutes)
    {
        var hours = (int)(minutes / 60);
        var mins = (int)(minutes % 60);

        if (hours > 0)
        {
            return $"{hours}h {mins}m";
        }
        return $"{mins} min";
    }
}
