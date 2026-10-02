import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import api from "../api/api";
import { RouteMap } from "./RouteMap";

type TripFormData = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: string;
};

type TripData = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
};

type RouteData = {
  distance_miles: number;
  duration_hours: number;
  coordinates: number[][];
  waypoints: {
    current: number[];
    pickup: number[];
    dropoff: number[];
  };
};

const initialForm: TripFormData = {
  current_location: "",
  pickup_location: "",
  dropoff_location: "",
  current_cycle_used: "",
};

function TripForm() {
  const [formData, setFormData] = useState<TripFormData>(initialForm);

  const [trip, setTrip] = useState<TripData | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    if (
      name === "current_cycle_used" &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const cycleUsed = Number(
      formData.current_cycle_used,
    );

    if (cycleUsed < 0 || cycleUsed > 70) {
      setError(
        "Current cycle used must be between 0 and 70 hours.",
      );
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      current_cycle_used: cycleUsed,
    };

    try {
      const response = await api.post(
        "/plan-trip/",
        payload,
      );

      setMessage(response.data.message);

      setTrip(response.data.trip);
      setRoute(response.data.route);

      setFormData(initialForm);
    } catch (err) {
      console.error(err);

      setTrip(null);
      setRoute(null);

      setError(
        "Failed to calculate the trip. Please check your locations and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow:
              "0 12px 35px rgba(0, 0, 0, 0.08)",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 1,
              }}
            >
              Plan Your Trip
            </Typography>

            <Typography
              component="p"
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
                mb: 4,
              }}
            >
              Enter your trip details to calculate
              your route, required stops, and driving
              schedule.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  required
                  label="Current Location"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleChange}
                  placeholder="Chicago"
                />

                <TextField
                  fullWidth
                  required
                  label="Pickup Location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  placeholder="Detroit"
                />

                <TextField
                  fullWidth
                  required
                  label="Dropoff Location"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleChange}
                  placeholder="New York"
                />

                <TextField
                  fullWidth
                  required
                  type="text"
                  label="Current Cycle Used"
                  name="current_cycle_used"
                  value={formData.current_cycle_used}
                  onChange={handleChange}
                  helperText="Hours already used in the current 70-hour / 8-day cycle"
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.4,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {loading
                    ? "Planning..."
                    : "Plan Trip"}
                </Button>

                {message && (
                  <Alert severity="success">
                    {message}
                  </Alert>
                )}

                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {route && trip && (
          <Card
            sx={{
              mt: 4,
              borderRadius: 4,
              boxShadow:
                "0 12px 35px rgba(0, 0, 0, 0.08)",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 3,
                  md: 4,
                },
              }}
            >
              <Typography
                component="h2"
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Trip Route
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={3}
                sx={{
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Distance
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {route.distance_miles} miles
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Estimated Driving Time
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {route.duration_hours} hours
                  </Typography>
                </Box>
              </Stack>

              <RouteMap
                coordinates={route.coordinates}
                waypoints={route.waypoints}
                locations={{
                  current: trip.current_location,
                  pickup: trip.pickup_location,
                  dropoff: trip.dropoff_location,
                }}
              />
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

export default TripForm;