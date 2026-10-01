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

type TripFormData = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: string;
};

const initialForm: TripFormData = {
  current_location: "",
  pickup_location: "",
  dropoff_location: "",
  current_cycle_used: "",
};

const TripForm = () => {
  const [formData, setFormData] = useState<TripFormData>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const payload = {
      ...formData,
      current_cycle_used: Number(formData.current_cycle_used),
    };

    try {
      const response = await api.post("/plan-trip/", payload);

      setMessage(response.data.message);

      setFormData(initialForm);
    } catch (err) {
      console.error(err);

      setError("Failed to plan trip. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.08)",
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
              Enter your trip details to calculate your route, required stops,
              and driving schedule.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  required
                  label="Current Location"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  required
                  label="Pickup Location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  required
                  label="Dropoff Location"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleChange}
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
                  sx={{
                    py: 1.4,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  Plan Trip
                </Button>

                {message && <Alert severity="success">{message}</Alert>}

                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default TripForm;
