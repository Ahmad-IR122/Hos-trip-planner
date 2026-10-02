ELD_STATUSES = (
    "off_duty",
    "sleeper_berth",
    "driving",
    "on_duty_not_driving",
)


def get_eld_status(segment: dict) -> str:
    segment_type = segment["type"]

    if segment_type == "driving":
        return "driving"

    if segment_type in {"rest", "cycle_rest"}:
        return "sleeper_berth"

    if segment_type == "break":
        return "off_duty"

    if segment_type in {
        "pickup",
        "dropoff",
        "fuel",
    }:
        return "on_duty_not_driving"

    return "off_duty"


def create_day_log(day_number: int) -> dict:
    return {
        "day": day_number,
        "segments": [],
        "totals": {
            "off_duty": 0.0,
            "sleeper_berth": 0.0,
            "driving": 0.0,
            "on_duty_not_driving": 0.0,
        },
    }


def add_eld_segment(
    day_log: dict,
    segment_type: str,
    status: str,
    start_hour: float,
    end_hour: float,
) -> None:
    duration = end_hour - start_hour

    day_log["segments"].append(
        {
            "type": segment_type,
            "status": status,
            "start_hour": round(start_hour, 2),
            "end_hour": round(end_hour, 2),
            "duration_hours": round(duration, 2),
        }
    )

    day_log["totals"][status] += duration


def generate_eld_logs(
    schedule: list[dict],
) -> list[dict]:
    if not schedule:
        return []

    final_hour = max(
        segment["end_hour"]
        for segment in schedule
    )

    total_days = max(
        1,
        int((final_hour - 0.000001) // 24) + 1,
    )

    logs = [
        create_day_log(day + 1)
        for day in range(total_days)
    ]

    for segment in schedule:
        absolute_start = segment["start_hour"]
        absolute_end = segment["end_hour"]

        status = get_eld_status(segment)

        while absolute_start < absolute_end:
            day_index = int(
                absolute_start // 24
            )

            day_start = day_index * 24
            day_end = day_start + 24

            split_end = min(
                absolute_end,
                day_end,
            )

            local_start = (
                absolute_start - day_start
            )

            local_end = (
                split_end - day_start
            )

            add_eld_segment(
                logs[day_index],
                segment["type"],
                status,
                local_start,
                local_end,
            )

            absolute_start = split_end

    # Fill any remaining time after the trip
    # as Off Duty so every daily log reaches 24h.
    last_log = logs[-1]

    if last_log["segments"]:
        last_end = max(
            segment["end_hour"]
            for segment in last_log["segments"]
        )

        if last_end < 24:
            add_eld_segment(
                last_log,
                "post_trip",
                "off_duty",
                last_end,
                24,
            )

    for log in logs:
        for status in ELD_STATUSES:
            log["totals"][status] = round(
                log["totals"][status],
                2,
            )

    return logs