"""Server-side platform gating via X-Platform (docs/prd/feature-flags.md v2)."""
from fastapi import Depends, Request

from .auth import current_user

from .errors import ApiError
from .fixtures import FEATURE_FLAGS


def require_flag(name: str):
    """Dependency: 403 when the caller's X-Platform has the feature switched off.
    Without X-Platform there is no check, so API tests can reach every feature.
    Depends on current_user so authentication errors (401) come before 403."""
    def check(request: Request, _=Depends(current_user)) -> None:
        platform = request.state.platform
        if platform is not None and not FEATURE_FLAGS[platform][name]:
            raise ApiError(403, "FEATURE_UNAVAILABLE")
    return check
