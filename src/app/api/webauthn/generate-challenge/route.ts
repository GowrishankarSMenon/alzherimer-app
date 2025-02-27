import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Generate a random challenge
    const challenge = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
    
    return NextResponse.json({ challenge });
  } catch (error) {
    console.error("Error generating challenge:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}