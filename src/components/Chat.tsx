"use client";
import { useState } from "react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ user: string; bot: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message) return;
    setLoading(true);

    const userMessage = message;
    setMessage("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        page: window.location.pathname, // passing the current page path
      }),
    });

    const data = await res.json();
    setChat([...chat, { user: userMessage, bot: data.reply }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-black text-white">
      <div className="w-full max-w-lg bg-gray-900 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Chatbot</h1>

        <div className="h-64 overflow-y-auto border border-gray-700 p-2 mb-4 rounded">
          {chat.map((c, i) => (
            <div key={i}>
              <p className="text-[#ed6325]font-semibold">You: {c.user}</p>
              <p className="text-gray-300">Bot: {c.bot}</p>
              <hr className="my-2 border-gray-700" />
            </div>
          ))}
        </div>

        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            className="ml-2 bg-[#ed6325] text-white px-4 py-2 rounded-lg"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
