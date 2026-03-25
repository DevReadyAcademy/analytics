export interface MetricTarget {
  value: number;
  label: string;
}

export const targets: Record<string, MetricTarget> = {
  "meta.ctr": { value: 3.0, label: "3.0% target" },
  "meta.cpc": { value: 0.05, label: "\u20ac0.05 target" },
  "meta.cpa": { value: 15, label: "\u20ac15.00 target" },
  "ga.engagementRate": { value: 0.6, label: "60% target" },
  "ga.conversionRate": { value: 0.03, label: "3% target" },
  "sc.averageCtr": { value: 0.03, label: "3% target" },
};

export function getTarget(key: string): MetricTarget | undefined {
  return targets[key];
}
