"use client";
import { useState } from "react";

export default function SMSButton() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendSMS = async () => {
    setLoading(true);
    const res = await fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello! This is a pre-defined message." }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      alert("Failed to send SMS");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={sendSMS}
        disabled={loading || sent}
      >
        {loading ? "Sending..." : sent ? "Sent ✅" : "Send SMS"}
      </button>
    </div>
  );
}
