import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";

export default function ChatInterface() {
  const startedRef = useRef(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

//   useEffect(() => {
//     if (startedRef.current) return;
//     startedRef.current = true;

//     const startConversation = async () => {
//       try {
//         const res = await fetch(
//           `${API_BASE_URL}/api/bot-chat/conversation/start`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${localStorage.getItem("access_token")}`
//             }
//           }
//         );

//         if (!res.ok) throw new Error("Failed to start conversation");

//         const data = await res.json();
//         if (data.firstReply) {
//           setMessages([{ from: "bot", text: data.firstReply }]);
//         }
//         if (data.conversationId) {
//           localStorage.setItem("conversationId", data.conversationId);
//         }
//       } catch (err) {
//         console.error("Error starting conversation:", err);
//         setError("Failed to start chat. Please refresh.");
//       }
//     };

//     startConversation();
//   }, []);

  const sendMessage = async (messageText = null) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/bot-chat/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      let botReply;
      let showYesNo = false;

      if (typeof data.reply === "object") {
        botReply = formatBotReply(data.reply);
        showYesNo = true;
      } else {
        botReply = data.reply;
      }

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: botReply, showYesNo }
      ]);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setInput("");
    startedRef.current = false;
  };

  const formatBotReply = (analysis) => {
    return `📌 Summary\n${
      analysis.summary
    }\n\n💡 Suggestions\n${analysis.suggestions
      .map((s, i) => `${i + 1}. ${s.direction} – ${s.description}`)
      .join("\n")}\n\n✨ Features\n${analysis.features
      .map((f) => `• ${f}`)
      .join("\n")}\n\n💰 Monetization\n${analysis.monetization
      .map((m) => `• ${m.stream} – ${m.rationale}`)
      .join("\n")}\n\n📊 Revenue Estimates\n${Object.entries(
      analysis.revenue_estimates
    )
      .map(([k, v]) => `• ${k} → ${v}`)
      .join("\n")}\n\n🚀 Go-to-Market Channels\n${analysis.go_to_market
      .map((g) => `• ${g.channel} → ${g.success_percentage} success`)
      .join(
        "\n"
      )}\n\n✅ Next Step\nDo you want me to create a Business Plan and Marketing doc?\nReply YES or NO.`;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">Craddule</h1>
          <button
            onClick={resetConversation}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="New conversation"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-500">
                Share your project idea for comprehensive analysis
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="mb-6">
              <div className="text-xs font-medium text-gray-500 mb-2">
                {msg.from === "user" ? "You" : "Craddule"}
              </div>
              <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>
              {msg.showYesNo && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => sendMessage("YES")}
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => sendMessage("NO")}
                    className="px-4 py-2 border border-gray-300 text-gray-900 text-sm rounded-md hover:bg-gray-50 transition"
                  >
                    NO
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mb-6">
              <div className="text-xs font-medium text-gray-500 mb-2">
                Craddule
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message Craddule..."
              disabled={loading}
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
              style={{ minHeight: "52px", maxHeight: "200px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
