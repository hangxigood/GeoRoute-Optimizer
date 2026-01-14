using System.Web;
using GeoRoute.Core.Interfaces;
using GeoRoute.Core.Models;
using NetTopologySuite.Geometries;

namespace GeoRoute.Core.Services;

/// <summary>
/// Calculates the geometric centroid of POIs using NetTopologySuite.
/// </summary>
public class CentroidCalculatorService : ICentroidCalculatorService
{
    private readonly GeometryFactory _geometryFactory;

    public CentroidCalculatorService()
    {
        _geometryFactory = new GeometryFactory(new PrecisionModel(), 4326); // WGS84
    }

    public LodgingZone Calculate(IReadOnlyList<PointOfInterest> points, double bufferRadiusKm = 5)
    {
        ArgumentNullException.ThrowIfNull(points);

        if (points.Count == 0)
        {
            throw new ArgumentException("At least one point is required", nameof(points));
        }

        // Create coordinates array from POIs
        var coordinates = points
            .Select(p => new Coordinate(p.Lng, p.Lat))
            .ToArray();

        // Calculate centroid
        LatLng centroidLatLng;

        if (points.Count == 1)
        {
            // Single point: centroid is the point itself
            centroidLatLng = new LatLng(points[0].Lat, points[0].Lng);
        }
        else
        {
            // Multiple points: calculate geometric centroid
            var multiPoint = _geometryFactory.CreateMultiPointFromCoords(coordinates);
            var centroid = multiPoint.Centroid;
            centroidLatLng = new LatLng(centroid.Y, centroid.X);
        }

        // Generate booking links
        var bookingLinks = GenerateBookingLinks(centroidLatLng, bufferRadiusKm);

        return new LodgingZone
        {
            Centroid = centroidLatLng,
            BufferRadiusKm = bufferRadiusKm,
            BookingLinks = bookingLinks
        };
    }

    private static BookingLinks GenerateBookingLinks(LatLng centroid, double radiusKm)
    {
        var lat = centroid.Lat.ToString("F4");
        var lng = centroid.Lng.ToString("F4");

        return new BookingLinks
        {
            BookingCom = $"https://www.booking.com/searchresults.html?ss={HttpUtility.UrlEncode($"{lat},{lng}")}&radius={radiusKm}",
            Airbnb = $"https://www.airbnb.com/s/homes?lat={lat}&lng={lng}"
        };
    }
}
