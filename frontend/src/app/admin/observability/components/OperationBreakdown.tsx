import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, Progress } from "@/components/ui/feedback";

export interface OperationStat {
  operation: string;
  requests: number;
  avg_latency_ms: number;
  cost: number;
}

interface OperationBreakdownProps {
  data: OperationStat[];
}

export function OperationBreakdown({ data }: OperationBreakdownProps) {
  // Find max requests for proportional bars
  const maxRequests = data.length > 0 ? Math.max(...data.map((d) => d.requests)) : 1;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Operations breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState className="py-8" title="No operations recorded" />
        ) : (
          <ul className="space-y-5">
            {data.map((item) => (
              <li key={item.operation}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-fg">{item.operation}</span>
                  <span className="shrink-0 tabular-nums text-fg">
                    {item.requests.toLocaleString()} <span className="text-fg-subtle">reqs</span>
                  </span>
                </div>
                <Progress value={(item.requests / maxRequests) * 100} label={`${item.operation} share of requests`} />
                <div className="mt-1.5 flex justify-between text-xs text-fg-subtle">
                  <span>{item.avg_latency_ms}ms avg latency</span>
                  <span className="tabular-nums">${item.cost.toFixed(4)} total cost</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
