"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Theme, colors } from "@/shared/ui";
import { useTheme } from "@/shared/lib/theme";

type ChartDatum = Record<string, string | number | undefined> & { label: string };

interface BarSeries {
  dataKey: string;
  name?: string;
  color?: string;
  stackId?: string;
}

interface BarChartProps {
  data: ChartDatum[];
  bars?: BarSeries[];
  height?: number;
  xKey?: string;
  emptyLabel?: string;
  formatValue?: (value: number) => string;
}

export function BarChart({
  data,
  bars,
  height = 220,
  xKey = "label",
  emptyLabel,
  formatValue,
}: BarChartProps) {
  const { theme } = useTheme();
  const tone = theme === Theme.DARK ? "dark" : "light";
  const palette = useMemo(
    () => [
      colors.primary[tone],
      colors.success[tone],
      colors.warning[tone],
      colors.primaryHover[tone],
      colors.danger[tone],
    ],
    [tone],
  );

  const renderedBars = bars?.length
    ? bars
    : ([{ dataKey: "value", name: undefined, color: palette[0] }] as BarSeries[]);

  if (!data.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted text-sm">
        {emptyLabel || "No data"}
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <RechartsBarChart data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-background)",
              color: "var(--color-text)",
              boxShadow:
                "0 10px 25px color-mix(in srgb, var(--color-text) 12%, transparent)",
            }}
            wrapperStyle={{ maxWidth: 320, wordBreak: "break-word" }}
            formatter={(value: any) =>
              typeof value === "number" && formatValue ? formatValue(value) : value
            }
          />

          {renderedBars.map((bar, index) => {
            const barColor = bar.color ?? palette[index % palette.length];
            const useItemColors = renderedBars.length === 1;

            return (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name}
                stackId={bar.stackId}
                fill={barColor}
                radius={[8, 8, 8, 8]}
                maxBarSize={48}
              >
                {useItemColors &&
                  data.map((entry, entryIndex) => (
                    <Cell
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${bar.dataKey}-${entryIndex}`}
                      fill={(entry as any).color ?? barColor}
                    />
                  ))}
              </Bar>
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
