import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import markerImage from "../assets/marker.svg";

type Coordinates = [number, number];

type RouteMapProps = {
  coordinates: number[][];
  waypoints: {
    current: number[];
    pickup: number[];
    dropoff: number[];
  };
  locations: {
    current: string;
    pickup: string;
    dropoff: string;
  };
};

function toLeafletPosition(coords: number[]): Coordinates {
  return [coords[1], coords[0]];
}

const markerIcon = L.icon({
  iconUrl: markerImage,
  iconRetinaUrl: markerImage,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

L.Marker.prototype.options.icon = markerIcon;

export const RouteMap = ({
  coordinates,
  waypoints,
  locations,
}: RouteMapProps) => {
  const routePositions: Coordinates[] = coordinates.map((coords) =>
    toLeafletPosition(coords),
  );

  const current = toLeafletPosition(waypoints.current);
  const pickup = toLeafletPosition(waypoints.pickup);
  const dropoff = toLeafletPosition(waypoints.dropoff);

  return (
    <MapContainer
      bounds={routePositions}
      boundsOptions={{
        padding: [10, 10],
      }}
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

      <Marker position={current} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -20]}>
          {locations.current}
        </Tooltip>

        <Popup>
          <strong>Current Location</strong>
          <br />
          {locations.current}
        </Popup>
      </Marker>

      <Marker position={pickup} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -20]}>
          {locations.pickup}
        </Tooltip>

        <Popup>
          <strong>Pickup Location</strong>
          <br />
          {locations.pickup}
        </Popup>
      </Marker>

      <Marker position={dropoff} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -20]}>
          {locations.dropoff}
        </Tooltip>

        <Popup>
          <strong>Dropoff Location</strong>
          <br />
          {locations.dropoff}
        </Popup>
      </Marker>
    </MapContainer>
  );
};