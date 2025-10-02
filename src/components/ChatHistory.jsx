import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  LogOut,
  Settings,
  User,
  Sparkles,
  Pencil
} from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";

export default function ChatHistory({ onSelectConversation,  }) {
  const [conversations, setConversations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const navigate = useNavigate();

  // fetch conversations
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
        // console.log(data)
        setConversations(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchHistory();
  }, []);

  // handle rename submit
  const handleRename = async (id) => {
    if (!newTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/bot-chat/conversations/${id}/title`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          },
          body: JSON.stringify({ newTitle })
        }
      );

      if (!res.ok) throw new Error("Failed to rename conversation");
      const data = await res.json();

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === id ? { ...conv, title: data.title } : conv
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Error renaming conversation:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // redirect to login page
  };

    const newChat = () => {
      navigate("/chat"); // redirect to login page
    };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header / Branding */}
      <div className="flex-shrink-0 p-4 flex items-center gap-2 border-b border-gray-200">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h2 className="font-semibold text-gray-800">My Chat</h2>
      </div>

      {/* New Chat */}
      <div className="flex-shrink-0 p-2 border-b border-gray-200">
        <button
          onClick={newChat}
          className="w-full flex items-center gap-2 p-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-500 px-2">No previous chats</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition"
            >
              {editingId === conv._id ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={() => handleRename(conv._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(conv._id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="flex-1 text-sm p-1 border rounded"
                />
              ) : (
                <button
                  onClick={() => navigate(`/chat/${conv._id}`)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="truncate text-sm text-gray-800">
                    {conv.title || `Conversation ${conv._id}`}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setEditingId(conv._id);
                  setNewTitle(conv.title || "");
                }}
                className="p-1 text-gray-500 hover:text-gray-800"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
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
