import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message ) {
    return NextResponse.json({ error: "Message or identity missing" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI("AIzaSyB9JFB4drSiwZBmSdQVmbs8erueoPNWhLc");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Give me a reply as this elon musk to the following question or text message in chat: "${message}". Points to note: the reply should match their personality.`;
    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred while generating the response." }, { status: 500 });
  }
}
