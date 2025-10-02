import { Routes, Route, Link } from "react-router-dom";
import ChatPage from "./pages/chat page";
import Login from "./pages/sign in";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App() {
  return (
    <div>

      {/* Route Definitions */}
      <GoogleOAuthProvider clientId="652982067595-5ib81dgbepeqevr3868739t1bg4phrmm.apps.googleusercontent.com">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </GoogleOAuthProvider>
    </div>
  );
}
