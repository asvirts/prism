import { useState } from "react"
import {
  ApiConfig,
  fetchFromApi,
  flattenApiData
} from "../../lib/data-connectors/api-connector"

interface ApiImportProps {
  onDataImported: (data: {
    headers: string[]
    rows: Record<string, any>[]
  }) => void
  onError?: (error: string) => void
}

export default function ApiImport({ onDataImported, onError }: ApiImportProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    url: "",
    method: "GET",
    headers: {},
    params: {},
    body: {},
    authType: "none"
  })
  const [showAuthDetails, setShowAuthDetails] = useState(false)
  const [showHeaders, setShowHeaders] = useState(false)
  const [showParams, setShowParams] = useState(false)
  const [showBody, setShowBody] = useState(false)

  const handleFetchData = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiConfig.url) {
      onError?.("API URL is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetchFromApi(apiConfig)

      if (response.status >= 400) {
        onError?.(
          `API Error: ${response.status} - ${JSON.stringify(response.data)}`
        )
        setIsLoading(false)
        return
      }

      // Convert API data to tabular format
      const flatData = flattenApiData(response.data)

      if (!flatData.length) {
        onError?.("API response does not contain any usable data")
        setIsLoading(false)
        return
      }

      // Extract headers from the first row
      const headers = Object.keys(flatData[0])

      onDataImported({
        headers,
        rows: flatData
      })
    } catch (error) {
      console.error("Error fetching API data:", error)
      onError?.(
        error instanceof Error ? error.message : "Failed to fetch data from API"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    field: keyof ApiConfig,
    value: string | Record<string, any>
  ) => {
    setApiConfig((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAuthDetailsChange = (field: string, value: string) => {
    setApiConfig((prev) => ({
      ...prev,
      authDetails: {
        ...prev.authDetails,
        [field]: value
      }
    }))
  }

  const handleObjectFieldChange = (
    objectField: "headers" | "params" | "body",
    key: string,
    value: string
  ) => {
    setApiConfig((prev) => ({
      ...prev,
      [objectField]: {
        ...prev[objectField],
        [key]: value
      }
    }))
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Import API Data</h3>

      <form onSubmit={handleFetchData}>
        <div className="space-y-4">
          {/* URL and Method */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                API URL
              </label>
              <input
                type="url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://api.example.com/data"
                value={apiConfig.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Method
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={apiConfig.method}
                onChange={(e) =>
                  handleInputChange(
                    "method",
                    e.target.value as ApiConfig["method"]
                  )
                }
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          {/* Authentication */}
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Authentication
              </label>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setShowAuthDetails(!showAuthDetails)}
              >
                {showAuthDetails ? "Hide" : "Show"}
              </button>
            </div>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={apiConfig.authType}
              onChange={(e) =>
                handleInputChange(
                  "authType",
                  e.target.value as ApiConfig["authType"]
                )
              }
            >
              <option value="none">None</option>
              <option value="basic">Basic Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apiKey">API Key</option>
            </select>

            {showAuthDetails && apiConfig.authType !== "none" && (
              <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                {apiConfig.authType === "basic" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={apiConfig.authDetails?.username || ""}
                        onChange={(e) =>
                          handleAuthDetailsChange("username", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={apiConfig.authDetails?.password || ""}
                        onChange={(e) =>
                          handleAuthDetailsChange("password", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}

                {apiConfig.authType === "bearer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Token
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={apiConfig.authDetails?.token || ""}
                      onChange={(e) =>
                        handleAuthDetailsChange("token", e.target.value)
                      }
                    />
                  </div>
                )}

                {apiConfig.authType === "apiKey" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        API Key
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={apiConfig.authDetails?.apiKey || ""}
                        onChange={(e) =>
                          handleAuthDetailsChange("apiKey", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Key Name
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="X-API-Key"
                        value={apiConfig.authDetails?.apiKeyName || ""}
                        onChange={(e) =>
                          handleAuthDetailsChange("apiKeyName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={
                          apiConfig.authDetails?.apiKeyLocation || "header"
                        }
                        onChange={(e) =>
                          handleAuthDetailsChange(
                            "apiKeyLocation",
                            e.target.value as "header" | "query"
                          )
                        }
                      >
                        <option value="header">Header</option>
                        <option value="query">Query Parameter</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Optional sections */}
          <div className="space-y-4">
            {/* Headers */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Headers
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setShowHeaders(!showHeaders)}
                >
                  {showHeaders ? "Hide" : "Add Headers"}
                </button>
              </div>

              {showHeaders && (
                <div className="mt-2 space-y-2">
                  {Object.entries(apiConfig.headers || {}).map(
                    ([key, value], index) => (
                      <div key={index} className="grid grid-cols-5 gap-2">
                        <input
                          type="text"
                          placeholder="Header name"
                          className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={key}
                          onChange={(e) => {
                            const newHeaders = { ...apiConfig.headers }
                            delete newHeaders[key]
                            newHeaders[e.target.value] = value
                            handleInputChange("headers", newHeaders)
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={value}
                          onChange={(e) =>
                            handleObjectFieldChange(
                              "headers",
                              key,
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            const newHeaders = { ...apiConfig.headers }
                            delete newHeaders[key]
                            handleInputChange("headers", newHeaders)
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      const newHeaders = { ...apiConfig.headers, "": "" }
                      handleInputChange("headers", newHeaders)
                    }}
                  >
                    + Add Header
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Fetching...
                </span>
              ) : (
                "Fetch Data"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
