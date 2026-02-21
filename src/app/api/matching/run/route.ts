import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { runMatchingAlgorithm } from "@/lib/matching"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For MVP, allow any authenticated user to run the algorithm
    // In production, this would be restricted to admins or run as a cron job
    
    const result = await runMatchingAlgorithm()

    return NextResponse.json({
      message: "Matching algorithm completed successfully",
      result
    })

  } catch (error) {
    console.error("Error running matching algorithm:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}