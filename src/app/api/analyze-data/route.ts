import { NextResponse } from "next/server"
import OpenAI from "openai"
import { ChartType } from "@/components/visualizations/ChartComponent"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { headers, rows } = await request.json()

    if (!headers || !rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      )
    }

    // Sample the data to reduce tokens sent to OpenAI
    const sampleSize = Math.min(50, rows.length)
    const sampledRows = rows.slice(0, sampleSize)

    // Format the data for OpenAI analysis
    const dataDescription = `
      Headers: ${JSON.stringify(headers)}
      Data sample (${sampleSize} of ${rows.length} rows): ${JSON.stringify(
      sampledRows
    )}
    `

    const prompt = `
      You are a data visualization expert. Analyze the following dataset and suggest the best 
      visualizations to represent the data meaningfully. The dataset has the following structure:
      
      ${dataDescription}
      
      Return a JSON array of visualization suggestions. Each suggestion should have:
      1. chartType: One of "bar", "line", "pie", "area", or "scatter"
      2. xAxis: The field to use for the x-axis or categories
      3. yAxis: The field to use for the y-axis or values
      4. groupBy (optional): A field to group data by
      5. title: A descriptive title for the chart
      6. description: A brief explanation of what this visualization shows
      
      Ensure that:
      - Date fields are used appropriately for time series (typically on x-axis)
      - Numeric fields are used for values (typically on y-axis)
      - Categorical fields with 2-15 unique values are good for grouping
      - For pie charts, categories should be meaningful and not too numerous
      - For scatter plots, both axes should be numeric with potential correlation
      
      Focus on creating visualizations that reveal insights about the data.
      Return exactly 3-5 different types of well-thought-out visualizations.
    `

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo",
      response_format: { type: "json_object" }
    })

    const responseContent = completion.choices[0].message.content
    if (!responseContent) {
      throw new Error("Empty response from OpenAI")
    }

    // Parse the response and format it for our application
    const responseJson = JSON.parse(responseContent)

    // Validate the response structure and format for our application
    let suggestions = []
    if (responseJson.suggestions && Array.isArray(responseJson.suggestions)) {
      suggestions = responseJson.suggestions.map((suggestion: any) => ({
        chartType: suggestion.chartType as ChartType,
        config: {
          xAxis: suggestion.xAxis,
          yAxis: suggestion.yAxis,
          groupBy: suggestion.groupBy || null,
          title: suggestion.title
        },
        description: suggestion.description
      }))
    } else {
      // Try to parse if the response is not in the expected format
      suggestions = Object.values(responseJson)
        .filter((value: any) => value && typeof value === "object")
        .map((suggestion: any) => ({
          chartType: suggestion.chartType as ChartType,
          config: {
            xAxis: suggestion.xAxis,
            yAxis: suggestion.yAxis,
            groupBy: suggestion.groupBy || null,
            title: suggestion.title
          },
          description: suggestion.description
        }))
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error analyzing data:", error)
    return NextResponse.json(
      { error: "Failed to analyze data" },
      { status: 500 }
    )
  }
}
