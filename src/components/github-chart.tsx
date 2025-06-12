"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CompetitorData {
  name: string
  data: Array<{ date: string; count: number }>
  color: string
}

interface GithubChartProps {
  data: CompetitorData[]
  height?: number
}

export function GithubChart({ data, height = 400 }: GithubChartProps) {
  // Transform data for recharts
  const chartData =
    data.length > 0
      ? data[0].data.map((item) => {
          const dataPoint: any = { date: item.date }

          data.forEach((competitor) => {
            const matchingData = competitor.data.find((d) => d.date === item.date)
            dataPoint[competitor.name] = matchingData?.count || 0
          })

          return dataPoint
        })
      : []

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          labelFormatter={(value) => formatDate(value as string)}
          formatter={(value: number, name: string) => [value, name]}
        />
        <Legend />
        {data.map((competitor, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={competitor.name}
            stroke={competitor.color}
            strokeWidth={2}
            dot={{ fill: competitor.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
