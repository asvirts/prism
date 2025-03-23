import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts"

export type ChartType = "line" | "bar" | "area" | "pie" | "scatter"

interface ChartConfig {
  type: ChartType
  xAxis?: string
  yAxis?: string | string[]
  groupBy?: string
  title?: string
  colorScheme?: string[]
}

interface ChartComponentProps {
  data: Record<string, any>[]
  config: ChartConfig
  height?: number
}

// Default color schemes
const COLOR_SCHEMES = {
  default: [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#6366f1"
  ],
  blue: [
    "#dbeafe",
    "#bfdbfe",
    "#93c5fd",
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8"
  ],
  green: [
    "#d1fae5",
    "#a7f3d0",
    "#6ee7b7",
    "#34d399",
    "#10b981",
    "#059669",
    "#047857"
  ],
  red: [
    "#fee2e2",
    "#fecaca",
    "#fca5a5",
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#b91c1c"
  ],
  purple: [
    "#ede9fe",
    "#ddd6fe",
    "#c4b5fd",
    "#a78bfa",
    "#8b5cf6",
    "#7c3aed",
    "#6d28d9"
  ],
  gray: [
    "#f9fafb",
    "#f3f4f6",
    "#e5e7eb",
    "#d1d5db",
    "#9ca3af",
    "#6b7280",
    "#4b5563"
  ]
}

