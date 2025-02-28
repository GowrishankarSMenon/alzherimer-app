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
    <button
      className={`
        bg-[#ed6325] text-white px-6 py-3 rounded-lg font-medium
        transition-all duration-300 ease-in-out
        hover:bg-[#d75c23] hover:shadow-lg
        active:bg-[#e67744] active:shadow-inner
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:bg-[#e99f7c] disabled:cursor-not-allowed disabled:shadow-none
      `}
      onClick={sendSMS}
      disabled={loading || sent}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">🔄</span>
          Sending...
        </span>
      ) : sent ? (
        <span className="flex items-center gap-2">
          <span>✅</span>
          Sent
        </span>
      ) : (
        "Send SMS"
      )}
    </button>
  );
}