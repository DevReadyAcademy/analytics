import Card from "@/components/ui/Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  format?: "number" | "percent" | "percent_raw" | "duration" | "decimal" | "currency";
  tooltip?: string;
  previousValue?: number;
  invertColor?: boolean;
}

function formatValue(value: string | number, format?: string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  switch (format) {
    case "percent":
      return `${(num * 100).toFixed(1)}%`;
    case "percent_raw":
      return `${num.toFixed(2)}%`;
    case "duration": {
      const mins = Math.floor(num / 60);
      const secs = Math.round(num % 60);
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    case "decimal":
      return num.toFixed(1);
    case "currency":
      return `€${num.toFixed(2)}`;
    case "number":
    default:
      return num.toLocaleString();
  }
}

function DeltaBadge({ current, previous, invertColor }: { current: number; previous: number; invertColor?: boolean }) {
  if (previous === 0 && current === 0) return null;

  const pctChange = previous === 0
    ? (current > 0 ? 100 : 0)
    : ((current - previous) / previous) * 100;

  if (pctChange === 0) return null;

  const isUp = pctChange > 0;
  const isGood = invertColor ? !isUp : isUp;

  return (
    <span className={`inline-flex items-center text-xs font-medium ${isGood ? "text-green-600" : "text-red-600"}`}>
      <span className="mr-0.5">{isUp ? "\u25B2" : "\u25BC"}</span>
      {Math.abs(pctChange).toFixed(1)}%
    </span>
  );
}

export default function MetricCard({ title, value, format, tooltip, previousValue, invertColor }: MetricCardProps) {
  const currentNum = typeof value === "string" ? parseFloat(value) : value;

  return (
    <Card className="!p-4">
      <div className="flex items-center gap-1">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        {tooltip && (
          <span className="relative group">
            <span className="cursor-help text-gray-400 text-xs">&#9432;</span>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 rounded bg-gray-800 px-2 py-1 text-xs text-white text-center z-10">
              {tooltip}
            </span>
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-xl font-bold text-gray-900">
          {formatValue(value, format)}
        </p>
        {previousValue !== undefined && (
          <DeltaBadge current={currentNum} previous={previousValue} invertColor={invertColor} />
        )}
      </div>
    </Card>
  );
}
