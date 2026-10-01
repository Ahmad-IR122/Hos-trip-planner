import requests
from django.conf import settings


GEOCODE_URL = "https://api.heigit.org/pelias/v1/search"

DIRECTIONS_URL = (
    "https://api.heigit.org/openrouteservice/v2/directions/"
    "driving-hgv/geojson"
)


def geocode_location(location: str) -> list[float]:
    response = requests.get(
        GEOCODE_URL,
        params={
            "api_key": settings.OPENROUTESERVICE_API_KEY,
            "text": location,
            "size": 1,
        },
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()
    features = data.get("features", [])

    if not features:
        raise ValueError(f"Location not found: {location}")

    return features[0]["geometry"]["coordinates"]


def get_route(
    current_location: str,
    pickup_location: str,
    dropoff_location: str,
) -> dict:

    current_coords = geocode_location(current_location)
    pickup_coords = geocode_location(pickup_location)
    dropoff_coords = geocode_location(dropoff_location)

    coordinates = [
        current_coords,
        pickup_coords,
        dropoff_coords,
    ]

    response = requests.post(
        DIRECTIONS_URL,
        headers={
            "Authorization": settings.OPENROUTESERVICE_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "coordinates": coordinates,
        },
        timeout=20,
    )

    if not response.ok:
        raise RuntimeError(
            f"Routing API failed: "
            f"{response.status_code} - {response.text}"
        )

    data = response.json()

    features = data.get("features")

    if not features:
        raise RuntimeError(
            f"Unexpected routing response: {data}"
        )

    feature = features[0]

    summary = feature["properties"]["summary"]

    distance_meters = summary["distance"]
    duration_seconds = summary["duration"]

    return {
        "distance_miles": round(
            distance_meters / 1609.344,
            2,
        ),
        "duration_hours": round(
            duration_seconds / 3600,
            2,
        ),
        "coordinates": feature["geometry"]["coordinates"],
        "waypoints": {
            "current": current_coords,
            "pickup": pickup_coords,
            "dropoff": dropoff_coords,
        },
    }