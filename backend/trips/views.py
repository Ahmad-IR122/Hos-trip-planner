from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.routing_service import get_route

# Create your views here.


def health_check(request):
    return JsonResponse(
        {"status": "ok", "message": "Frontend connected to Django backend"}
    )


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
        route = get_route(
            current_location,
            pickup_location,
            dropoff_location,
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
            }
        )

    except ValueError as error:
        return Response(
            {"error": str(error)},
            status=400,
        )

    except Exception as error:
        print(error)

        return Response(
            {"error": "Failed to calculate route."},
            status=500,
        )
