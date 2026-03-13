import Card from "@/components/ui/Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  format?: "number" | "percent" | "percent_raw" | "duration" | "decimal" | "currency";
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

export default function MetricCard({ title, value, format }: MetricCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {formatValue(value, format)}
      </p>
    </Card>
  );
}
