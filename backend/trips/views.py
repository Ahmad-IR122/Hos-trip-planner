from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.eld_service import generate_eld_logs
from .services.hos_service import generate_trip_schedule
from .services.routing_service import get_route


@api_view(["POST"])
def plan_trip(request):
    data = request.data

    current_location = data.get(
        "current_location"
    )
    pickup_location = data.get(
        "pickup_location"
    )
    dropoff_location = data.get(
        "dropoff_location"
    )
    current_cycle_used = data.get(
        "current_cycle_used"
    )

    if not all(
        [
            current_location,
            pickup_location,
            dropoff_location,
        ]
    ):
        return Response(
            {
                "error":
                    "All locations are required."
            },
            status=400,
        )

    try:
        current_cycle_used = float(
            current_cycle_used
        )

        if (
            current_cycle_used < 0
            or current_cycle_used > 70
        ):
            return Response(
                {
                    "error":
                        "Current cycle used must be between 0 and 70 hours."
                },
                status=400,
            )

        route = get_route(
            current_location,
            pickup_location,
            dropoff_location,
        )

        schedule = generate_trip_schedule(
            duration_hours=route[
                "duration_hours"
            ],
            distance_miles=route[
                "distance_miles"
            ],
            current_cycle_used=(
                current_cycle_used
            ),
        )

        eld_logs = generate_eld_logs(
            schedule
        )

        return Response(
            {
                "message":
                    "Trip planned successfully",
                "trip": {
                    "current_location":
                        current_location,
                    "pickup_location":
                        pickup_location,
                    "dropoff_location":
                        dropoff_location,
                    "current_cycle_used":
                        current_cycle_used,
                },
                "route": route,
                "schedule": schedule,
                "eld_logs": eld_logs,
            }
        )

    except (TypeError, ValueError):
        return Response(
            {
                "error":
                    "Invalid trip data."
            },
            status=400,
        )

    except Exception as error:
        print(error)

        return Response(
            {
                "error":
                    "Failed to calculate route."
            },
            status=500,
        )