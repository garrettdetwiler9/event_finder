import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";

const mockEventMarkers = [
  { id: 1, position: { lat: 37.7749, lng: -122.4194 }, title: "Beach Volleyball", color: "#9333ea" },
  { id: 2, position: { lat: 37.7849, lng: -122.4094 }, title: "Pottery Night", color: "#ec4899" },
  { id: 3, position: { lat: 37.7649, lng: -122.4294 }, title: "Board Game Cafe", color: "#f97316" },
  { id: 4, position: { lat: 37.7949, lng: -122.3994 }, title: "EDM Party", color: "#a855f7" },
  { id: 5, position: { lat: 37.7549, lng: -122.4394 }, title: "Food Festival", color: "#fb923c" },
];

export function MapPage() {
  const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-5">
        <h1 className="text-2xl font-bold">Event Map</h1>
        <p className="text-purple-100 mt-1">Explore nearby events</p>
      </div>

      {apiKey === "YOUR_GOOGLE_MAPS_API_KEY" ? (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
            <MapPin className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Map Preview</h2>
            <p className="text-gray-600 mb-4">
              To enable Google Maps, add your API key in the MapPage component.
            </p>
            <p className="text-sm text-gray-500">
              Get your API key at{" "}
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 underline"
              >
                Google Cloud Console
              </a>
            </p>
            <div className="mt-6 space-y-2">
              {mockEventMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: marker.color }}
                  />
                  <span className="text-gray-700">{marker.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
            defaultZoom={13}
            mapId="event-finder-map"
            className="flex-1"
          >
            {mockEventMarkers.map((marker) => (
              <AdvancedMarker key={marker.id} position={marker.position}>
                <Pin background={marker.color} borderColor="#fff" glyphColor="#fff" />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      )}
    </div>
  );
}
