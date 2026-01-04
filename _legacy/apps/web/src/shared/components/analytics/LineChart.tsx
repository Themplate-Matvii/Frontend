"use client";

import { Fragment, useId, useMemo } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Theme, colors, useTheme } from "@packages/ui";

type ChartDatum = Record<string, string | number | undefined> & {
  label: string;
};

interface LineSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

interface LineChartProps {
  data: ChartDatum[];
  lines?: LineSeries[];
  height?: number;
  xKey?: string;
  emptyLabel?: string;
  formatValue?: (value: number) => string;
}

const DEFAULT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#0ea5e9", "#f43f5e"];

export function LineChart({
  data,
  lines,
  height = 260,
  xKey = "label",
  emptyLabel,
  formatValue,
}: LineChartProps) {
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
  const gradientId = useId();

  const renderedLines = useMemo(() => {
    if (lines?.length) return lines;
    return [{ dataKey: "value", name: undefined, color: palette[0] }];
  }, [lines, palette]);

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
        <RechartsAreaChart data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
            }}
            formatter={(value: any) =>
              typeof value === "number" && formatValue ? formatValue(value) : value
            }
          />

          {renderedLines.map((line, index) => {
            const fillId = `${gradientId}-${index}`;
            const color = line.color ?? palette[index % palette.length];

            return (
              <Fragment key={line.dataKey}>
                <defs>
                  <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={color}
                  fill={`url(#${fillId})`}
                  strokeWidth={2}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </Fragment>
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
