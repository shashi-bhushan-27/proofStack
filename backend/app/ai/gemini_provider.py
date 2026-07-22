import asyncio
import logging
from typing import Type, TypeVar
from pydantic import BaseModel
import instructor
from openai import AsyncOpenAI

from app.ai.provider import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class GeminiProvider(LLMProvider):
    """
    Gemini LLM provider implementation using instructor + OpenAI client for structured output.
    Uses Google AI Studio Gemini API OpenAI compatibility layer (e.g., gemini-3.1-flash-lite).
    """

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.LLM_MODEL or "gemini-3.1-flash-lite"
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. LLM calls will fail.")
        
        # Initialize OpenAI Async client pointing to Google Generative Language OpenAI base URL
        self.raw_client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        # Wrap the client with instructor using TOOLS mode (highly supported by Gemini's OpenAI layer)
        self.client = instructor.from_openai(self.raw_client, mode=instructor.Mode.TOOLS)

    async def generate_structured_with_usage(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.1,
    ) -> tuple[T, dict[str, int | None], int]:
        max_retries = 3
        backoff_delay = 2.0

        for attempt in range(1, max_retries + 1):
            self._last_retry_count = attempt - 1
            try:
                # Need to use create_with_completion to get the raw response for usage stats
                result, raw_response = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        response_model=response_schema,
                        temperature=temperature,
                    ),
                    timeout=60.0
                )
                
                usage = {"input_tokens": None, "output_tokens": None, "total_tokens": None}
                if hasattr(raw_response, "usage") and raw_response.usage:
                    usage["input_tokens"] = getattr(raw_response.usage, "prompt_tokens", None)
                    usage["output_tokens"] = getattr(raw_response.usage, "completion_tokens", None)
                    usage["total_tokens"] = getattr(raw_response.usage, "total_tokens", None)
                
                return result, usage, self._last_retry_count
            except asyncio.TimeoutError:
                logger.error(f"Gemini API call timed out on attempt {attempt}/{max_retries}")
                if attempt == max_retries:
                    raise RuntimeError("LLM request timed out after multiple attempts.")
                await asyncio.sleep(backoff_delay * attempt)
            except Exception as e:
                logger.error(f"Unexpected error in GeminiProvider generate_structured (attempt {attempt}/{max_retries}): {e}")
                if attempt == max_retries:
                    raise
                await asyncio.sleep(backoff_delay * attempt)

        raise RuntimeError("Failed to generate structured output from LLM.")

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.1,
    ) -> T:
        result, _, _ = await self.generate_structured_with_usage(
            system_prompt, user_prompt, response_schema, temperature
        )
        return result
