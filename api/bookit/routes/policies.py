from fastapi import APIRouter

from ..errors import ERROR_RESPONSES
from ..fixtures import POLICIES, STUDIOS_BY_ID
from ..models import StudioPolicies

router = APIRouter(tags=["policies"], responses=ERROR_RESPONSES)


@router.get("/policies", response_model=list[StudioPolicies])
async def policies():
    """Public: no authentication (docs/prd/studio-policies.md)."""
    return [
        StudioPolicies(
            studio_id=p["studio_id"],
            studio_name=STUDIOS_BY_ID[p["studio_id"]]["name"],
            neighborhood=STUDIOS_BY_ID[p["studio_id"]]["neighborhood"],
            accent=STUDIOS_BY_ID[p["studio_id"]]["accent"],
            rules=p["rules"],
        )
        for p in POLICIES
    ]
