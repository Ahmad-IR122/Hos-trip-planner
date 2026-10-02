from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.routing_service import get_route
from .services.hos_service import generate_trip_schedule


@api_view(["POST"])
def plan_trip(request):
    data = request.data

    current_location = data.get("current_location")
    pickup_location = data.get("pickup_location")
    dropoff_location = data.get("dropoff_location")
    current_cycle_used = data.get("current_cycle_used")

    if not all(
        [
            current_location,
            pickup_location,
            dropoff_location,
        ]
    ):
        return Response(
            {"error": "All locations are required."},
            status=400,
        )

    try:
        current_cycle_used = float(current_cycle_used)

        route = get_route(
            current_location,
            pickup_location,
            dropoff_location,
        )

        schedule = generate_trip_schedule(
            duration_hours=route["duration_hours"],
            distance_miles=route["distance_miles"],
            current_cycle_used=current_cycle_used,
        )

        return Response(
            {
                "message": "Trip planned successfully",
                "trip": {
                    "current_location": current_location,
                    "pickup_location": pickup_location,
                    "dropoff_location": dropoff_location,
                    "current_cycle_used": current_cycle_used,
                },
                "route": route,
                "schedule": schedule,
            }
        )

    except (TypeError, ValueError):
        return Response(
            {"error": "Invalid trip data."},
            status=400,
        )

    except Exception as error:
        print(error)

        return Response(
            {"error": "Failed to calculate route."},
            status=500,
        )