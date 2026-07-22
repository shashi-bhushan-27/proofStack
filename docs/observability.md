# proofStack LLM Observability & Analytics

## Architecture Overview

The observability layer is designed as an **additive, non-intrusive wrapper** around the existing `LLMProvider` abstraction. It captures telemetry for every LLM call without modifying the business logic of AI consumers (like `jd_analyzer` or `resume_parser`).

```
AI Caller -> ObservableProvider -> Underlying Provider (Groq/Gemini)
                   |
            (Async DB Write via LLMTracer)
                   v
               llm_traces
```

### Key Features
1. **Zero Caller Changes**: `ObservableProvider` infers the `operation` and `prompt_version` automatically based on the `system_prompt` signature.
2. **Non-blocking**: Telemetry is written to PostgreSQL using `asyncio.create_task()`. If the database is slow or down, the LLM call still succeeds.
3. **Context Propagation**: `analysis_id` and `user_id` are propagated using Python `ContextVar`s, avoiding the need to pass them down through deep call stacks.
4. **Token & Cost Tracking**: Extracts raw token usage directly from the provider responses and calculates estimated cost using a centralized pricing table.
5. **Admin Authorization**: The dashboard and its APIs are protected by an email allowlist configured via the `ADMIN_EMAILS` environment variable.

## Adding a New Prompt Version

When modifying a system prompt in `app/ai/prompts/`, you should:
1. Create a new unique signature in the system prompt.
2. Update `app/observability/versions.py` with a new version string (e.g. `jd_extraction:v2`).
3. Update the inference logic in `ObservableProvider.generate_structured` (in `app/observability/wrapper.py`) to map the new signature to the new version.

## Admin Dashboard

Access the dashboard at `/admin/observability`.
You must be logged in, and your email must be listed in the `ADMIN_EMAILS` backend environment variable (comma-separated).

### Capabilities
- **Metric Summary**: Total requests, success rate, cost, and P50 latency.
- **Time-series**: 30-day view of request volume and estimated spend.
- **Operation Breakdown**: Identifies which AI features drive the most cost/usage.
- **Trace Explorer**: Paginated list of every LLM call, with a detailed modal showing exact tokens, latency, cost, and error logs (if failed).

## Privacy

The `llm_traces` table **does not store** the raw prompt text, user resumes, job descriptions, or raw LLM responses. It only stores metadata (tokens, latency, model, version, status, and error messages). This ensures compliance and protects candidate data while providing full operational visibility.
