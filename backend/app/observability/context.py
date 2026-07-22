"""Context variables for observability tracing."""

from contextvars import ContextVar
from uuid import UUID

obs_analysis_id: ContextVar[UUID | None] = ContextVar("obs_analysis_id", default=None)
obs_user_id: ContextVar[UUID | None] = ContextVar("obs_user_id", default=None)
