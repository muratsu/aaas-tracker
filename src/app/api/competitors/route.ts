import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const competitors = [
      {
        name: "Fal",
        color: "#2563eb",
        dataFile: "fal-code-search.json"
      },
      {
        name: "Hugging Face",
        color: "#dc2626",
        dataFile: "huggingface-code-search.json"
      },
      {
        name: "Replicate",
        color: "#16a34a",
        dataFile: "replicate-code-search.json"
      }
    ]

    const data = await Promise.all(
      competitors.map(async (competitor) => {
        const filePath = path.join(process.cwd(), 'data', competitor.dataFile)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const jsonData = JSON.parse(fileContent)
        
        return {
          name: competitor.name,
          color: competitor.color,
          data: jsonData
        }
      })
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error loading competitor data:', error)
    return NextResponse.json(
      { error: 'Failed to load competitor data' },
      { status: 500 }
    )
  }
} 