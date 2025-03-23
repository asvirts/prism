"use client"

import { useState } from "react"
import Link from "next/link"
import CsvImport from "@/components/data-import/CsvImport"
import ApiImport from "@/components/data-import/ApiImport"
import ChartComponent, {
  ChartType
} from "@/components/visualizations/ChartComponent"
import AIAnalysis from "@/components/analysis/AIAnalysis"
import { optimizeDataset } from "@/lib/utils/data-cache"

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState<
    "import" | "visualize" | "analyze" | "reports"
  >("import")
  const [datasetName, setDatasetName] = useState<string>("")
  const [currentData, setCurrentData] = useState<{
    headers: string[]
    rows: Record<string, any>[]
  } | null>(null)
  const [charts, setCharts] = useState<
    {
      id: string
      type: ChartType
      config: any
    }[]
  >([])
  const [error, setError] = useState<string | null>(null)

  const handleDataImported = (data: {
    headers: string[]
    rows: Record<string, any>[]
  }) => {
    // Optimize dataset for better performance with large datasets
    const optimizedData = optimizeDataset(data.rows, {
      maxRows: 10000,
      samplingStrategy: "evenly"
    })

    setCurrentData({
      headers: data.headers,
      rows: optimizedData
    })

    setCurrentTab("visualize")
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleAddChart = (chartType: ChartType, config: any = {}) => {
    if (!currentData) return

    const newChart = {
      id: `chart-${Date.now()}`,
      type: chartType,
      config: {
        type: chartType,
        xAxis: config.xAxis || currentData.headers[0],
        yAxis: config.yAxis || currentData.headers[1],
        title:
          config.title ||
          `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        ...config
      }
    }

    setCharts((prev) => [...prev, newChart])
  }

  const handleDeleteChart = (chartId: string) => {
    setCharts((prev) => prev.filter((chart) => chart.id !== chartId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Business Intelligence Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {currentData
                ? `Dataset: ${datasetName || "Untitled Dataset"} (${
                    currentData.rows.length
                  } rows)`
                : "No dataset loaded"}
            </span>
            <Link
              href="/"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={currentTab}
              onChange={(e) => setCurrentTab(e.target.value as any)}
            >
              <option value="import">Import Data</option>
              <option value="visualize">Visualize</option>
              <option value="analyze">Analyze</option>
              <option value="reports">Reports</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setCurrentTab("import")}
                className={`${
                  currentTab === "import"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                } px-3 py-2 font-medium text-sm rounded-md`}
              >
                Import Data
              </button>
              <button
                onClick={() => setCurrentTab("visualize")}
                className={`${
                  currentTab === "visualize"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                } px-3 py-2 font-medium text-sm rounded-md`}
                disabled={!currentData}
              >
                Visualize
              </button>
              <button
                onClick={() => setCurrentTab("analyze")}
                className={`${
                  currentTab === "analyze"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                } px-3 py-2 font-medium text-sm rounded-md`}
                disabled={!currentData}
              >
                AI Analysis
              </button>
              <button
                onClick={() => setCurrentTab("reports")}
                className={`${
                  currentTab === "reports"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                } px-3 py-2 font-medium text-sm rounded-md`}
                disabled={!currentData}
              >
                Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Import Data Tab */}
        {currentTab === "import" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Data Import
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="dataset-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dataset Name
                </label>
                <input
                  type="text"
                  id="dataset-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter a name for this dataset"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CsvImport
                  onDataImported={handleDataImported}
                  onError={handleError}
                />

                <ApiImport
                  onDataImported={handleDataImported}
                  onError={handleError}
                />
              </div>
            </div>
          </div>
        )}

        {/* Visualize Tab */}
        {currentTab === "visualize" && currentData && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Visualizations
                </h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAddChart("bar")}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Bar Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddChart("line")}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Line Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddChart("pie")}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Pie Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddChart("area")}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Area Chart
                  </button>
                </div>
              </div>

              {charts.length === 0 ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">
                    No charts yet. Use the buttons above to add visualizations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {charts.map((chart) => (
                    <div key={chart.id} className="relative">
                      <button
                        type="button"
                        onClick={() => handleDeleteChart(chart.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 z-10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <ChartComponent
                        data={currentData.rows}
                        config={chart.config}
                        height={300}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {currentTab === "analyze" && currentData && (
          <div className="space-y-6">
            <AIAnalysis
              data={currentData.rows}
              headers={currentData.headers}
              onVisualizationRequest={(suggestion) => {
                handleAddChart(
                  suggestion.chartType as ChartType,
                  suggestion.config
                )
                setCurrentTab("visualize")
              }}
            />
          </div>
        )}

        {/* Reports Tab */}
        {currentTab === "reports" && currentData && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Reports
              </h2>

              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">
                  Coming soon: scheduled reports and data insights notifications
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
