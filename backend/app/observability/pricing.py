"""Centralized LLM model pricing configuration."""

from decimal import Decimal

# Price per 1,000 tokens in USD (Input, Output)
PRICING_TABLE = {
    # Groq Models (prices approximate for testing)
    "llama-3.1-70b-versatile": (Decimal("0.00059"), Decimal("0.00079")),
    "llama-3.3-70b-versatile": (Decimal("0.00059"), Decimal("0.00079")),
    
    # Gemini Models
    "gemini-3.1-flash-lite": (Decimal("0.000075"), Decimal("0.00030")),
    "gemini-1.5-flash": (Decimal("0.000075"), Decimal("0.00030")),
    "gemini-1.5-pro": (Decimal("0.00125"), Decimal("0.0050")),
}

def calculate_cost(model: str, input_tokens: int | None, output_tokens: int | None) -> float | None:
    """Calculate estimated cost in USD based on model and token usage."""
    if input_tokens is None and output_tokens is None:
        return None
        
    prices = PRICING_TABLE.get(model)
    if not prices:
        return None
        
    input_price, output_price = prices
    
    cost = Decimal("0")
    if input_tokens:
        cost += (Decimal(input_tokens) / Decimal("1000")) * input_price
    if output_tokens:
        cost += (Decimal(output_tokens) / Decimal("1000")) * output_price
        
    return float(cost)
