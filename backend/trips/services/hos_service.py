MAX_DRIVING_HOURS = 11
MAX_DUTY_WINDOW_HOURS = 14
BREAK_AFTER_DRIVING_HOURS = 8
BREAK_DURATION_HOURS = 0.5
REQUIRED_REST_HOURS = 10
MAX_CYCLE_HOURS = 70
PICKUP_DURATION_HOURS = 1
DROPOFF_DURATION_HOURS = 1
FUEL_INTERVAL_MILES = 1000


def get_remaining_cycle_hours(current_cycle_used: float) -> float:
    """
    Calculate the remaining cycle hours based on the current cycle hours.
    """
    remaining = MAX_CYCLE_HOURS - current_cycle_used
    return max(remaining, 0)


def needs_break(driving_since_break: bool) -> bool:
    """
    Determine if a break is needed based on driving hours since the last break.
    """
    return driving_since_break and (driving_since_break >= BREAK_AFTER_DRIVING_HOURS)


def reached_driving_limit(total_driving_hours: float) -> bool:
    """
    Check if the total driving hours have reached the maximum driving limit.
    """
    return total_driving_hours >= MAX_DRIVING_HOURS


def reached_duty_window(total_duty_window_hours: float) -> bool:
    """
    Check if the total duty window hours have reached the maximum duty window limit.
    """
    return total_duty_window_hours >= MAX_DUTY_WINDOW_HOURS
