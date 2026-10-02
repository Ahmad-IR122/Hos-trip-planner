MAX_DRIVING_HOURS = 11
MAX_DUTY_WINDOW_HOURS = 14

BREAK_AFTER_DRIVING_HOURS = 8
BREAK_DURATION_HOURS = 0.5

REQUIRED_REST_HOURS = 10

MAX_CYCLE_HOURS = 70

PICKUP_DURATION_HOURS = 1
DROPOFF_DURATION_HOURS = 1

FUEL_INTERVAL_MILES = 1000
FUEL_DURATION_HOURS = 0.5

CYCLE_RESTART_HOURS = 34


def get_remaining_cycle_hours(current_cycle_used: float) -> float:
    remaining = MAX_CYCLE_HOURS - current_cycle_used
    return max(remaining, 0)


def needs_break(driving_since_break: float) -> bool:
    return driving_since_break >= BREAK_AFTER_DRIVING_HOURS


def reached_driving_limit(total_driving_hours: float) -> bool:
    return total_driving_hours >= MAX_DRIVING_HOURS


def reached_duty_window(total_duty_window_hours: float) -> bool:
    return total_duty_window_hours >= MAX_DUTY_WINDOW_HOURS


def add_segment(
    schedule: list[dict],
    segment_type: str,
    status: str,
    duration: float,
    current_time: float,
) -> float:
    schedule.append(
        {
            "type": segment_type,
            "status": status,
            "duration_hours": round(duration, 2),
            "start_hour": round(current_time, 2),
            "end_hour": round(current_time + duration, 2),
        }
    )

    return current_time + duration


def generate_trip_schedule(
    duration_hours: float,
    distance_miles: float,
    current_cycle_used: float,
) -> list[dict]:

    schedule = []

    remaining_driving = duration_hours
    cycle_used = current_cycle_used

    driving_today = 0.0
    driving_since_break = 0.0
    duty_window = 0.0

    current_time = 0.0

    miles_since_fuel = 0.0

    average_speed = (
        distance_miles / duration_hours
        if duration_hours > 0
        else 0
    )

    # Pickup
    if get_remaining_cycle_hours(cycle_used) < PICKUP_DURATION_HOURS:
        current_time = add_segment(
            schedule,
            "cycle_rest",
            "off_duty",
            CYCLE_RESTART_HOURS,
            current_time,
        )

        cycle_used = 0
        driving_today = 0
        driving_since_break = 0
        duty_window = 0

    current_time = add_segment(
        schedule,
        "pickup",
        "on_duty",
        PICKUP_DURATION_HOURS,
        current_time,
    )

    duty_window += PICKUP_DURATION_HOURS
    cycle_used += PICKUP_DURATION_HOURS

    while remaining_driving > 0:

        remaining_cycle = get_remaining_cycle_hours(
            cycle_used
        )

        # 70-hour cycle reached
        if remaining_cycle <= 0:
            current_time = add_segment(
                schedule,
                "cycle_rest",
                "off_duty",
                CYCLE_RESTART_HOURS,
                current_time,
            )

            cycle_used = 0
            driving_today = 0
            driving_since_break = 0
            duty_window = 0

            continue

        # 11-hour driving limit
        if driving_today >= MAX_DRIVING_HOURS:
            current_time = add_segment(
                schedule,
                "rest",
                "off_duty",
                REQUIRED_REST_HOURS,
                current_time,
            )

            driving_today = 0
            driving_since_break = 0
            duty_window = 0

            continue

        # 14-hour duty window
        if duty_window >= MAX_DUTY_WINDOW_HOURS:
            current_time = add_segment(
                schedule,
                "rest",
                "off_duty",
                REQUIRED_REST_HOURS,
                current_time,
            )

            driving_today = 0
            driving_since_break = 0
            duty_window = 0

            continue

        # 30-minute break after 8 driving hours
        if driving_since_break >= BREAK_AFTER_DRIVING_HOURS:
            current_time = add_segment(
                schedule,
                "break",
                "off_duty",
                BREAK_DURATION_HOURS,
                current_time,
            )

            duty_window += BREAK_DURATION_HOURS
            driving_since_break = 0

            continue

        # Fuel stop every 1000 miles
        if miles_since_fuel >= FUEL_INTERVAL_MILES:
            # If there isn't enough duty window left for fueling,
            # take the required rest first.
            if (
                duty_window + FUEL_DURATION_HOURS
                > MAX_DUTY_WINDOW_HOURS
            ):
                current_time = add_segment(
                    schedule,
                    "rest",
                    "off_duty",
                    REQUIRED_REST_HOURS,
                    current_time,
                )

                driving_today = 0
                driving_since_break = 0
                duty_window = 0

                continue

            # Fueling is on-duty time,
            # so it also consumes cycle hours.
            if remaining_cycle < FUEL_DURATION_HOURS:
                current_time = add_segment(
                    schedule,
                    "cycle_rest",
                    "off_duty",
                    CYCLE_RESTART_HOURS,
                    current_time,
                )

                cycle_used = 0
                driving_today = 0
                driving_since_break = 0
                duty_window = 0

                continue

            current_time = add_segment(
                schedule,
                "fuel",
                "on_duty",
                FUEL_DURATION_HOURS,
                current_time,
            )

            duty_window += FUEL_DURATION_HOURS
            cycle_used += FUEL_DURATION_HOURS

            # 30 minutes of consecutive non-driving
            # satisfies the break requirement.
            driving_since_break = 0

            miles_since_fuel = 0

            continue

        hours_until_fuel = float("inf")

        if average_speed > 0:
            miles_until_fuel = (
                FUEL_INTERVAL_MILES
                - miles_since_fuel
            )

            hours_until_fuel = (
                miles_until_fuel / average_speed
            )

        available_driving = min(
            remaining_driving,
            MAX_DRIVING_HOURS - driving_today,
            BREAK_AFTER_DRIVING_HOURS
            - driving_since_break,
            MAX_DUTY_WINDOW_HOURS - duty_window,
            remaining_cycle,
            hours_until_fuel,
        )

        if available_driving <= 0:
            continue

        current_time = add_segment(
            schedule,
            "driving",
            "driving",
            available_driving,
            current_time,
        )

        driven_miles = (
            available_driving * average_speed
        )

        remaining_driving -= available_driving

        driving_today += available_driving
        driving_since_break += available_driving
        duty_window += available_driving
        cycle_used += available_driving

        miles_since_fuel += driven_miles

    # Before dropoff, make sure the driver
    # can legally spend another hour on duty.

    if (
        duty_window + DROPOFF_DURATION_HOURS
        > MAX_DUTY_WINDOW_HOURS
    ):
        current_time = add_segment(
            schedule,
            "rest",
            "off_duty",
            REQUIRED_REST_HOURS,
            current_time,
        )

        driving_today = 0
        driving_since_break = 0
        duty_window = 0

    if (
        get_remaining_cycle_hours(cycle_used)
        < DROPOFF_DURATION_HOURS
    ):
        current_time = add_segment(
            schedule,
            "cycle_rest",
            "off_duty",
            CYCLE_RESTART_HOURS,
            current_time,
        )

        cycle_used = 0
        driving_today = 0
        driving_since_break = 0
        duty_window = 0

    current_time = add_segment(
        schedule,
        "dropoff",
        "on_duty",
        DROPOFF_DURATION_HOURS,
        current_time,
    )

    duty_window += DROPOFF_DURATION_HOURS
    cycle_used += DROPOFF_DURATION_HOURS

    return schedule