"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/neo-brutalism/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/neo-brutalism/chart";
import { useMemo } from "react";

export const description = "A mixed bar chart";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const colours = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type ChartData = {
  item: string;
  bookCount: number;
};

export default function HorizontalBarChart({ items }: { items: ChartData[] }) {
  console.log(items);
  const localchartConfig = useMemo(() => {
    const config: Record<string, { label: string; color?: string }> = {
      visitors: {
        label: "Visitors",
      },
    };

    items.forEach((i, idx) => {
      config[i.item.toLowerCase().split(" ").join("_")] = {
        label: i.item,
        color: colours[idx % colours.length],
      };
    });

    // console.dir(config);
    return config;
  }, [items]);

  const final_chart_data = useMemo(() => {
    return items.map((i) => ({
      ...i,
      
      fill: `var(--color-${i.item.toLowerCase().split(" ").join("_")})`,
    }));
  }, [items]);

  return (
    <Card className="bg-secondary-background py-0 px-0 text-foreground">
      {/* <CardHeader>
        <CardTitle>Top 5 Genre</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader> */}
      <CardContent>
        <ChartContainer config={localchartConfig} className="h-34 w-full flex justify-start">
          <BarChart
            accessibilityLayer
            data={final_chart_data}
            layout="vertical"
            margin={{
              left: 0,
            }}
            barCategoryGap="2%"
          >
            <YAxis
              dataKey="item"
              type="category"
              tickLine={false}
              tickMargin={0}
              axisLine={false}
              width={120}
              className=" whitespace-nowrap"
              tickFormatter={(value) =>
                localchartConfig[
                  value
                    .toLowerCase()
                    .split(" ")
                    .join("_") as keyof typeof localchartConfig
                ]?.label
              }
            />
            <XAxis dataKey="bookCount" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="bookCount"
              direction={"horizontal"}
              radius={5}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
