// Login.js
import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { handleTogglePassword, login } from "../../utils/loginUtils.js";

// Lazy load heavy dependencies
const ToastContainer = lazy(() =>
  import("react-toastify").then((module) => ({
    default: module.ToastContainer
  }))
);

const SignInWithGoogle = lazy(() => import("../../components/GoogleSignIn.jsx"));

// Lazy load CSS imports
const loadStyles = () => {
  // import('bootstrap/dist/css/bootstrap.min.css');
  import("../../App.css");
  import("react-toastify/dist/ReactToastify.css");
};

function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const navigate = useNavigate();

  // Lazy load toast for notifications
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Lazy load toast if not already loaded
    if (!toast) {
      const { toast: toastFunction } = await import("react-toastify");
      setToast(() => toastFunction);
      login(formData, setLoading, navigate, rememberMe, toastFunction);
    } else {
      login(formData, setLoading, navigate, rememberMe, toast);
    }
  };

  // Load styles after component mounts
  useEffect(() => {
    if (!stylesLoaded) {
      loadStyles();
      setStylesLoaded(true);
    }
  }, [stylesLoaded]);

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/chat");
    }
  }, [navigate]);

  // Load remembered credentials
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedRememberMe = localStorage.getItem("rememberMe");

    if (storedRememberMe === "true") {
      setFormData({
        username: storedEmail || "",
        password: storedPassword || ""
      });
      setRememberMe(true);
    }
  }, []);

  // Lazy load images
  const [images, setImages] = useState({
    design: null,
    logo: null,
    loginImage: null
  });

  useEffect(() => {
    const loadImages = async () => {
      try {
        const [designImg, logoImg, loginImg] = await Promise.all([
          import("../../assets/images/design.png"),
          import("../../assets/images/logo.png"),
          import("../../assets/images/login.png")
        ]);

        setImages({
          design: designImg.default,
          logo: logoImg.default,
          loginImage: loginImg.default
        });
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    loadImages();
  }, []);

  return (
    <>
      <div className="mt-[100px]"></div>
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="fa-spin text-[#1B45BF] text-4xl"
          />
        </div>
      )}
      <div className="w-[90%] m-auto lg:grid lg:grid-cols-2 bg-white rounded-xl">
        <div className="flex flex-col justify-center lg:p-20 p-5">
          <div>
            <div className="flex items-center gap-2 mb-6">
              {images.logo ? (
                <img
                  loading="lazy"
                  src={images.logo}
                  className="w-[40.12px] h-[40px]"
                  alt="Craddule Logo"
                />
              ) : (
                <div className="w-[40.12px] h-[40px] bg-gray-200 animate-pulse rounded"></div>
              )}
              <span className="text-[16px] font-semibold">Craddule</span>
            </div>

            <h5 className="font-bold text-2xl mb-2">Welcome back!</h5>
            <p className="text-[16px] text-black200 mb-6">
              Continue your growth with Craddule!
            </p>

            <Suspense
              fallback={
                <div className="w-full py-3 px-4 border border-gray-300 rounded-full text-center bg-gray-50">
                  <span className="text-gray-500">
                    Loading Google Sign In...
                  </span>
                </div>
              }
            >
              <SignInWithGoogle />
            </Suspense>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>
            <form onSubmit={handleSubmit} className="mt-14">
              <div className="mb-8 ">
                <label htmlFor="email" className="text-p18 font-semibold pb-1">
                  Email
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-black400 px-3 py-[10px] rounded-full"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className="text-p18 font-semibold pb-1 block"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-black400 px-3 py-[10px] rounded-full"
                />
                <span
                  className="absolute top-9 right-5 cursor-pointer"
                  onClick={() =>
                    handleTogglePassword(showPassword, setShowPassword)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    className={showPassword ? "hidden" : "block"}
                  >
                    <rect width="24" height="24" fill="none" />
                    <path
                      fill="#B0B0B0"
                      d="M2.54 4.71L3.25 4L20 20.75l-.71.71l-3.34-3.35c-1.37.57-2.87.89-4.45.89c-4.56 0-8.5-2.65-10.36-6.5c.97-2 2.49-3.67 4.36-4.82zM11.5 18c1.29 0 2.53-.23 3.67-.66l-1.12-1.13c-.73.5-1.6.79-2.55.79C9 17 7 15 7 12.5c0-.95.29-1.82.79-2.55L6.24 8.41a10.64 10.64 0 0 0-3.98 4.09C4.04 15.78 7.5 18 11.5 18m9.24-5.5C18.96 9.22 15.5 7 11.5 7c-1.15 0-2.27.19-3.31.53l-.78-.78C8.68 6.26 10.06 6 11.5 6c4.56 0 8.5 2.65 10.36 6.5a11.47 11.47 0 0 1-4.07 4.63l-.72-.73c1.53-.96 2.8-2.3 3.67-3.9M11.5 8C14 8 16 10 16 12.5c0 .82-.22 1.58-.6 2.24l-.74-.74c.22-.46.34-.96.34-1.5A3.5 3.5 0 0 0 11.5 9c-.54 0-1.04.12-1.5.34l-.74-.74c.66-.38 1.42-.6 2.24-.6M8 12.5a3.5 3.5 0 0 0 3.5 3.5c.67 0 1.29-.19 1.82-.5L8.5 10.68c-.31.53-.5 1.15-.5 1.82"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    className={showPassword ? "block" : "hidden"}
                  >
                    <rect width="24" height="24" fill="none" />
                    <path
                      fill="#B0B0B0"
                      d="M11.5 18c4 0 7.46-2.22 9.24-5.5C18.96 9.22 15.5 7 11.5 7s-7.46 2.22-9.24 5.5C4.04 15.78 7.5 18 11.5 18m0-12c4.56 0 8.5 2.65 10.36 6.5C20 16.35 16.06 19 11.5 19S3 16.35 1.14 12.5C3 8.65 6.94 6 11.5 6m0 2C14 8 16 10 16 12.5S14 17 11.5 17S7 15 7 12.5S9 8 11.5 8m0 1A3.5 3.5 0 0 0 8 12.5a3.5 3.5 0 0 0 3.5 3.5a3.5 3.5 0 0 0 3.5-3.5A3.5 3.5 0 0 0 11.5 9"
                    />
                  </svg>
                </span>
              </div>

              <div className="flex justify-between items-center text-[16px] mt-3">
                <div className="flex justify-start items-center gap-1">
                  <input
                    type="checkbox"
                    name="remember_me"
                    id="rememberMe"
                    className="cursor-pointer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="font-semibold">
                    Remember me
                  </label>
                </div>
                <div>
                  <a href="password" className="no-underline">
                    <span className="text-[#1B45BF] font-semibold">
                      Forgot password?
                    </span>
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="btn loginBtn mb-1 "
                disabled={loading}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" />
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
            <div className="m-auto w-fit ">
              <p className="mt-8 font-medium text-[16px]">
                Don’t have an account yet?
                <a
                  className="ps-2 no-underline text-center text-[#1B45BF]"
                  href="/signup"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden lg:flex items-center bg-[#193FAE] relative">
          <div className="absolute inset-0">
            {images.design ? (
              <>
                <img
                  loading="lazy"
                  src={images.design}
                  alt=""
                  className="absolute w-[196px] h-[219px] bottom-0 right-0 object-contain"
                />
                <img
                  loading="lazy"
                  src={images.design}
                  alt=""
                  className="absolute w-[196px] h-[219px] top-0 left-0 object-contain rotate-180"
                />
              </>
            ) : (
              <>
                <div className="absolute w-[196px] h-[219px] bottom-0 right-0 bg-blue-400 animate-pulse opacity-50"></div>
                <div className="absolute w-[196px] h-[219px] top-0 left-0 bg-blue-400 animate-pulse opacity-50"></div>
              </>
            )}
          </div>

          <div className="w-full text-center">
            {images.loginImage ? (
              <img
                loading="lazy"
                src={images.loginImage}
                alt="Login Illustration"
                className="m-auto"
              />
            ) : (
              <div className="w-64 h-64 bg-blue-400 animate-pulse rounded-lg m-auto opacity-50"></div>
            )}
            <h4 className="font-semibold text-white text-lg w-2/3 mx-auto mt-4">
              Turn your ideas into reality
            </h4>
            <p className="text-white text-[16px] w-2/3 mx-auto">
              We know that your ideas are unique. We provide requisite tailored
              tools.
            </p>
          </div>
        </div>

        <Suspense fallback={null}>
          <ToastContainer />
        </Suspense>
      </div>
    </>
  );
}

export default Login;
