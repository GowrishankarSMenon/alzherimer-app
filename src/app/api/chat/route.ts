import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const { message, page } = await req.json();

  if (!message || !page) {
    return NextResponse.json({ error: "Message or page missing" }, { status: 400 });
  }
let prompt;
  if (page === "/charity") {
    // In /charity, users can contribute ETH to organizations or patients suffering from Alzheimer's.
    prompt = `Charity Page: On this page, you can contribute ETH to organizations or patients suffering from Alzheimer's. Your transaction is securely recorded on a tamper-proof blockchain. Question: ${message}. Please answer in up to 3 concise points.`;
  } else if (page === "/charity/docs") {
    // In /charity/docs, users can upload important document information and location details.
    prompt = `Charity Docs: On this page, you can upload important document information along with the location details. The secure memory vault ensures these records are preserved on a blockchain. Question: ${message}. Answer in up to 3 brief points.`;
  } else if (page === "/charity/biodata") {
    // In /charity/biodata, users can upload biodata of other persons.
    prompt = `Charity Biodata: On this page, you can upload biodata of other persons. The secure memory vault keeps your data safe on a tamper-proof blockchain. Question: ${message}. Please answer in up to 3 clear points.`;
  } else {
    prompt = `Default Prompt: Secure memory vault with blockchain. Question: ${message}. Answer concisely in 3 points.`;
  }
     prompt=prompt+"explain in simple and concise way to patients , in 3 lines"
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyB9JFB4drSiwZBmSdQVmbs8erueoPNWhLc");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the response." },
      { status: 500 }
    );
  }
}
