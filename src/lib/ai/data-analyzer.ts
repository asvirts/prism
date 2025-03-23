import OpenAI from "openai"

// Don't initialize OpenAI in the client-side code
// Instead, create a dynamic initialization that's safe for both environments
const getOpenAIClient = () => {
  // Check if we're running on the client
  if (typeof window !== "undefined") {
    throw new Error(
      "OpenAI API calls must be made from server components or API routes"
    )
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
  })
}

export interface AnalysisResult {
  trends?: string[]
  anomalies?: string[]
  correlations?: string[]
  insights?: string[]
  summary?: string
}

export async function analyzeDataset(
  data: Record<string, any>[],
  headers: string[],
  options: {
    focusOn?: "trends" | "anomalies" | "correlations" | "insights" | "all"
    timeField?: string
    valueFields?: string[]
    categoryFields?: string[]
  } = { focusOn: "all" }
): Promise<AnalysisResult> {
  // Prepare the data sample for analysis
  // We'll limit to a reasonable sample size to avoid token limits
  const sampleSize = Math.min(data.length, 100)
  const sample = data.slice(0, sampleSize)

  // Prepare the prompt based on the analysis options
  let systemPrompt = `You are a data analyst AI. Analyze the following dataset and provide insights.`

  if (options.focusOn && options.focusOn !== "all") {
    systemPrompt += ` Focus primarily on identifying ${options.focusOn}.`
  }

  if (options.timeField) {
    systemPrompt += ` Pay special attention to time-based patterns using the '${options.timeField}' field.`
  }

  if (options.valueFields?.length) {
    systemPrompt += ` Analyze numerical trends and patterns in these fields: ${options.valueFields.join(
      ", "
    )}.`
  }

  if (options.categoryFields?.length) {
    systemPrompt += ` Consider these as categorical fields for segmentation: ${options.categoryFields.join(
      ", "
    )}.`
  }

  // Convert the data to a readable format
  const dataString = JSON.stringify(sample, null, 2)

  const userPrompt = `
  Here is the dataset with ${sample.length} rows (from total of ${
    data.length
  } rows) and the following columns: ${headers.join(", ")}
  
  Data sample:
  ${dataString}
  
  Please analyze this data and provide the following:
  1. Key trends identified
  2. Any anomalies detected
  3. Correlations between variables
  4. Actionable insights
  5. Brief summary
  
  Format your response as JSON with the following structure:
  {
    "trends": ["trend 1", "trend 2", ...],
    "anomalies": ["anomaly 1", "anomaly 2", ...],
    "correlations": ["correlation 1", "correlation 2", ...],
    "insights": ["insight 1", "insight 2", ...],
    "summary": "Brief overall summary of the data"
  }
  `

  try {
    // Since we can't access OpenAI API from client components,
    // we'll return mock data for now until we implement a server-side API route
    // For a real solution, we would make this API call from an API route

    // Mock data response for client-side rendering
    if (typeof window !== "undefined") {
      return {
        trends: ["Sample trend 1", "Sample trend 2"],
        anomalies: ["Sample anomaly 1"],
        correlations: ["Sample correlation 1", "Sample correlation 2"],
        insights: [
          "This is a mock insight since OpenAI API calls must be made from the server"
        ],
        summary:
          "This is mock data. To get real AI analysis, you'll need to implement a server-side API route"
      }
    }

    // Server-side rendering path
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("Empty response from AI")
    }

    try {
      return JSON.parse(content) as AnalysisResult
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e)
      return {
        insights: [content],
        summary: "AI analysis completed but returned in non-JSON format."
      }
    }
  } catch (error) {
    console.error("Error analyzing data with AI:", error)
    return {
      insights: ["Error occurred during AI analysis."],
      summary: "Analysis failed due to an error."
    }
  }
}

export async function generateDataVisualizationSuggestions(
  data: Record<string, any>[],
  headers: string[]
): Promise<{ chartType: string; config: any }[]> {
  // Sample the data
  const sampleSize = Math.min(data.length, 50)
  const sample = data.slice(0, sampleSize)

  const systemPrompt = `You are a data visualization expert AI. Suggest the best visualization types for the given dataset.`

  const userPrompt = `
  Here is a dataset with ${sample.length} rows (from total of ${
    data.length
  } rows) and the following columns: ${headers.join(", ")}
  
  Data sample:
  ${JSON.stringify(sample, null, 2)}
  
  Suggest up to 3 visualization types that would best represent insights from this data.
  For each suggestion, provide:
  1. Chart type
  2. Which columns to use
  3. Why this visualization is appropriate
  4. Configuration settings (axes, etc.)
  
  Format your response as JSON with the following structure:
  [
    {
      "chartType": "line",
      "config": {
        "xAxis": "column_name",
        "yAxis": "column_name",
        "groupBy": "column_name",
        "title": "Suggested chart title"
      },
      "rationale": "Why this chart is appropriate"
    },
    ...
  ]
  `

  try {
    // Mock data for client-side rendering
    if (typeof window !== "undefined") {
      return [
        {
          chartType: "bar",
          config: {
            xAxis: headers[0],
            yAxis:
              headers.find((h) => typeof data[0][h] === "number") || headers[1],
            title: "Suggested Bar Chart"
          },
          rationale:
            "This is a mock visualization suggestion for client-side rendering."
        }
      ]
    }

    // Server-side rendering path
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("Empty response from AI")
    }

    try {
      return JSON.parse(content)
    } catch (e) {
      console.error("Failed to parse AI visualization suggestions as JSON:", e)
      return [
        {
          chartType: "bar",
          config: {
            xAxis: headers[0],
            yAxis: headers[1],
            title: "Default Chart"
          },
          rationale: "Default suggestion due to parsing error."
        }
      ]
    }
  } catch (error) {
    console.error("Error generating visualization suggestions:", error)
    return []
  }
}