export default function ChartComponent({
  data,
  config,
  height = 400
}: ChartComponentProps) {
  const [processedData, setProcessedData] = useState<Record<string, any>[]>([])
  const [colorScheme, setColorScheme] = useState<string[]>(
    COLOR_SCHEMES.default
  )

  useEffect(() => {
    if (!data.length) return

    // Process and transform data based on chart configuration
    let transformed = [...data]

    // If we have a groupBy field, we need to aggregate the data
    if (config.groupBy && config.xAxis && (config.yAxis as string)) {
      const groupedData = new Map()

      data.forEach((item) => {
        const groupKey = item[config.groupBy as string]
        const xValue = item[config.xAxis as string]

        if (!groupedData.has(xValue)) {
          groupedData.set(xValue, {})
        }

        const entry = groupedData.get(xValue)
        entry[groupKey] = item[config.yAxis as string]
        entry[config.xAxis as string] = xValue
        groupedData.set(xValue, entry)
      })

      transformed = Array.from(groupedData.values())
    }

    // Apply color scheme
    if (
      config.colorScheme &&
      COLOR_SCHEMES[config.colorScheme as keyof typeof COLOR_SCHEMES]
    ) {
      setColorScheme(
        COLOR_SCHEMES[config.colorScheme as keyof typeof COLOR_SCHEMES]
      )
    }

    setProcessedData(transformed)
  }, [data, config])

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const renderChart = () => {
    switch (config.type) {
      case "line":
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // Format date strings
                if (
                  value &&
                  typeof value === "string" &&
                  value.match(/^\d{4}-\d{2}-\d{2}/)
                ) {
                  return new Date(value).toLocaleDateString()
                }
                return String(value).length > 15
                  ? String(value).substring(0, 12) + "..."
                  : value
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {config.yAxis && Array.isArray(config.yAxis) ? (
              config.yAxis.map((axis, index) => (
                <Line
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stroke={colorScheme[index % colorScheme.length]}
                  activeDot={{ r: 8 }}
                />
              ))
            ) : config.groupBy ? (
              // If we have a groupBy, we'll render a line for each unique group value
              [
                ...new Set(data.map((item) => item[config.groupBy as string]))
              ].map((group, index) => (
                <Line
                  key={String(group)}
                  type="monotone"
                  dataKey={String(group)}
                  stroke={colorScheme[index % colorScheme.length]}
                  name={String(group)}
                  activeDot={{ r: 8 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={config.yAxis as string}
                stroke={colorScheme[0]}
                activeDot={{ r: 8 }}
              />
            )}
          </LineChart>
        )

      case "bar":
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (
                  value &&
                  typeof value === "string" &&
                  value.match(/^\d{4}-\d{2}-\d{2}/)
                ) {
                  return new Date(value).toLocaleDateString()
                }
                return String(value).length > 15
                  ? String(value).substring(0, 12) + "..."
                  : value
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {config.yAxis && Array.isArray(config.yAxis) ? (
              config.yAxis.map((axis, index) => (
                <Bar
                  key={axis}
                  dataKey={axis}
                  fill={colorScheme[index % colorScheme.length]}
                />
              ))
            ) : config.groupBy ? (
              [
                ...new Set(data.map((item) => item[config.groupBy as string]))
              ].map((group, index) => (
                <Bar
                  key={String(group)}
                  dataKey={String(group)}
                  fill={colorScheme[index % colorScheme.length]}
                  name={String(group)}
                />
              ))
            ) : (
              <Bar dataKey={config.yAxis as string} fill={colorScheme[0]} />
            )}
          </BarChart>
        )

      case "area":
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (
                  value &&
                  typeof value === "string" &&
                  value.match(/^\d{4}-\d{2}-\d{2}/)
                ) {
                  return new Date(value).toLocaleDateString()
                }
                return String(value).length > 15
                  ? String(value).substring(0, 12) + "..."
                  : value
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {config.yAxis && Array.isArray(config.yAxis) ? (
              config.yAxis.map((axis, index) => (
                <Area
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  fill={colorScheme[index % colorScheme.length]}
                  stroke={colorScheme[index % colorScheme.length]}
                  fillOpacity={0.3}
                />
              ))
            ) : config.groupBy ? (
              [
                ...new Set(data.map((item) => item[config.groupBy as string]))
              ].map((group, index) => (
                <Area
                  key={String(group)}
                  type="monotone"
                  dataKey={String(group)}
                  fill={colorScheme[index % colorScheme.length]}
                  stroke={colorScheme[index % colorScheme.length]}
                  name={String(group)}
                  fillOpacity={0.3}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={config.yAxis as string}
                fill={colorScheme[0]}
                stroke={colorScheme[0]}
                fillOpacity={0.3}
              />
            )}
          </AreaChart>
        )

      case "pie":
        // For pie charts, we need to transform the data
        const pieData = config.groupBy
          ? [
              ...new Set(data.map((item) => item[config.groupBy as string]))
            ].map((group) => {
              const total = data
                .filter((item) => item[config.groupBy as string] === group)
                .reduce(
                  (sum, item) =>
                    sum + parseFloat(item[config.yAxis as string] || 0),
                  0
                )

              return {
                name: group,
                value: total
              }
            })
          : data.map((item) => ({
              name: item[config.xAxis as string],
              value: parseFloat(item[config.yAxis as string] || 0)
            }))

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorScheme[index % colorScheme.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )

      case "scatter":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.xAxis}
              name={config.xAxis}
              tick={{ fontSize: 12 }}
              type="number"
            />
            <YAxis
              dataKey={config.yAxis as string}
              name={config.yAxis as string}
              tick={{ fontSize: 12 }}
              type="number"
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            {config.groupBy ? (
              [
                ...new Set(data.map((item) => item[config.groupBy as string]))
              ].map((group, index) => {
                const groupData = data.filter(
                  (item) => item[config.groupBy as string] === group
                )
                return (
                  <Scatter
                    key={String(group)}
                    name={String(group)}
                    data={groupData}
                    fill={colorScheme[index % colorScheme.length]}
                  />
                )
              })
            ) : (
              <Scatter
                name="Data Points"
                data={processedData}
                fill={colorScheme[0]}
              />
            )}
          </ScatterChart>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {config.title && (
        <h3 className="text-lg font-medium mb-4 text-gray-800">
          {config.title}
        </h3>
      )}
      <div style={{ width: "100%", height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
