import csvParser from "csv-parser"
import { Readable } from "stream"

export interface ParsedCsvData {
  headers: string[]
  rows: Record<string, any>[]
}

export async function parseCsvFile(file: File): Promise<ParsedCsvData> {
  const text = await file.text()
  const results: Record<string, any>[] = []
  let headers: string[] = []

  return new Promise((resolve, reject) => {
    const stream = Readable.from(text)

    stream
      .pipe(csvParser())
      .on("headers", (headerList: string[]) => {
        headers = headerList
      })
      .on("data", (data: Record<string, any>) => results.push(data))
      .on("end", () => {
        resolve({ headers, rows: results })
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

export function validateCsvData(data: ParsedCsvData): boolean {
  // Check if we have headers and rows
  if (!data.headers.length || !data.rows.length) {
    return false
  }

  // Check if all rows have values for each header
  return data.rows.every((row) => data.headers.every((header) => header in row))
}

export function transformCsvData(data: ParsedCsvData): ParsedCsvData {
  // Auto-detect and convert numeric values
  const transformedRows = data.rows.map((row) => {
    const transformedRow: Record<string, any> = {}

    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === "string") {
        // Try to convert to number if it looks like a number
        const numValue = Number(value)
        if (!isNaN(numValue) && String(numValue) === value) {
          transformedRow[key] = numValue
        } else {
          transformedRow[key] = value
        }
      } else {
        transformedRow[key] = value
      }
    })

    return transformedRow
  })

  return {
    headers: data.headers,
    rows: transformedRows
  }
}
