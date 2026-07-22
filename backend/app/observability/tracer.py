import asyncio
import logging
import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_factory
from app.models.llm_trace import LlmTrace
from app.observability.pricing import calculate_cost

logger = logging.getLogger(__name__)

class LLMTracer:
    """Non-blocking tracer for recording LLM telemetry."""

    @staticmethod
    async def _record_trace_async(
        trace_id: uuid.UUID,
        user_id: uuid.UUID | None,
        analysis_id: uuid.UUID | None,
        operation: str,
        provider: str,
        model: str,
        prompt_version: str,
        input_tokens: int | None,
        output_tokens: int | None,
        total_tokens: int | None,
        latency_ms: int,
        status: str,
        retry_count: int,
        error_type: str | None,
        error_message: str | None,
    ):
        """Asynchronous background worker to write trace to DB."""
        try:
            cost = calculate_cost(model, input_tokens, output_tokens)
            
            async with async_session_factory() as session:
                trace = LlmTrace(
                    trace_id=trace_id,
                    user_id=user_id,
                    analysis_id=analysis_id,
                    operation=operation,
                    provider=provider,
                    model=model,
                    prompt_version=prompt_version,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    latency_ms=latency_ms,
                    estimated_cost_usd=cost,
                    status=status,
                    retry_count=retry_count,
                    error_type=error_type,
                    error_message=error_message,
                )
                session.add(trace)
                await session.commit()
        except Exception as e:
            # Swallow exceptions in background task to never break app
            logger.error(f"Failed to record LLM trace {trace_id}: {e}")

    @staticmethod
    def record_trace(
        trace_id: uuid.UUID,
        user_id: uuid.UUID | None,
        analysis_id: uuid.UUID | None,
        operation: str,
        provider: str,
        model: str,
        prompt_version: str,
        input_tokens: int | None,
        output_tokens: int | None,
        total_tokens: int | None,
        latency_ms: int,
        status: str,
        retry_count: int,
        error_type: str | None,
        error_message: str | None,
    ):
        """Fire-and-forget method to record a trace without blocking the main workflow."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(
                LLMTracer._record_trace_async(
                    trace_id=trace_id,
                    user_id=user_id,
                    analysis_id=analysis_id,
                    operation=operation,
                    provider=provider,
                    model=model,
                    prompt_version=prompt_version,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    latency_ms=latency_ms,
                    status=status,
                    retry_count=retry_count,
                    error_type=error_type,
                    error_message=error_message,
                )
            )
        except RuntimeError:
            # If no running loop, just execute synchronously (mostly for tests)
            asyncio.run(
                LLMTracer._record_trace_async(
                    trace_id=trace_id,
                    user_id=user_id,
                    analysis_id=analysis_id,
                    operation=operation,
                    provider=provider,
                    model=model,
                    prompt_version=prompt_version,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=total_tokens,
                    latency_ms=latency_ms,
                    status=status,
                    retry_count=retry_count,
                    error_type=error_type,
                    error_message=error_message,
                )
            )

tracer = LLMTracer()
