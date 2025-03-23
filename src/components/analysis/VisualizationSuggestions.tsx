import { useState } from "react"
import { VisualizationSuggestion } from "@/lib/services/data-analysis"
import { ChartType } from "@/components/visualizations/ChartComponent"

interface VisualizationSuggestionsProps {
  suggestions: VisualizationSuggestion[]
  isLoading: boolean
  onApplySuggestion: (suggestion: VisualizationSuggestion) => void
}

export default function VisualizationSuggestions({
  suggestions,
  isLoading,
  onApplySuggestion
}: VisualizationSuggestionsProps) {
  const getChartIcon = (chartType: ChartType) => {
    switch (chartType) {
      case "bar":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        )
      case "line":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 000 2h14a1 1 0 000-2H3zm0 6a1 1 0 000 2h14a1 1 0 000-2H3zm0 6a1 1 0 000 2h14a1 1 0 000-2H3z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "pie":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        )
      case "area":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "scatter":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          AI-Powered Visualization Suggestions
        </h3>
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Analyzing your data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          AI-Powered Visualization Suggestions
        </h3>
        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">
            No visualization suggestions available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        AI-Powered Visualization Suggestions
      </h3>
      <p className="text-sm text-gray-500">
        Based on your data, our AI has suggested the following visualizations to
        help you gain insights:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {getChartIcon(suggestion.chartType)}
              </div>
              <h4 className="ml-2 text-base font-medium text-gray-900">
                {suggestion.config.title}
              </h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {suggestion.description}
            </p>
            <div className="text-xs text-gray-500 mb-3">
              <div className="flex">
                <span className="font-semibold mr-1">Chart Type:</span>
                <span className="capitalize">{suggestion.chartType}</span>
              </div>
              <div className="flex">
                <span className="font-semibold mr-1">X-Axis:</span>
                <span>{suggestion.config.xAxis}</span>
              </div>
              <div className="flex">
                <span className="font-semibold mr-1">Y-Axis:</span>
                <span>{suggestion.config.yAxis}</span>
              </div>
              {suggestion.config.groupBy && (
                <div className="flex">
                  <span className="font-semibold mr-1">Group By:</span>
                  <span>{suggestion.config.groupBy}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onApplySuggestion(suggestion)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply This Visualization
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
