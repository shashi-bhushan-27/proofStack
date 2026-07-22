interface OperationBreakdownProps {
  data: any[];
}

export function OperationBreakdown({ data }: OperationBreakdownProps) {
  // Find max requests for proportional bars
  const maxRequests = data.length > 0 ? Math.max(...data.map((d) => d.requests)) : 1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
        Operations Breakdown
      </h3>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.operation} className="relative">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-medium text-slate-300">
                {item.operation}
              </span>
              <div className="text-right">
                <span className="text-xs font-bold text-white block">
                  {item.requests.toLocaleString()} <span className="text-slate-500 font-normal">reqs</span>
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(item.requests / maxRequests) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
              <span>{item.avg_latency_ms}ms avg latency</span>
              <span>${item.cost.toFixed(4)} total cost</span>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-500">
            No operations recorded
          </div>
        )}
      </div>
    </div>
  );
}
