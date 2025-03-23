import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, headers, options } = body

    if (!data || !headers) {
      return NextResponse.json(
        { error: "Missing required fields: data, headers" },
        { status: 400 }
      )
    }

    // Prepare the data sample for analysis
    const sampleSize = Math.min(data.length, 100)
    const sample = data.slice(0, sampleSize)

    // Prepare the prompt based on the analysis options
    let systemPrompt = `You are a data analyst AI. Analyze the following dataset and provide insights.`

    if (options?.focusOn && options.focusOn !== "all") {
      systemPrompt += ` Focus primarily on identifying ${options.focusOn}.`
    }

    if (options?.timeField) {
      systemPrompt += ` Pay special attention to time-based patterns using the '${options.timeField}' field.`
    }

    if (options?.valueFields?.length) {
      systemPrompt += ` Analyze numerical trends and patterns in these fields: ${options.valueFields.join(
        ", "
      )}.`
    }

    if (options?.categoryFields?.length) {
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
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 }
      )
    }

    try {
      const result = JSON.parse(content)
      return NextResponse.json(result)
    } catch (e) {
      return NextResponse.json({
        insights: [content],
        summary: "AI analysis completed but returned in non-JSON format."
      })
    }
  } catch (error) {
    console.error("Error analyzing data with AI:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
