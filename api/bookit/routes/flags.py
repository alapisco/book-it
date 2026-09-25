from fastapi import APIRouter

from ..errors import ERROR_RESPONSES, ApiError
from ..fixtures import FEATURE_FLAGS
from ..models import FlagMatrix, PlatformFlags

router = APIRouter(prefix="/flags", tags=["feature-flags"], responses=ERROR_RESPONSES)


@router.get("", response_model=FlagMatrix)
async def all_flags():
    return FEATURE_FLAGS


@router.get("/{platform}", response_model=PlatformFlags)
async def platform_flags(platform: str):
    if platform not in FEATURE_FLAGS:
        raise ApiError(404, "UNKNOWN_PLATFORM")
    return FEATURE_FLAGS[platform]
