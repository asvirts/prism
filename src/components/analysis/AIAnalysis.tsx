import { useState, useEffect } from "react"
import { AnalysisResult } from "../../lib/ai/data-analyzer"
import {
  analyzeDataset,
  VisualizationSuggestion
} from "@/lib/services/data-analysis"
import VisualizationSuggestions from "@/components/analysis/VisualizationSuggestions"

interface AIAnalysisProps {
  data: Record<string, any>[]
  headers: string[]
  onVisualizationRequest?: (suggestion: {
    chartType: string
    config: any
  }) => void
}

export default function AIAnalysis({
  data,
  headers,
  onVisualizationRequest
}: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<
    "trends" | "anomalies" | "correlations" | "insights" | "visualizations"
  >("insights")
  const [analysisOptions, setAnalysisOptions] = useState({
    focusOn: "all" as
      | "trends"
      | "anomalies"
      | "correlations"
      | "insights"
      | "all",
    timeField: "",
    valueFields: [] as string[],
    categoryFields: [] as string[]
  })
  const [visualizationSuggestions, setVisualizationSuggestions] = useState<
    VisualizationSuggestion[]
  >([])
  const [isLoadingVisualizations, setIsLoadingVisualizations] = useState(false)

  const getFieldType = (fieldName: string): "numeric" | "date" | "category" => {
    if (!data.length) return "category"

    const sample = data[0][fieldName]

    if (typeof sample === "number") return "numeric"
    if (typeof sample === "string") {
      // Check if it's a date
      if (sample.match(/^\d{4}-\d{2}-\d{2}/)) return "date"
      return "category"
    }

    return "category"
  }

  const handleRunAnalysis = async () => {
    setIsLoading(true)

    try {
      // Use the API route instead of direct OpenAI call
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data,
          headers,
          options: analysisOptions
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (error) {
      console.error("Error analyzing data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get AI-powered visualization suggestions
  const getVisualizationSuggestions = async () => {
    setIsLoadingVisualizations(true)
    try {
      const suggestions = await analyzeDataset(headers, data)
      setVisualizationSuggestions(suggestions)
      setActiveTab("visualizations")
    } catch (error) {
      console.error("Error getting visualization suggestions:", error)
    } finally {
      setIsLoadingVisualizations(false)
    }
  }

  const handleFieldSelectionChange = (
    field: string,
    type: "time" | "value" | "category"
  ) => {
    setAnalysisOptions((prev) => {
      if (type === "time") {
        return {
          ...prev,
          timeField: field === prev.timeField ? "" : field
        }
      } else if (type === "value") {
        const valueFields = [...prev.valueFields]
        const index = valueFields.indexOf(field)
        if (index === -1) {
          valueFields.push(field)
        } else {
          valueFields.splice(index, 1)
        }
        return {
          ...prev,
          valueFields
        }
      } else {
        const categoryFields = [...prev.categoryFields]
        const index = categoryFields.indexOf(field)
        if (index === -1) {
          categoryFields.push(field)
        } else {
          categoryFields.splice(index, 1)
        }
        return {
          ...prev,
          categoryFields
        }
      }
    })
  }

  // Function to apply a visualization suggestion
  const handleApplySuggestion = (suggestion: VisualizationSuggestion) => {
    if (onVisualizationRequest) {
      onVisualizationRequest({
        chartType: suggestion.chartType,
        config: suggestion.config
      })
    }
  }

  // Function to request visualizations from the API
  const requestVisualization = async () => {
    if (!onVisualizationRequest) return

    try {
      const response = await fetch("/api/visualize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data,
          headers
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const suggestions = await response.json()

      if (suggestions && suggestions.length > 0) {
        onVisualizationRequest(suggestions[0])
      } else {
        // Fallback if no suggestions returned
        onVisualizationRequest({
          chartType: "line",
          config: {
            type: "line",
            xAxis: analysisOptions.timeField || headers[0],
            yAxis:
              analysisOptions.valueFields[0] ||
              headers.find((h) => getFieldType(h) === "numeric") ||
              headers[1] ||
              headers[0],
            title: "Visualization"
          }
        })
      }
    } catch (error) {
      console.error("Error getting visualization suggestions:", error)
      // Use fallback
      onVisualizationRequest({
        chartType: "line",
        config: {
          type: "line",
          xAxis: analysisOptions.timeField || headers[0],
          yAxis:
            analysisOptions.valueFields[0] ||
            headers.find((h) => getFieldType(h) === "numeric") ||
            headers[1] ||
            headers[0],
          title: "Visualization"
        }
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">AI-Powered Analysis</h3>

      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("insights")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "insights"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab("visualizations")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "visualizations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            AI Visualization Suggestions
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "trends"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab("anomalies")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "anomalies"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Anomalies
          </button>
          <button
            onClick={() => setActiveTab("correlations")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "correlations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Correlations
          </button>
        </nav>
      </div>

      {activeTab === "visualizations" ? (
        <div className="space-y-4">
          {visualizationSuggestions.length === 0 && !isLoadingVisualizations ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">
                Get AI-powered visualization suggestions based on your data
                characteristics.
              </p>
              <button
                onClick={getVisualizationSuggestions}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate Visualization Suggestions
              </button>
            </div>
          ) : (
            <VisualizationSuggestions
              suggestions={visualizationSuggestions}
              isLoading={isLoadingVisualizations}
              onApplySuggestion={handleApplySuggestion}
            />
          )}
        </div>
      ) : !analysis ? (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-md font-medium mb-3">Analysis Options</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Focus Analysis On
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={analysisOptions.focusOn}
                  onChange={(e) =>
                    setAnalysisOptions((prev) => ({
                      ...prev,
                      focusOn: e.target.value as typeof analysisOptions.focusOn
                    }))
                  }
                >
                  <option value="all">All Insights</option>
                  <option value="trends">Trends</option>
                  <option value="anomalies">Anomalies</option>
                  <option value="correlations">Correlations</option>
                  <option value="insights">Business Insights</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Selection
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {headers.map((header) => (
                    <div key={header} className="flex items-center space-x-2">
                      <div className="text-sm text-gray-700 flex-1">
                        {header}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className={`px-2 py-1 text-xs rounded ${
                            analysisOptions.timeField === header
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          onClick={() =>
                            handleFieldSelectionChange(header, "time")
                          }
                        >
                          Time
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 text-xs rounded ${
                            analysisOptions.valueFields.includes(header)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          onClick={() =>
                            handleFieldSelectionChange(header, "value")
                          }
                        >
                          Value
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 text-xs rounded ${
                            analysisOptions.categoryFields.includes(header)
                              ? "bg-purple-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          onClick={() =>
                            handleFieldSelectionChange(header, "category")
                          }
                        >
                          Category
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleRunAnalysis}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze Data"}
            </button>
            {onVisualizationRequest && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={requestVisualization}
              >
                Create Visualization
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary section */}
          {analysis.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-blue-800 mb-2">
                Summary
              </h4>
              <p className="text-sm text-blue-700">{analysis.summary}</p>
            </div>
          )}

          {/* Tabs for different insight types */}
          <div>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`${
                    activeTab === "insights"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } w-1/4 py-2 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Insights
                  {analysis.insights && (
                    <span className="ml-2 text-xs">
                      ({analysis.insights.length})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`${
                    activeTab === "trends"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } w-1/4 py-2 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Trends
                  {analysis.trends && (
                    <span className="ml-2 text-xs">
                      ({analysis.trends.length})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("anomalies")}
                  className={`${
                    activeTab === "anomalies"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } w-1/4 py-2 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Anomalies
                  {analysis.anomalies && (
                    <span className="ml-2 text-xs">
                      ({analysis.anomalies.length})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("correlations")}
                  className={`${
                    activeTab === "correlations"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } w-1/4 py-2 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Correlations
                  {analysis.correlations && (
                    <span className="ml-2 text-xs">
                      ({analysis.correlations.length})
                    </span>
                  )}
                </button>
              </nav>
            </div>

            <div className="mt-4">
              {activeTab === "insights" && analysis.insights && (
                <ul className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <li
                      key={index}
                      className="bg-white border border-gray-200 rounded-md p-3 text-sm flex"
                    >
                      <svg
                        className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "trends" && analysis.trends && (
                <ul className="space-y-2">
                  {analysis.trends.map((trend, index) => (
                    <li
                      key={index}
                      className="bg-white border border-gray-200 rounded-md p-3 text-sm flex"
                    >
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "anomalies" && analysis.anomalies && (
                <ul className="space-y-2">
                  {analysis.anomalies.map((anomaly, index) => (
                    <li
                      key={index}
                      className="bg-white border border-gray-200 rounded-md p-3 text-sm flex"
                    >
                      <svg
                        className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{anomaly}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "correlations" && analysis.correlations && (
                <ul className="space-y-2">
                  {analysis.correlations.map((correlation, index) => (
                    <li
                      key={index}
                      className="bg-white border border-gray-200 rounded-md p-3 text-sm flex"
                    >
                      <svg
                        className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{correlation}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setAnalysis(null)}
            >
              Modify Analysis
            </button>
            {onVisualizationRequest && (
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={requestVisualization}
              >
                Create Visualization
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
