import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_admin_user
from app.db.session import get_db
from app.models.llm_trace import LlmTrace
from app.models.user import User

router = APIRouter()

@router.get("/observability/summary")
async def get_observability_summary(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> dict[str, Any]:
    """Get high-level aggregated metrics for the dashboard."""
    # Total requests
    total_result = await db.execute(select(func.count(LlmTrace.id)))
    total_requests = total_result.scalar_one()
    
    # Success/Failure
    success_result = await db.execute(
        select(func.count(LlmTrace.id)).where(LlmTrace.status == "success")
    )
    success_count = success_result.scalar_one()
    error_count = total_requests - success_count
    
    success_rate = (success_count / total_requests * 100) if total_requests > 0 else 100
    
    # Tokens & Cost
    totals_result = await db.execute(
        select(
            func.sum(LlmTrace.total_tokens),
            func.sum(LlmTrace.estimated_cost_usd)
        ).where(LlmTrace.status == "success")
    )
    total_tokens, total_cost = totals_result.one()
    
    # Latency percentiles (approximate using Python since we might have many rows, 
    # but for simplicity we'll just get avg for summary card)
    avg_lat_result = await db.execute(
        select(func.avg(LlmTrace.latency_ms)).where(LlmTrace.status == "success")
    )
    avg_latency = avg_lat_result.scalar_one()
    
    # Calculate P50/P95 on a recent sample if not empty
    recent_latencies_result = await db.execute(
        select(LlmTrace.latency_ms)
        .where(LlmTrace.status == "success")
        .order_by(LlmTrace.created_at.desc())
        .limit(1000)
    )
    latencies = [l for l in recent_latencies_result.scalars().all()]
    p50_latency = 0
    p95_latency = 0
    if latencies:
        latencies.sort()
        p50_latency = latencies[int(len(latencies) * 0.50)]
        p95_latency = latencies[int(len(latencies) * 0.95)]
        
    return {
        "total_requests": total_requests,
        "success_rate": round(success_rate, 2),
        "error_count": error_count,
        "total_tokens": total_tokens or 0,
        "estimated_cost_usd": float(total_cost or 0),
        "avg_latency_ms": int(avg_latency or 0),
        "p50_latency_ms": p50_latency,
        "p95_latency_ms": p95_latency,
    }

@router.get("/observability/timeseries")
async def get_observability_timeseries(
    days: int = Query(30, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> list[dict[str, Any]]:
    """Get time-series data for the last X days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    stmt = (
        select(
            func.date_trunc('day', LlmTrace.created_at).label('day'),
            func.count(LlmTrace.id).label('requests'),
            func.sum(LlmTrace.estimated_cost_usd).label('cost')
        )
        .where(LlmTrace.created_at >= cutoff)
        .group_by(func.date_trunc('day', LlmTrace.created_at))
        .order_by('day')
    )
    
    result = await db.execute(stmt)
    data = []
    for row in result:
        data.append({
            "date": row.day.isoformat(),
            "requests": row.requests,
            "cost": float(row.cost or 0),
        })
    return data

@router.get("/observability/by-operation")
async def get_by_operation(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> list[dict[str, Any]]:
    """Get stats grouped by operation."""
    stmt = (
        select(
            LlmTrace.operation,
            func.count(LlmTrace.id).label('requests'),
            func.sum(LlmTrace.total_tokens).label('tokens'),
            func.sum(LlmTrace.estimated_cost_usd).label('cost'),
            func.avg(LlmTrace.latency_ms).label('avg_latency')
        )
        .group_by(LlmTrace.operation)
        .order_by(desc('requests'))
    )
    result = await db.execute(stmt)
    return [
        {
            "operation": row.operation,
            "requests": row.requests,
            "total_tokens": row.tokens or 0,
            "cost": float(row.cost or 0),
            "avg_latency_ms": int(row.avg_latency or 0),
        }
        for row in result
    ]

@router.get("/observability/by-model")
async def get_by_model(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> list[dict[str, Any]]:
    """Get stats grouped by model."""
    stmt = (
        select(
            LlmTrace.model,
            func.count(LlmTrace.id).label('requests'),
            func.sum(LlmTrace.total_tokens).label('tokens'),
            func.sum(LlmTrace.estimated_cost_usd).label('cost')
        )
        .group_by(LlmTrace.model)
        .order_by(desc('requests'))
    )
    result = await db.execute(stmt)
    return [
        {
            "model": row.model,
            "requests": row.requests,
            "total_tokens": row.tokens or 0,
            "cost": float(row.cost or 0),
        }
        for row in result
    ]

@router.get("/observability/by-error")
async def get_by_error(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> list[dict[str, Any]]:
    """Get breakdown of error types."""
    stmt = (
        select(
            LlmTrace.error_type,
            func.count(LlmTrace.id).label('count')
        )
        .where(LlmTrace.status == "failure")
        .group_by(LlmTrace.error_type)
        .order_by(desc('count'))
    )
    result = await db.execute(stmt)
    return [
        {
            "error_type": row.error_type or "unknown",
            "count": row.count,
        }
        for row in result
    ]

@router.get("/observability/by-prompt-version")
async def get_by_prompt_version(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> list[dict[str, Any]]:
    """Get usage by prompt version."""
    stmt = (
        select(
            LlmTrace.prompt_version,
            func.count(LlmTrace.id).label('count')
        )
        .group_by(LlmTrace.prompt_version)
        .order_by(desc('count'))
    )
    result = await db.execute(stmt)
    return [
        {
            "prompt_version": row.prompt_version,
            "requests": row.count,
        }
        for row in result
    ]

@router.get("/observability/traces")
async def get_traces(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    operation: str | None = None,
    model: str | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> dict[str, Any]:
    """Get paginated list of traces with optional filtering."""
    stmt = select(LlmTrace)
    
    if operation:
        stmt = stmt.where(LlmTrace.operation == operation)
    if model:
        stmt = stmt.where(LlmTrace.model == model)
    if status:
        stmt = stmt.where(LlmTrace.status == status)
        
    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()
    
    # Paginate
    stmt = stmt.order_by(LlmTrace.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    traces = result.scalars().all()
    
    return {
        "items": [
            {
                "id": str(t.id),
                "trace_id": str(t.trace_id),
                "operation": t.operation,
                "model": t.model,
                "prompt_version": t.prompt_version,
                "input_tokens": t.input_tokens,
                "output_tokens": t.output_tokens,
                "latency_ms": t.latency_ms,
                "estimated_cost_usd": float(t.estimated_cost_usd or 0),
                "status": t.status,
                "created_at": t.created_at.isoformat(),
            }
            for t in traces
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }

@router.get("/observability/traces/{trace_id}")
async def get_trace_detail(
    trace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
) -> dict[str, Any]:
    """Get full details of a specific trace."""
    stmt = select(LlmTrace).where(LlmTrace.trace_id == trace_id)
    result = await db.execute(stmt)
    trace = result.scalar_one_or_none()
    
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
        
    return {
        "id": str(trace.id),
        "trace_id": str(trace.trace_id),
        "user_id": str(trace.user_id) if trace.user_id else None,
        "analysis_id": str(trace.analysis_id) if trace.analysis_id else None,
        "operation": trace.operation,
        "provider": trace.provider,
        "model": trace.model,
        "prompt_version": trace.prompt_version,
        "input_tokens": trace.input_tokens,
        "output_tokens": trace.output_tokens,
        "total_tokens": trace.total_tokens,
        "latency_ms": trace.latency_ms,
        "estimated_cost_usd": float(trace.estimated_cost_usd or 0),
        "status": trace.status,
        "retry_count": trace.retry_count,
        "error_type": trace.error_type,
        "error_message": trace.error_message,
        "created_at": trace.created_at.isoformat(),
    }
