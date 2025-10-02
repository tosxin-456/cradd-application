import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";
import { useParams } from "react-router-dom";

export default function ChatInterface() {
  const startedRef = useRef(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const { id } = useParams();

  const activeConversationId = id || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id) {
      // No conversation ID = start new chat
      setMessages([]);
      setInput("");
      startedRef.current = false;
    }
  }, [id]);


  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/bot-chat/conversation/${activeConversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
          }
        );

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        console.log(data);

        // Process historical messages
        const processedMessages = data.map((msg) => {
          if (msg.from === "bot" && typeof msg.text === "string") {
            try {
              // Try to extract JSON from the message
              const jsonMatch = msg.text.match(/```json\n([\s\S]*?)\n```/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                return {
                  ...msg,
                  text: parsed,
                  showYesNo: msg.text.includes("YES or NO")
                };
              }
            } catch (e) {
              // If parsing fails, keep original
            }
          }
          return msg;
        });

        setMessages(processedMessages);
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError("Failed to load messages. Please refresh.");
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  const sendMessage = async (messageText = null) => {
    if (!activeConversationId) {
      setError("No conversation selected.");
      return;
    }

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
        body: JSON.stringify({
          message: userMessage,
          conversation_id: activeConversationId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      let botReply;
      let showYesNo = false;

      if (typeof data.reply === "string" && data.reply.trim().startsWith("{")) {
        try {
          const parsedReply = JSON.parse(data.reply);
          botReply = parsedReply;
          showYesNo = true;
        } catch (e) {
          botReply = { text: data.reply };
        }
      } else if (typeof data.reply === "object" && data.reply !== null) {
        botReply = data.reply;
        showYesNo = true;
      } else {
        botReply = { text: data.reply };
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

  const formatBotMessage = (content) => {
    if (typeof content === "string") {
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
        </div>
      );
    }

    if (content.summary) {
      return (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📌</span>
              <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {content.summary}
            </p>
          </div>

          {/* Suggestions */}
          {content.suggestions && content.suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="text-sm font-semibold text-gray-900">
                  Key Suggestions
                </h3>
              </div>
              <div className="space-y-2">
                {content.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 p-3 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {i + 1}. {suggestion.direction}
                    </h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {content.features && content.features.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✨</span>
                <h3 className="text-sm font-semibold text-gray-900">
                  Core Features
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {content.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg"
                  >
                    <span className="text-indigo-500 text-xs mt-0.5">✓</span>
                    <span className="text-gray-700 text-xs">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monetization */}
          {content.monetization && content.monetization.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💰</span>
                <h3 className="text-sm font-semibold text-gray-900">
                  Monetization Strategy
                </h3>
              </div>
              <div className="space-y-2">
                {content.monetization.map((method, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200"
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {method.stream}
                    </h4>
                    <p className="text-gray-600 text-xs">{method.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Estimates */}
          {content.revenue_estimates &&
            content.revenue_estimates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📊</span>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Revenue Projections
                  </h3>
                </div>
                <div className="space-y-2">
                  {content.revenue_estimates.map((estimate, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200"
                    >
                      <h4 className="font-medium text-gray-900 text-xs mb-2">
                        {estimate.stream}
                      </h4>
                      <div className="flex gap-3 text-xs">
                        <div className="flex flex-col">
                          <span className="text-gray-500">Low</span>
                          <span className="font-semibold text-gray-900">
                            ${estimate.estimates.low}k
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500">Likely</span>
                          <span className="font-semibold text-indigo-600">
                            ${estimate.estimates.likely}k
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500">High</span>
                          <span className="font-semibold text-gray-900">
                            ${estimate.estimates.high}k
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Go-to-Market */}
          {content.go_to_market && content.go_to_market.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🚀</span>
                <h3 className="text-sm font-semibold text-gray-900">
                  Marketing Channels
                </h3>
              </div>
              <div className="space-y-2">
                {content.go_to_market.map((channel, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200"
                  >
                    <span className="text-gray-700 text-sm">
                      {channel.channel}
                    </span>
                    <span className="font-semibold text-purple-700 text-sm">
                      {channel.success_percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Step */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✅</span>
              <h3 className="text-sm font-semibold text-gray-900">Next Step</h3>
            </div>
            <p className="text-gray-700 text-sm font-medium">
              Do you want me to create a Business Plan and Marketing doc?
            </p>
          </div>
        </div>
      );
    } else if (content.text) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-800 text-sm leading-relaxed">
            {content.text}
          </p>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap text-sm">
        {JSON.stringify(content, null, 2)}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Craddule</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Your AI Business Analyst
            </p>
          </div>
          <button
            onClick={resetConversation}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
            title="New conversation"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
      </div>

      {/* Messages Area - Two Column Layout */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                How can I help you today?
              </h2>
              <p className="text-gray-600 text-lg">
                Share your project idea for comprehensive analysis
              </p>
            </div>
          )}

          <div className="space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex">
                {msg.from === "user" ? (
                  <div className="ml-auto max-w-[75%]">
                    <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide text-right">
                      You
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                      <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mr-auto max-w-[75%]">
                    <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                      Craddule
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                      {formatBotMessage(msg.text)}

                      {msg.showYesNo && (
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => sendMessage("YES")}
                            className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg"
                          >
                            YES
                          </button>
                          <button
                            onClick={() => sendMessage("NO")}
                            className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition"
                          >
                            NO
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div></div>
              <div className="flex flex-col items-start">
                <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                  Craddule
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="text-sm font-medium">
                      Analyzing your idea...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your business idea..."
              disabled={loading}
              rows={1}
              className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-none text-sm"
              style={{ minHeight: "56px", maxHeight: "200px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
