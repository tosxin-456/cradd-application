import React, { useState, useEffect } from "react";
import ChatHistory from "../../components/ChatHistory";
import ChatInterface from "../../components/ChatInterface.jsx";
import {
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Sparkles
} from "lucide-react";

export default function ChatPage() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [showHistory, setShowHistory] = useState(true);

  // Detect screen size on mount
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768; // md breakpoint
    setShowHistory(isDesktop);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-50 md:z-0
          h-full
          transition-transform duration-300 ease-in-out
          bg-white border-r border-gray-200 shadow-sm
          w-72
          ${
            showHistory ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
          ${showHistory ? "md:w-72" : "md:w-0"}
        `}
      >
        <div
          className={`${
            showHistory ? "opacity-100" : "opacity-0 md:opacity-0"
          } transition-opacity duration-200 h-full flex flex-col`}
        >
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Conversations</h2>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
            >
              <PanelLeftClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Chat history */}
          <div className="flex-1 overflow-hidden">
            <ChatHistory
              onSelectConversation={(id) => {
                setActiveConversation(id);
                setShowHistory(false);
              }}
              onNewChat={() => setActiveConversation(null)}
            />
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <PanelLeft className="w-5 h-5 text-gray-700 md:hidden" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h1 className="font-semibold text-gray-800 text-lg">Chat</h1>
              </div>
            </div>

            {/* Desktop toggle (close button) */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showHistory ? (
                <PanelLeftClose className="w-5 h-5 text-gray-600" />
              ) : (
                <PanelLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ChatInterface conversationId={activeConversation} />
        </div>
      </div>
    </div>
  );
}
