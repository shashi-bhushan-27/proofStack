import uuid
import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from sqlalchemy import select

from app.observability.pricing import calculate_cost
from app.observability.wrapper import ObservableProvider
from app.observability.context import obs_analysis_id, obs_user_id
from app.core.config import settings
from app.api.deps import get_admin_user
from app.models.user import User

def test_cost_calculation():
    # Known model
    cost = calculate_cost("gemini-1.5-flash", 1000, 2000)
    # 1000 * 0.000075 + 2000 * 0.00030 = 0.000075 + 0.0006 = 0.000675
    assert cost is not None
    assert round(cost, 6) == 0.000675
    
    # Unknown model
    cost2 = calculate_cost("unknown-model", 100, 100)
    assert cost2 is None

@pytest.mark.asyncio
async def test_admin_dep_allows_admin():
    settings.ADMIN_EMAILS = "admin@proofstack.com, test@example.com"
    user = User(id=uuid.uuid4(), email="admin@proofstack.com")
    
    result = await get_admin_user(current_user=user)
    assert result == user

@pytest.mark.asyncio
async def test_admin_dep_rejects_normal_user():
    settings.ADMIN_EMAILS = "admin@proofstack.com"
    user = User(id=uuid.uuid4(), email="hacker@example.com")
    
    with pytest.raises(HTTPException) as exc:
        await get_admin_user(current_user=user)
    assert exc.value.status_code == 403

def test_observable_provider_infer_operation():
    # Test the operation inference
    from app.observability.versions import PromptVersions
    
    class MockProvider:
        pass

    provider = MockProvider()
    wrapper = ObservableProvider(provider) # type: ignore
    
    async def mock_gswc(*args, **kwargs):
        return kwargs.get("operation"), kwargs.get("prompt_version")
        
    wrapper.generate_structured_with_context = mock_gswc # type: ignore
    
    import asyncio
    
    # JD extraction
    op, pv = asyncio.run(wrapper.generate_structured(
        system_prompt="Analyze the provided job description text carefully and...",
        user_prompt="",
        response_schema=dict
    ))
    assert op == "jd_extraction"
    assert pv == PromptVersions.JD_EXTRACTION
    
    # Resume parsing
    op, pv = asyncio.run(wrapper.generate_structured(
        system_prompt="You are an expert AI resume parser and structured data extractor.",
        user_prompt="",
        response_schema=dict
    ))
    assert op == "resume_parsing"
    assert pv == PromptVersions.RESUME_PARSING
