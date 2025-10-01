import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";



export default function ChatHistory({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

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

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 h-screen overflow-y-auto">
      <h2 className="p-4 font-semibold text-gray-800">History</h2>
      <div className="space-y-2 p-2">
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
                {conv.title || `Conversation ${conv.id}`}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
