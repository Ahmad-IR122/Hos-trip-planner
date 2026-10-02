export type TripFormData = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: string;
};

export type TripData = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
};

export type RouteData = {
  distance_miles: number;
  duration_hours: number;
  coordinates: number[][];
  waypoints: {
    current: number[];
    pickup: number[];
    dropoff: number[];
  };
};

export type ScheduleItem = {
  type: string;
  status: string;
  duration_hours: number;
  start_hour: number;
  end_hour: number;
};

export type EldStatus =
  | "off_duty"
  | "sleeper_berth"
  | "driving"
  | "on_duty_not_driving";

export type EldSegment = {
  type: string;
  status: EldStatus;
  start_hour: number;
  end_hour: number;
  duration_hours: number;
};

export type EldTotals = {
  off_duty: number;
  sleeper_berth: number;
  driving: number;
  on_duty_not_driving: number;
};

export type EldDayLog = {
  day: number;
  segments: EldSegment[];
  totals: EldTotals;
};