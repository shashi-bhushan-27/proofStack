from abc import ABC, abstractmethod
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class LLMProvider(ABC):
    """Abstract base class for LLM providers supporting structured JSON outputs."""

    @abstractmethod
    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.1,
    ) -> T:
        """
        Generate a structured response adhering to the given Pydantic schema.
        
        Args:
            system_prompt: Instructions for the LLM.
            user_prompt: User prompt / content to process.
            response_schema: Pydantic model class defining the expected output structure.
            temperature: Sampling temperature (default low for deterministic output).
            
        Returns:
            An instance of response_schema with populated fields.
        """
        pass

    @abstractmethod
    async def generate_structured_with_usage(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.1,
    ) -> tuple[T, dict[str, int | None], int]:
        """
        Generate a structured response and return token usage and retry count.
        
        Returns:
            Tuple of (response_schema instance, usage_dict, retry_count)
            usage_dict contains 'input_tokens', 'output_tokens', 'total_tokens'
        """
        pass
