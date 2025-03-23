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
  margin?: { top: number; right: number; left: number; bottom: number }
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
    let transformed = [...data].map((item) => {
      // Create a new object with the same properties
      const newItem = { ...item }

      // Convert numeric strings to actual numbers for the yAxis
      if (config.yAxis) {
        if (Array.isArray(config.yAxis)) {
          config.yAxis.forEach((axis) => {
            if (typeof newItem[axis] === "string") {
              newItem[axis] = parseFloat(newItem[axis]) || 0
            }
          })
        } else if (typeof newItem[config.yAxis] === "string") {
          newItem[config.yAxis] = parseFloat(newItem[config.yAxis]) || 0
        }
      }

      // Also ensure xAxis is numeric if it should be
      if (
        config.type === "scatter" &&
        config.xAxis &&
        typeof newItem[config.xAxis] === "string"
      ) {
        if (newItem[config.xAxis].match(/^\d+(\.\d+)?$/)) {
          newItem[config.xAxis] = parseFloat(newItem[config.xAxis]) || 0
        }
      }

      return newItem
    })

    // If we have a groupBy field, we need to aggregate the data
    if (config.groupBy && config.xAxis && (config.yAxis as string)) {
      const groupedData = new Map()

      transformed.forEach((item) => {
        const groupKey = item[config.groupBy as string]
        const xValue = item[config.xAxis as string]

        if (!groupedData.has(xValue)) {
          groupedData.set(xValue, {})
        }

        const entry = groupedData.get(xValue)
        // Ensure this is a number, not a string
        entry[groupKey] =
          typeof item[config.yAxis as string] === "string"
            ? parseFloat(item[config.yAxis as string] || "0")
            : item[config.yAxis as string] || 0
        entry[config.xAxis as string] = xValue
        groupedData.set(xValue, entry)
      })

      transformed = Array.from(groupedData.values())
    }

    // For bar and line charts with many unique x-axis values, aggregate the data
    if (
      (config.type === "bar" ||
        config.type === "line" ||
        config.type === "area") &&
      config.xAxis &&
      (config.yAxis as string) &&
      !config.groupBy
    ) {
      // Count unique x-axis values
      const uniqueXValues = new Set(
        transformed.map((item) => item[config.xAxis as string])
      )

      // If there are too many unique values and they seem to be ID-like (e.g., C1001, C1002)
      if (uniqueXValues.size > 10) {
        const firstValue = transformed[0]?.[config.xAxis as string]
        const idPattern =
          typeof firstValue === "string" && /^[A-Z][0-9]+$/i.test(firstValue)

        // If they look like IDs, we should group/aggregate them
        if (idPattern) {
          // For customer-like IDs, let's group by first digit of ID to create buckets
          const aggregatedData: Record<string, any>[] = []
          const buckets = new Map<string, number[]>()

          transformed.forEach((item) => {
            const id = item[config.xAxis as string] as string
            // Extract numeric part and take first digit
            const match = id.match(/[0-9]+/)
            if (match) {
              const bucket = match[0].charAt(0)
              const value =
                typeof item[config.yAxis as string] === "string"
                  ? parseFloat(item[config.yAxis as string])
                  : item[config.yAxis as string] || 0

              if (!buckets.has(bucket)) {
                buckets.set(bucket, [])
              }
              buckets.get(bucket)?.push(value)
            }
          })

          // Calculate average for each bucket
          buckets.forEach((values, bucket) => {
            const sum = values.reduce((a, b) => a + b, 0)
            const avg = values.length > 0 ? sum / values.length : 0
            aggregatedData.push({
              [config.xAxis as string]: `Group ${bucket}`,
              [config.yAxis as string]: avg
            })
          })

          if (aggregatedData.length > 0) {
            transformed = aggregatedData
          }
        }
      }
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
    const margin = config.margin || { top: 20, right: 30, left: 20, bottom: 20 }

    // Find min/max values for better axis scaling
    let minValue = 0
    let maxValue = 0

    if (config.yAxis) {
      const yAxis = config.yAxis as string
      processedData.forEach((item) => {
        const value = Number(item[yAxis])
        if (!isNaN(value)) {
          if (value < minValue) minValue = value
          if (value > maxValue) maxValue = value
        }
      })
    }

    // If all values are zero or close to zero, create a small default range
    if (Math.abs(maxValue - minValue) < 0.001) {
      maxValue = 10
    }

    // Add 10% padding to the top of the domain
    maxValue = maxValue * 1.1

    switch (config.type) {
      case "line":
        return (
          <LineChart data={processedData} margin={margin}>
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
            <YAxis tick={{ fontSize: 12 }} domain={[minValue, maxValue]} />
            <Tooltip />
            <Legend />
            {config.yAxis && Array.isArray(config.yAxis) ? (
              config.yAxis.map((axis, index) => (
                <Line
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stroke={colorScheme[index % colorScheme.length]}
                  strokeWidth={2}
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
                  strokeWidth={2}
                  name={String(group)}
                  activeDot={{ r: 8 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={config.yAxis as string}
                stroke={colorScheme[0]}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            )}
          </LineChart>
        )

      case "bar":
        return (
          <BarChart data={processedData} margin={margin}>
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
            <YAxis tick={{ fontSize: 12 }} domain={[minValue, maxValue]} />
            <Tooltip />
            <Legend />
            {config.yAxis && Array.isArray(config.yAxis) ? (
              config.yAxis.map((axis, index) => (
                <Bar
                  key={axis}
                  dataKey={axis}
                  fill={colorScheme[index % colorScheme.length]}
                  barSize={30}
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
                  barSize={30}
                />
              ))
            ) : (
              <Bar
                dataKey={config.yAxis as string}
                fill={colorScheme[0]}
                barSize={30}
              />
            )}
          </BarChart>
        )

      case "area":
        return (
          <AreaChart data={processedData} margin={margin}>
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
            <YAxis tick={{ fontSize: 12 }} domain={[minValue, maxValue]} />
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
                  strokeWidth={2}
                  fillOpacity={0.6}
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
                  strokeWidth={2}
                  name={String(group)}
                  fillOpacity={0.6}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={config.yAxis as string}
                fill={colorScheme[0]}
                stroke={colorScheme[0]}
                strokeWidth={2}
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        )

      case "pie":
        // For pie charts, we need to transform the data
        const isIdPattern = (value: any) =>
          typeof value === "string" && /^[A-Z][0-9]+$/i.test(value)

        // Check if we need to group data (if x-axis looks like IDs)
        const needsGrouping =
          config.xAxis &&
          data.length > 0 &&
          isIdPattern(data[0][config.xAxis as string])

        // Process the data differently if it has ID-like values
        let pieData = []

        if (needsGrouping && config.xAxis) {
          // Group by the first digit of the ID
          const buckets = new Map<string, number>()

          data.forEach((item) => {
            const id = item[config.xAxis as string] as string
            const match = id.match(/[0-9]+/)
            if (match) {
              const bucket = `Group ${match[0].charAt(0)}`
              const value =
                typeof item[config.yAxis as string] === "string"
                  ? parseFloat(item[config.yAxis as string] || "0")
                  : item[config.yAxis as string] || 0

              buckets.set(bucket, (buckets.get(bucket) || 0) + value)
            }
          })

          pieData = Array.from(buckets).map(([name, value]) => ({
            name,
            value
          }))
        } else if (config.groupBy) {
          // Regular grouped data processing
          pieData = [
            ...new Set(data.map((item) => item[config.groupBy as string]))
          ].map((group) => {
            const total = data
              .filter((item) => item[config.groupBy as string] === group)
              .reduce((sum, item) => {
                const val =
                  typeof item[config.yAxis as string] === "string"
                    ? parseFloat(item[config.yAxis as string] || "0")
                    : item[config.yAxis as string] || 0
                return sum + val
              }, 0)

            return {
              name: group,
              value: total
            }
          })
        } else {
          // Individual data points
          pieData = data.map((item) => {
            const value =
              typeof item[config.yAxis as string] === "string"
                ? parseFloat(item[config.yAxis as string] || "0")
                : item[config.yAxis as string] || 0

            return {
              name: item[config.xAxis as string],
              value: value
            }
          })
        }

        // Limit the number of pie slices for better visualization (max 8 slices)
        if (pieData.length > 8) {
          // Sort by value (descending)
          pieData.sort((a, b) => b.value - a.value)

          // Take top 7 slices and aggregate the rest into "Other"
          const topSlices = pieData.slice(0, 7)
          const otherSlices = pieData.slice(7)

          const otherValue = otherSlices.reduce(
            (sum, item) => sum + item.value,
            0
          )

          pieData = [...topSlices, { name: "Other", value: otherValue }]
        }

        return (
          <PieChart margin={margin}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              innerRadius={30}
              outerRadius={110}
              fill="#8884d8"
              stroke="#fff"
              strokeWidth={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorScheme[index % colorScheme.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => Number(value).toLocaleString()} />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        )

      case "scatter":
        return (
          <ScatterChart margin={margin}>
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
      <div
        style={{
          width: "100%",
          height: `${height}px`,
          position: "relative",
          minHeight: "300px"
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minHeight={300}
          aspect={undefined}
        >
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
