import { GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "../config/apiConfig";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorToast from "./ErrorComponent";


export default function SignInWithGoogle() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const url = `${API_BASE_URL}/api/auth/google/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      localStorage.setItem(
        "access_token",
        data.token || data.data.access_token
      );
      localStorage.setItem("gottenThrough", data.user.howDidYouKnowUs || false);
      setError("");
      navigate("/chat");
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const handleError = () => {
    console.log("❌ Google Login Failed");
    setError("Google login was cancelled or failed. Please try again.");
  };

  const clearError = () => setError("");

  return (
    <>
      <ErrorToast error={error} onClose={clearError} duration={6000} />

      <div className="flex justify-center mt-6">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          shape="rectangular"
          text="signin_with"
          size="large"
        />
      </div>
    </>
  );
}
