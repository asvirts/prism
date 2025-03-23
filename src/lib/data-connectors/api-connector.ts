import axios from "axios"

export interface ApiConfig {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: Record<string, any>
  authType?: "none" | "basic" | "bearer" | "apiKey"
  authDetails?: {
    username?: string
    password?: string
    token?: string
    apiKey?: string
    apiKeyName?: string
    apiKeyLocation?: "header" | "query"
  }
}

export interface ApiResponse {
  data: any
  status: number
  headers: Record<string, string>
}

export async function fetchFromApi(config: ApiConfig): Promise<ApiResponse> {
  let headers: Record<string, string> = { ...config.headers }
  let params = { ...config.params }

  // Handle authentication
  if (
    config.authType === "basic" &&
    config.authDetails?.username &&
    config.authDetails?.password
  ) {
    const token = btoa(
      `${config.authDetails.username}:${config.authDetails.password}`
    )
    headers["Authorization"] = `Basic ${token}`
  } else if (config.authType === "bearer" && config.authDetails?.token) {
    headers["Authorization"] = `Bearer ${config.authDetails.token}`
  } else if (config.authType === "apiKey" && config.authDetails?.apiKey) {
    if (
      config.authDetails.apiKeyLocation === "header" &&
      config.authDetails.apiKeyName
    ) {
      headers[config.authDetails.apiKeyName] = config.authDetails.apiKey
    } else if (
      config.authDetails.apiKeyLocation === "query" &&
      config.authDetails.apiKeyName
    ) {
      params[config.authDetails.apiKeyName] = config.authDetails.apiKey
    }
  }

  try {
    const response = await axios({
      url: config.url,
      method: config.method,
      headers,
      params,
      data: config.body
    })

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers as Record<string, string>
      }
    }
    throw error
  }
}

export function validateApiResponse(data: any): boolean {
  // Basic validation to ensure we received data
  return data !== null && data !== undefined
}

export function flattenApiData(data: any): Record<string, any>[] {
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (typeof item === "object" && item !== null) {
        return item
      }
      return { value: item }
    })
  } else if (typeof data === "object" && data !== null) {
    // If the API returned an object with an array property, try to use that
    const arrayProps = Object.keys(data).filter((key) =>
      Array.isArray(data[key])
    )
    if (arrayProps.length > 0) {
      // Use the first array property found
      return data[arrayProps[0]]
    }
    // If no array properties, return the object as a single-item array
    return [data]
  }

  // If data is primitive, wrap it
  return [{ value: data }]
}
