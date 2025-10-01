import { Routes, Route, Link } from "react-router-dom";
import ChatPage from "./pages/chat page";


export default function App() {
  return (
    <div>
      {/* Simple Nav */}
      {/* <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link to="/chat">Chat</Link>
      </nav> */}

      {/* Route Definitions */}
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: "2rem" }}>
              <h1>Welcome to Craddule</h1>
              <p>This is the landing page.</p>
            </div>
          }
        />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </div>
  );
}
