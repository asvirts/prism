import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, headers } = body

    if (!data || !headers) {
      return NextResponse.json(
        { error: "Missing required fields: data, headers" },
        { status: 400 }
      )
    }

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
      return NextResponse.json([
        {
          chartType: "bar",
          config: {
            xAxis: headers[0],
            yAxis: headers[1],
            title: "Default Chart"
          },
          rationale: "Default suggestion due to parsing error."
        }
      ])
    }
  } catch (error) {
    console.error("Error generating visualization suggestions:", error)
    return NextResponse.json(
      {
        error: "Failed to generate visualization suggestions",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
