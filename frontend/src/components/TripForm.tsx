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
import {RouteMap} from "./RouteMap";
import EldLogs from "./EldLogs";

import type {
  EldDayLog,
  RouteData,
  ScheduleItem,
  TripData,
  TripFormData,
} from "../types/trips";

const initialForm: TripFormData = {
  current_location: "",
  pickup_location: "",
  dropoff_location: "",
  current_cycle_used: "",
};

function formatHour(totalHours: number): string {
  const day = Math.floor(totalHours / 24) + 1;
  const hoursInDay = totalHours % 24;

  let hour = Math.floor(hoursInDay);
  let minutes = Math.round((hoursInDay - hour) * 60);

  if (minutes === 60) {
    hour += 1;
    minutes = 0;
  }

  hour %= 24;

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  const displayMinutes = minutes
    .toString()
    .padStart(2, "0");

  return `Day ${day} - ${displayHour}:${displayMinutes} ${period}`;
}

function formatDuration(hours: number): string {
  if (hours === 1) {
    return "1 hour";
  }

  if (hours < 1) {
    const minutes = Math.round(hours * 60);

    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    }`;
  }

  return `${hours} hours`;
}

function TripForm() {
  const [formData, setFormData] =
    useState<TripFormData>(initialForm);

  const [trip, setTrip] =
    useState<TripData | null>(null);

  const [route, setRoute] =
    useState<RouteData | null>(null);

  const [schedule, setSchedule] =
    useState<ScheduleItem[]>([]);

  const [eldLogs, setEldLogs] =
    useState<EldDayLog[]>([]);

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
      setSchedule(response.data.schedule);
      setEldLogs(response.data.eld_logs);

      setFormData(initialForm);
    } catch (err) {
      console.error(err);

      setTrip(null);
      setRoute(null);
      setSchedule([]);
      setEldLogs([]);

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
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
                mb: 4,
              }}
            >
              Enter your trip details to calculate
              your route, required stops, driving
              schedule, and ELD logs.
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

        {schedule.length > 0 && (
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
                  mb: 3,
                }}
              >
                Trip Schedule
              </Typography>

              <Stack spacing={1.5}>
                {schedule.map(
                  (item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor:
                          "#f5f7fb",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {item.type.replace(
                            "_",
                            " ",
                          )}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {item.status.replace(
                            "_",
                            " ",
                          )}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          textAlign: "right",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {formatHour(
                            item.start_hour,
                          )}
                          {" → "}
                          {formatHour(
                            item.end_hour,
                          )}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatDuration(
                            item.duration_hours,
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ),
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        <EldLogs logs={eldLogs} />
      </Container>
    </Box>
  );
}

export default TripForm;