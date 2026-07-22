import asyncio
import logging
from typing import Type, TypeVar
from pydantic import BaseModel
import instructor
from groq import AsyncGroq, GroqError

from app.ai.provider import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class GroqProvider(LLMProvider):
    """
    Groq LLM provider implementation using instructor for guaranteed Pydantic structured output.
    Uses free tier Groq models (e.g., llama-3.3-70b-versatile).
    """

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.LLM_MODEL or "llama-3.3-70b-versatile"
        if not self.api_key or self.api_key.startswith("gsk_your_"):
            logger.warning("GROQ_API_KEY is not set or is placeholder. LLM calls will fail if invoked without valid key.")
        
        # Initialize AsyncGroq wrapped with instructor for structured outputs
        self.raw_client = AsyncGroq(api_key=self.api_key)
        self.client = instructor.from_groq(self.raw_client, mode=instructor.Mode.MD_JSON)

    async def generate_structured_with_usage(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.1,
    ) -> tuple[T, dict[str, int | None], int]:
        max_retries = 3
        backoff_delay = 2.0

        # Dynamically calculate max_tokens to stay below Groq's 6,000 TPM limit
        estimated_input_tokens = int(len(system_prompt + user_prompt) * 0.45)
        dynamic_max_tokens = max(1000, min(4096, 5600 - estimated_input_tokens))
        logger.info(f"Dynamic token budget: estimated_input={estimated_input_tokens}, max_tokens={dynamic_max_tokens}")

        for attempt in range(1, max_retries + 1):
            self._last_retry_count = attempt - 1
            try:
                # We use asyncio.wait_for to enforce a strict 60s timeout per call
                result, raw_response = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        response_model=response_schema,
                        temperature=temperature,
                        max_tokens=dynamic_max_tokens,
                        max_retries=2,  # Instructor internal retries for schema validation
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
                logger.error(f"Groq API call timed out on attempt {attempt}/{max_retries}")
                if attempt == max_retries:
                    raise RuntimeError("LLM request timed out after multiple attempts.")
                await asyncio.sleep(backoff_delay * attempt)
            except GroqError as e:
                logger.error(f"Groq API error on attempt {attempt}/{max_retries}: {e}")
                if attempt == max_retries:
                    raise RuntimeError(f"LLM API error: {str(e)}")
                await asyncio.sleep(backoff_delay * attempt)
            except Exception as e:
                logger.error(f"Unexpected error in GroqProvider generate_structured (attempt {attempt}/{max_retries}): {e}")
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

# Global singleton or factory
_provider_instance: LLMProvider | None = None

def get_provider() -> LLMProvider:
    """Factory function to get the configured LLM provider instance wrapped with observability."""
    global _provider_instance
    if _provider_instance is None:
        from app.observability.wrapper import ObservableProvider
        if settings.LLM_PROVIDER.lower() == "gemini":
            from app.ai.gemini_provider import GeminiProvider
            base_provider = GeminiProvider()
        elif settings.LLM_PROVIDER.lower() == "groq":
            base_provider = GroqProvider()
        else:
            # Default to Groq if specified provider is unknown or default
            base_provider = GroqProvider()
            
        _provider_instance = ObservableProvider(base_provider)
    return _provider_instance
