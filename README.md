# 🚛 HOS Trip Planner

 A full-stack truck trip planning application that calculates routes, applies Hours of Service (HOS) rules, generates required stops and rest periods, and creates daily ELD log sheets.

---

## ✨ Highlights

- 🗺️ Interactive truck route planning
- 📍 Current, pickup, and dropoff locations
- ⏱️ Estimated distance and driving duration
- 🚦 HOS-aware trip scheduling
- ☕ 30-minute break handling
- 🛏️ 10-hour rest periods
- ⛽ Fuel planning every 1,000 miles
- 📊 Multi-day ELD log generation
- 📱 Responsive React interface
- ⚙️ Django REST API backend

---

## 🧭 How It Works

```text
Trip Input
   ↓
Geocoding
   ↓
Truck Route Calculation
   ↓
HOS Scheduling
   ↓
Stops / Breaks / Rest
   ↓
Daily ELD Logs
```

The user enters:

- Current location
- Pickup location
- Dropoff location
- Current cycle used hours

The system then calculates the route, builds an HOS-aware schedule, and generates daily ELD logs.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| 🎨 Frontend | React, TypeScript, Vite, Material UI |
| 🌍 Maps | React Leaflet, OpenStreetMap |
| 🔌 API Client | Axios |
| 🧠 Backend | Python, Django, Django REST Framework |
| 🗺️ Routing | OpenRouteService |
| 🔐 Config | django-environ |
| 🌐 CORS | django-cors-headers |
| 🚀 Production Server | Gunicorn |

---

## 🧩 Project Structure

```text
hos-trip-planner/
├── backend/
│   ├── config/
│   ├── trips/
│   │   ├── services/
│   │   │   ├── routing_service.py
│   │   │   ├── hos_service.py
│   │   │   └── eld_service.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TripForm.tsx
│   │   │   ├── RouteMap.tsx
│   │   │   └── EldLogs.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── trip.ts
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🚦 HOS Logic

The planner is built around these assessment assumptions:

- Property-carrying commercial driver
- 70-hour / 8-day cycle
- No adverse driving conditions
- Fueling at least once every 1,000 miles
- 1 hour for pickup
- 1 hour for dropoff

The scheduling logic also handles:

- Maximum 11 hours of driving after the required rest period
- Maximum 14-hour duty window
- 30-minute break after 8 cumulative driving hours
- 10 consecutive hours of rest before a new driving period
- 34-hour restart when the 70-hour cycle is exhausted

---

## ⛽ Trip Events

| Event | Duty Status |
|---|---|
| 🚚 Driving | Driving |
| 📦 Pickup | On Duty Not Driving |
| 📍 Dropoff | On Duty Not Driving |
| ⛽ Fuel | On Duty Not Driving |
| ☕ 30-Minute Break | Off Duty |
| 🛏️ 10-Hour Rest | Sleeper Berth |
| 🔄 34-Hour Restart | Sleeper Berth |

---

## 📊 ELD Logs

The application converts the trip schedule into daily 24-hour ELD logs.

Supported duty statuses:

```text
Off Duty
Sleeper Berth
Driving
On Duty Not Driving
```

For longer routes, the system automatically generates multiple daily log sheets.

---

## 🗺️ Routing

OpenRouteService is used for:

- Location geocoding
- Truck route calculation
- Route geometry
- Distance
- Estimated driving duration

The backend uses the heavy goods vehicle profile:

```text
driving-hgv
```

---

# 🚀 Getting Started

## 1️⃣ Backend Setup

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` from `.env.example`:

```env
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Run migrations:

```bash
python manage.py migrate
```

Start Django:

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000
```

---

## 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start Vite:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔌 API

## Plan Trip

```http
POST /api/plan-trip/
```

Example request:

```json
{
  "current_location": "Chicago",
  "pickup_location": "Detroit",
  "dropoff_location": "New York",
  "current_cycle_used": 20
}
```

Response structure:

```json
{
  "message": "Trip planned successfully",
  "trip": {},
  "route": {},
  "schedule": [],
  "eld_logs": []
}
```

---

# 🧪 Testing

Backend checks:

```bash
cd backend
python manage.py check
python manage.py test
```

Frontend build:

```bash
cd frontend
npm run build
```

---

# 🌐 Production

Backend command:

```bash
gunicorn config.wsgi:application
```

Frontend environment:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Backend environment:

```env
OPENROUTESERVICE_API_KEY=your_api_key
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

## 📝 Notes

`current_cycle_used` represents the number of hours already used in the driver's current 70-hour / 8-day cycle.

Because the input only provides the total used cycle hours, the planner uses that number as the starting cycle balance rather than reconstructing the driver's previous eight duty days individually.

Fuel timing is estimated using accumulated route distance and average trip speed.

Schedule times are shown relative to the beginning of the trip using Day 1, Day 2, and so on.

---

## 👨‍💻 Author

**Ahmad Irshaid**

---

<p align="center">
  🚛 Built for practical HOS trip planning, route visualization, and ELD generation.
</p>
