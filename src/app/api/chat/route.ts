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
    const prompt = ` secure memory vault . it do save precious memories forever on a tamper-proof system called blockchain. question: ${message}, please ans to this question properly which can understand by a patient with memory loss or low iq?, Note: ans must with in 3 lines or point to point manner`;
    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred while generating the response." }, { status: 500 });
  }
}
