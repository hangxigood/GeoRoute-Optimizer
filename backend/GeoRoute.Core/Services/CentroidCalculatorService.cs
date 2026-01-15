using System;
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
        var lat = centroid.Lat;
        var lng = centroid.Lng;

        // Airbnb: Calculate bounding box for search
        // 1 degree latitude ~= 111 km
        // 1 degree longitude ~= 111 km * cos(latitude)
        var deltaLat = radiusKm / 111.0;
        var deltaLng = radiusKm / (111.0 * Math.Cos(lat * Math.PI / 180.0));

        var neLat = (lat + deltaLat).ToString("F4");
        var neLng = (lng + deltaLng).ToString("F4");
        var swLat = (lat - deltaLat).ToString("F4");
        var swLng = (lng - deltaLng).ToString("F4");

        // Format center coordinates
        var latStr = lat.ToString("F4");
        var lngStr = lng.ToString("F4");

        return new BookingLinks
        {
            // Booking.com: Use map view with coordinates to ensure location is respected
            BookingCom = $"https://www.booking.com/searchresults.html?ss=&latitude={latStr}&longitude={lngStr}&map=1",
            
            // Airbnb: Use bounding box with required search parameters to trigger automatic results
            Airbnb = $"https://www.airbnb.com/s/homes?refinement_paths%5B%5D=%2Fhomes&ne_lat={neLat}&ne_lng={neLng}&sw_lat={swLat}&sw_lng={swLng}&zoom=12&search_by_map=true&location_search=NEARBY&source=structured_search_input_header&search_type=unknown"
        };
    }
}
