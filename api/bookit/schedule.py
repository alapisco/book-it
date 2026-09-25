"""The schedule as a pure function of (studio_id, date).

Rules: docs/tech/domain-and-seed-data.md. The PRNG is seeded with
"<studio_id>:<YYYY-MM-DD>", so a date always yields the same classes.
"""
import random
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone

from .fixtures import RULES, STUDIOS_BY_ID


@dataclass(frozen=True)
class ClassSlot:
    id: str
    studio_id: str
    name: str
    category: str
    instructor: str
    start_at: datetime
    duration_min: int
    capacity: int
    filler: int  # seats taken by people other than the seed users
    is_outdoor: bool
    is_anchor: bool = False

    @property
    def end_at(self) -> datetime:
        return self.start_at + timedelta(minutes=self.duration_min)


def generate_day(studio_id: str, day: date) -> list[ClassSlot]:
    studio = STUDIOS_BY_ID[studio_id]
    rng = random.Random(f"{studio_id}:{day.isoformat()}")
    keep = RULES["august_keep_probability"] if day.month == 8 else RULES["keep_probability"]
    slots = []
    for template in studio["templates"]:
        if template.get("outdoor") and day.month not in RULES["outdoor_months"]:
            continue
        if day.weekday() not in template["weekdays"]:
            continue
        hours = set(template["hours"])
        if day.month == 1 and template.get("january_early"):
            hours.add(RULES["january_early_hour"])
        for hour in sorted(hours):
            january_early = day.month == 1 and hour == RULES["january_early_hour"]
            if rng.random() >= keep and not january_early:
                continue
            instructor = rng.choice(template["instructors"])
            capacity = template["capacity"]
            if rng.random() < RULES["full_probability"]:
                filler = capacity
            else:
                filler = rng.randint(0, capacity - 1)
            slots.append(ClassSlot(
                id=f"{studio_id}-{day:%Y%m%d}-{hour:02d}00-{template['slug']}",
                studio_id=studio_id,
                name=template["name"],
                category=template["category"],
                instructor=instructor,
                start_at=datetime.combine(day, time(hour), tzinfo=timezone.utc),
                duration_min=template["duration_min"],
                capacity=capacity,
                filler=filler,
                is_outdoor=bool(template.get("outdoor")),
            ))
    return slots
