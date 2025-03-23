import { useState } from "react"
import {
  parseCsvFile,
  transformCsvData,
  validateCsvData
} from "../../lib/data-connectors/csv-connector"

interface CsvImportProps {
  onDataImported: (data: {
    headers: string[]
    rows: Record<string, any>[]
  }) => void
  onError?: (error: string) => void
}

export default function CsvImport({ onDataImported, onError }: CsvImportProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsLoading(true)

    try {
      const parsedData = await parseCsvFile(file)

      if (!validateCsvData(parsedData)) {
        onError?.("The CSV file has an invalid format.")
        setIsLoading(false)
        return
      }

      // Transform data (auto-detect types, etc.)
      const transformedData = transformCsvData(parsedData)

      onDataImported(transformedData)
    } catch (error) {
      console.error("Error parsing CSV file:", error)
      onError?.(
        error instanceof Error ? error.message : "Failed to parse CSV file"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Import CSV Data</h3>

      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-t-2 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-500">
                  Processing...
                </span>
              </div>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">CSV file (max. 10MB)</p>
                {fileName && (
                  <p className="text-xs text-blue-500 mt-2">
                    Selected: {fileName}
                  </p>
                )}
              </>
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </label>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Your CSV file should have column headers in the first row.</p>
      </div>
    </div>
  )
}
