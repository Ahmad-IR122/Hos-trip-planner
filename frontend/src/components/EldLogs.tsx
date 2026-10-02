import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import type {
  EldDayLog,
  EldStatus,
} from "../types/trips";

type EldLogsProps = {
  logs: EldDayLog[];
};

const STATUS_ROWS: {
  status: EldStatus;
  label: string;
}[] = [
  {
    status: "off_duty",
    label: "Off Duty",
  },
  {
    status: "sleeper_berth",
    label: "Sleeper Berth",
  },
  {
    status: "driving",
    label: "Driving",
  },
  {
    status: "on_duty_not_driving",
    label: "On Duty",
  },
];

const CHART_START_X = 150;
const CHART_WIDTH = 900;

const ROW_Y: Record<EldStatus, number> = {
  off_duty: 50,
  sleeper_berth: 90,
  driving: 130,
  on_duty_not_driving: 170,
};

function hourToX(hour: number) {
  return (
    CHART_START_X +
    (hour / 24) * CHART_WIDTH
  );
}

function getSegmentPath(
  log: EldDayLog,
): string {
  if (log.segments.length === 0) {
    return "";
  }

  const segments = [...log.segments].sort(
    (a, b) =>
      a.start_hour - b.start_hour,
  );

  let path = "";

  segments.forEach(
    (segment, index) => {
      const startX = hourToX(
        segment.start_hour,
      );

      const endX = hourToX(
        segment.end_hour,
      );

      const y = ROW_Y[segment.status];

      if (index === 0) {
        path += `M ${startX} ${y}`;
      } else {
        const previous =
          segments[index - 1];

        const previousY =
          ROW_Y[previous.status];

        path += ` L ${startX} ${previousY}`;
        path += ` L ${startX} ${y}`;
      }

      path += ` L ${endX} ${y}`;
    },
  );

  return path;
}

function formatTotal(hours: number) {
  if (hours === 0) {
    return "0h";
  }

  const wholeHours = Math.floor(hours);

  const minutes = Math.round(
    (hours - wholeHours) * 60,
  );

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  if (wholeHours === 0) {
    return `${minutes}m`;
  }

  return `${wholeHours}h ${minutes}m`;
}

function EldLogs({
  logs,
}: EldLogsProps) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <Stack spacing={4} sx={{ mt: 4 }}>
      {logs.map((log) => (
        <Card
          key={log.day}
          sx={{
            borderRadius: 4,
            boxShadow:
              "0 12px 35px rgba(0, 0, 0, 0.08)",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                md: 4,
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              ELD Log — Day {log.day}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              24-Hour Driver Duty Status
            </Typography>

            <Box
              sx={{
                overflowX: "auto",
              }}
            >
              <svg
                viewBox="0 0 1100 220"
                width="100%"
                style={{
                  minWidth: "850px",
                }}
              >
                {STATUS_ROWS.map(
                  (row) => (
                    <g key={row.status}>
                      <text
                        x="10"
                        y={
                          ROW_Y[row.status] +
                          5
                        }
                        fontSize="14"
                        fontWeight="600"
                      >
                        {row.label}
                      </text>

                      <line
                        x1={CHART_START_X}
                        y1={
                          ROW_Y[row.status]
                        }
                        x2={
                          CHART_START_X +
                          CHART_WIDTH
                        }
                        y2={
                          ROW_Y[row.status]
                        }
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    </g>
                  ),
                )}

                {Array.from(
                  { length: 25 },
                  (_, hour) => {
                    const x =
                      hourToX(hour);

                    return (
                      <g key={hour}>
                        <line
                          x1={x}
                          y1="30"
                          x2={x}
                          y2="185"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />

                        {hour < 24 && (
                          <text
                            x={x + 3}
                            y="205"
                            fontSize="11"
                          >
                            {hour}
                          </text>
                        )}
                      </g>
                    );
                  },
                )}

                <path
                  d={getSegmentPath(log)}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              sx={{
                mt: 3,
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 130,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Off Duty
                </Typography>

                <Typography
                  sx={{ fontWeight: 700 }}
                >
                  {formatTotal(
                    log.totals.off_duty,
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 130,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Sleeper Berth
                </Typography>

                <Typography
                  sx={{ fontWeight: 700 }}
                >
                  {formatTotal(
                    log.totals
                      .sleeper_berth,
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 130,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Driving
                </Typography>

                <Typography
                  sx={{ fontWeight: 700 }}
                >
                  {formatTotal(
                    log.totals.driving,
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 150,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  On Duty Not Driving
                </Typography>

                <Typography
                  sx={{ fontWeight: 700 }}
                >
                  {formatTotal(
                    log.totals
                      .on_duty_not_driving,
                  )}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default EldLogs;