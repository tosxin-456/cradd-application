import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  LogOut,
  Settings,
  User,
  Sparkles
} from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";

export default function ChatHistory({ onSelectConversation, onNewChat }) {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bot-chat/conversations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // redirect to login page
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header / Branding - Fixed */}
      <div className="flex-shrink-0 p-4 flex items-center gap-2 border-b border-gray-200">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h2 className="font-semibold text-gray-800">My Chat</h2>
      </div>

      {/* New Chat button - Fixed */}
      <div className="flex-shrink-0 p-2 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 p-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Conversations - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-500 px-2">No previous chats</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="w-full flex items-center gap-2 p-2 rounded-md text-left hover:bg-gray-100 transition"
            >
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="truncate text-sm text-gray-800">
                {conv.title || `Conversation ${conv._id}`}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2 space-y-1">
        <button className="w-full flex items-center gap-2 p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition">
          <User className="w-4 h-4 text-gray-500" />
          Profile
        </button>
        <button className="w-full flex items-center gap-2 p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition">
          <Settings className="w-4 h-4 text-gray-500" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
