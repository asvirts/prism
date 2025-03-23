import axios from "axios"
import { ChartType } from "@/components/visualizations/ChartComponent"

export interface VisualizationSuggestion {
  chartType: ChartType
  config: {
    xAxis: string
    yAxis: string
    groupBy?: string | null
    title: string
  }
  description: string
}

/**
 * Analyzes a dataset using OpenAI and returns visualization suggestions
 */
export async function analyzeDataset(
  headers: string[],
  rows: Record<string, any>[]
): Promise<VisualizationSuggestion[]> {
  try {
    const response = await axios.post("/api/analyze-data", {
      headers,
      rows
    })

    return response.data.suggestions
  } catch (error) {
    console.error("Error analyzing dataset:", error)
    throw new Error("Failed to analyze dataset")
  }
}

/**
 * Provides basic dataset statistics to help with visualization
 */
export function getDatasetStats(
  headers: string[],
  rows: Record<string, any>[]
) {
  const stats: Record<
    string,
    {
      type: string
      uniqueValues: number
      hasNonZeroValues: boolean
      min?: number
      max?: number
      mean?: number
    }
  > = {}

  // Calculate stats for each column
  headers.forEach((header) => {
    const values = rows.map((row) => row[header])
    const uniqueValues = new Set(values).size

    // Check if column is numeric
    const numericValues = values
      .filter((v) => v !== null && v !== undefined)
      .map((v) => (typeof v === "string" ? parseFloat(v) : v))
      .filter((v) => !isNaN(v))

    const isNumeric = numericValues.length > rows.length * 0.5

    // Check if column contains dates
    const datePattern = /^\d{4}-\d{2}-\d{2}/
    const dateValues = values.filter(
      (v) => typeof v === "string" && datePattern.test(v)
    )
    const isDate = dateValues.length > rows.length * 0.5

    // Determine column type
    let type = "categorical"
    if (isNumeric) type = "numeric"
    if (isDate) type = "date"

    // Calculate numeric stats if applicable
    let min, max, mean
    if (isNumeric && numericValues.length > 0) {
      min = Math.min(...numericValues)
      max = Math.max(...numericValues)
      mean =
        numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
    }

    stats[header] = {
      type,
      uniqueValues,
      hasNonZeroValues: numericValues.some((v) => Math.abs(v) > 0.001),
      min,
      max,
      mean
    }
  })

  return stats
}

/**
 * Provides fallback visualization suggestions based on dataset statistics
 * Used when OpenAI analysis fails or is not available
 */
export function getFallbackSuggestions(
  headers: string[],
  rows: Record<string, any>[]
): VisualizationSuggestion[] {
  const stats = getDatasetStats(headers, rows)
  const suggestions: VisualizationSuggestion[] = []

  // Find date fields (potential x-axis for time series)
  const dateFields = Object.entries(stats)
    .filter(([_, stat]) => stat.type === "date")
    .map(([field]) => field)

  // Find numeric fields with non-zero values (potential y-axis)
  const numericFields = Object.entries(stats)
    .filter(([_, stat]) => stat.type === "numeric" && stat.hasNonZeroValues)
    .map(([field]) => field)

  // Find categorical fields with reasonable cardinality (potential groupBy)
  const categoryFields = Object.entries(stats)
    .filter(
      ([_, stat]) =>
        stat.type === "categorical" &&
        stat.uniqueValues >= 2 &&
        stat.uniqueValues <= 15
    )
    .map(([field]) => field)

  // 1. Time series chart if we have dates and numbers
  if (dateFields.length > 0 && numericFields.length > 0) {
    suggestions.push({
      chartType: "line",
      config: {
        xAxis: dateFields[0],
        yAxis: numericFields[0],
        title: `${numericFields[0]} Over Time`
      },
      description: `Shows how ${numericFields[0]} changes over time.`
    })

    // Also add a bar chart for a different view if we have multiple numeric fields
    if (numericFields.length > 1) {
      suggestions.push({
        chartType: "bar",
        config: {
          xAxis: dateFields[0],
          yAxis: numericFields[1],
          title: `${numericFields[1]} by Time Period`
        },
        description: `Compares ${numericFields[1]} across different time periods.`
      })
    }
  }

  // 2. Categorical comparison if we have categories and numbers
  if (categoryFields.length > 0 && numericFields.length > 0) {
    suggestions.push({
      chartType: "bar",
      config: {
        xAxis: categoryFields[0],
        yAxis: numericFields[0],
        title: `${numericFields[0]} by ${categoryFields[0]}`
      },
      description: `Compares ${numericFields[0]} across different ${categoryFields[0]} categories.`
    })

    // Also add a pie chart for showing distribution
    suggestions.push({
      chartType: "pie",
      config: {
        xAxis: categoryFields[0],
        yAxis: numericFields[0],
        title: `Distribution of ${numericFields[0]} by ${categoryFields[0]}`
      },
      description: `Shows the distribution of ${numericFields[0]} across ${categoryFields[0]} categories.`
    })
  }

  // 3. If we have two numeric fields, add a scatter plot
  if (numericFields.length >= 2) {
    suggestions.push({
      chartType: "scatter",
      config: {
        xAxis: numericFields[0],
        yAxis: numericFields[1],
        title: `Relationship Between ${numericFields[0]} and ${numericFields[1]}`
      },
      description: `Explores the potential correlation between ${numericFields[0]} and ${numericFields[1]}.`
    })
  }

  // 4. If we have categories, dates, and numbers, add a grouped visualization
  if (
    categoryFields.length > 0 &&
    dateFields.length > 0 &&
    numericFields.length > 0
  ) {
    suggestions.push({
      chartType: "line",
      config: {
        xAxis: dateFields[0],
        yAxis: numericFields[0],
        groupBy: categoryFields[0],
        title: `${numericFields[0]} Over Time by ${categoryFields[0]}`
      },
      description: `Compares how ${numericFields[0]} trends over time across different ${categoryFields[0]} categories.`
    })
  }

  // Ensure we have at least one suggestion
  if (suggestions.length === 0 && numericFields.length > 0) {
    // Fallback to simple visualization with the first numeric field
    const xAxis = headers.find((h) => h !== numericFields[0]) || headers[0]
    suggestions.push({
      chartType: "bar",
      config: {
        xAxis,
        yAxis: numericFields[0],
        title: `${numericFields[0]} Overview`
      },
      description: `A basic overview of ${numericFields[0]} values.`
    })
  }

  return suggestions
}
