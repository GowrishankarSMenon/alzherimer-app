import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER!;
const recipientNumber = process.env.RECIPIENT_PHONE_NUMBER!; // Default recipient

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: recipientNumber,
    });

    return NextResponse.json({ success: true, sid: response.sid });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
