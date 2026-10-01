from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "Frontend connected to Django backend"
    })
    
@api_view(['POST'])
def plan_trip(requst):
  data = requst.data
  
  return Response({
    "message": "Trip received successfully",
        "trip": {
            "current_location": data.get("current_location"),
            "pickup_location": data.get("pickup_location"),
            "dropoff_location": data.get("dropoff_location"),
            "current_cycle_used": data.get("current_cycle_used"),
        }
  })