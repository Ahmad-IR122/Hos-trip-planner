import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

type Coordinates = [number, number];

type RouteMapProps = {
  coordinates: number[][];
  waypoints: {
    current: number[];
    pickup: number[];
    dropoff: number[];
  };
};

function toLeafletPosition(coords: number[]): Coordinates {
  return [coords[1], coords[0]];
}

export const RouteMap = ({
  coordinates,
  waypoints,
}: RouteMapProps) => {
  const routePositions: Coordinates[] = coordinates.map(
    (coords) => toLeafletPosition(coords),
  );

  const current = toLeafletPosition(waypoints.current);
  const pickup = toLeafletPosition(waypoints.pickup);
  const dropoff = toLeafletPosition(waypoints.dropoff);

  return (
    <MapContainer
      center={current}
      zoom={6}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "16px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline positions={routePositions} />

      <Marker position={current}>
        <Popup>Current Location</Popup>
      </Marker>

      <Marker position={pickup}>
        <Popup>Pickup Location</Popup>
      </Marker>

      <Marker position={dropoff}>
        <Popup>Dropoff Location</Popup>
      </Marker>
    </MapContainer>
  );
}

