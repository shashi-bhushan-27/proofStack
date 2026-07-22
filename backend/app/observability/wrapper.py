import asyncio
import logging
import time
import uuid
from typing import Type, TypeVar
from pydantic import BaseModel

from app.ai.provider import LLMProvider
from app.observability.context import obs_analysis_id, obs_user_id
from app.observability.tracer import tracer

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)

class ObservableProvider(LLMProvider):
    """
    Wrapper around an existing LLMProvider that records telemetry.
    Acts as a drop-in replacement.
    """

    def __init__(self, underlying_provider: LLMProvider):
        self.underlying_provider = underlying_provider

    async def generate_structured_with_usage(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.1,
    ) -> tuple[T, dict[str, int | None], int]:
        """Delegate to underlying provider directly (observability wrapper is usually for standard calls)."""
        if hasattr(self.underlying_provider, 'generate_structured_with_usage'):
            return await self.underlying_provider.generate_structured_with_usage(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_schema=response_schema,
                temperature=temperature,
            )
        else:
            result = await self.underlying_provider.generate_structured(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_schema=response_schema,
                temperature=temperature,
            )
            return result, {"input_tokens": None, "output_tokens": None, "total_tokens": None}, 0

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.1,
    ) -> T:
        """Infer operation from system prompt and delegate."""
        from app.observability.versions import PromptVersions
        
        operation = "unknown"
        prompt_version = "unknown:v0"
        
        lower_prompt = system_prompt.lower()
        if "job description text carefully" in lower_prompt:
            operation = "jd_extraction"
            prompt_version = PromptVersions.JD_EXTRACTION
        elif "resume parser and structured data" in lower_prompt:
            operation = "resume_parsing"
            prompt_version = PromptVersions.RESUME_PARSING
        elif "evidence classification expert" in lower_prompt:
            operation = "evidence_classification"
            prompt_version = PromptVersions.EVIDENCE_CLASSIFICATION
        elif "interrogation expert" in lower_prompt:
            operation = "interrogation_question"
            prompt_version = PromptVersions.INTERROGATION_QUESTION
        elif "star-aligned resume bullet point" in lower_prompt:
            operation = "bullet_generation"
            prompt_version = PromptVersions.BULLET_GENERATION
        elif "resume recommendation engine" in lower_prompt:
            operation = "recommendation_generation"
            prompt_version = PromptVersions.RECOMMENDATION_GENERATION
            
        return await self.generate_structured_with_context(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_schema=response_schema,
            temperature=temperature,
            operation=operation,
            prompt_version=prompt_version,
        )
        
    async def generate_structured_with_context(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        operation: str,
        prompt_version: str,
        temperature: float = 0.1,
    ) -> T:
        """
        Record telemetry around the LLM call using the new usage-enabled underlying provider method.
        Reads analysis_id and user_id from context vars.
        """
        analysis_id = obs_analysis_id.get()
        user_id = obs_user_id.get()
        trace_id = uuid.uuid4()
        
        provider_name = getattr(self.underlying_provider, "__class__", None)
        provider_str = provider_name.__name__ if provider_name else "unknown"
        if "Groq" in provider_str:
            provider_str = "groq"
        elif "Gemini" in provider_str:
            provider_str = "gemini"
            
        model_str = getattr(self.underlying_provider, "model", "unknown")
        
        start_time = time.monotonic()
        
        try:
            # Delegate to the usage-enabled method
            if hasattr(self.underlying_provider, 'generate_structured_with_usage'):
                result, usage, retry_count = await self.underlying_provider.generate_structured_with_usage(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    response_schema=response_schema,
                    temperature=temperature,
                )
            else:
                # Fallback if underlying provider not updated
                result = await self.underlying_provider.generate_structured(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    response_schema=response_schema,
                    temperature=temperature,
                )
                usage = {"input_tokens": None, "output_tokens": None, "total_tokens": None}
                retry_count = 0

            latency_ms = int((time.monotonic() - start_time) * 1000)
            
            tracer.record_trace(
                trace_id=trace_id,
                user_id=user_id,
                analysis_id=analysis_id,
                operation=operation,
                provider=provider_str,
                model=model_str,
                prompt_version=prompt_version,
                input_tokens=usage.get("input_tokens"),
                output_tokens=usage.get("output_tokens"),
                total_tokens=usage.get("total_tokens"),
                latency_ms=latency_ms,
                status="success",
                retry_count=retry_count,
                error_type=None,
                error_message=None,
            )
            return result
            
        except Exception as e:
            latency_ms = int((time.monotonic() - start_time) * 1000)
            
            error_type = "unknown"
            error_message = str(e)
            
            if isinstance(e, asyncio.TimeoutError):
                error_type = "timeout"
            elif "rate" in error_message.lower() or "429" in error_message:
                error_type = "rate_limit"
            elif "validation" in error_message.lower() or "schema" in error_message.lower():
                error_type = "validation"
            elif "api" in error_message.lower() or "connection" in error_message.lower():
                error_type = "provider_error"

            tracer.record_trace(
                trace_id=trace_id,
                user_id=user_id,
                analysis_id=analysis_id,
                operation=operation,
                provider=provider_str,
                model=model_str,
                prompt_version=prompt_version,
                input_tokens=None,
                output_tokens=None,
                total_tokens=None,
                latency_ms=latency_ms,
                status="failure",
                retry_count=getattr(self.underlying_provider, '_last_retry_count', 0), # Fallback access
                error_type=error_type,
                error_message=error_message,
            )
            raise
