import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import RecaptchaProvider, { RecaptchaContext } from "../../components/recaptchaProvider";

function UserSettingsContent() {
  const { executeRecaptcha } = useContext(RecaptchaContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const paragraphs = [
    "Quality Over Free – A Premium Experience for Everyone. We believe in providing top-tier service without compromise, which is why we don't offer free accounts.",
    "Your Privacy, Protected by European Standards. Your personal data is in safe hands—we strictly follow GDPR, the gold standard in data protection.",
    "Online-Powered Performance – No Limits, Just Seamless Features. Our premium functions require an internet connection to provide real-time, high-speed processing."
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % paragraphs.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    console.log(window.location.hostname);


    try {
      if (!executeRecaptcha) throw new Error("reCAPTCHA is not ready");
      const token = await executeRecaptcha();
      if (!token) throw new Error("Failed to generate reCAPTCHA token");

      const payload = isLoginForm
        ? { email, password, recaptcha: token }
        : { username, email, password, recaptcha: token };

      const endpoint = isLoginForm ? "http://api.ido.vin:3001/login" : "http://api.ido.vin:3001/register";
      const response = await axios.post(endpoint, payload);

      setSuccess(true);
      console.log(`${isLoginForm ? "Login" : "Register"} successful:`, response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index) => setCurrentIndex(index);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4">
      <div className="h-[100px]">
        {/* Login/Register Toggle */}
        <div className="flex flex-inline items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setIsLoginForm(true)}
            className={`btn w-24 p-2 rounded-lg transition-colors ${isLoginForm ? "btn-primary" : "btn-primary/70"}`}>
            Login
          </button>
          <button
            onClick={() => setIsLoginForm(false)}
            className={`btn w-24 p-2 rounded-lg transition-colors ${!isLoginForm ? "btn-primary" : "btn-primary/70"}`}>
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mb-4">
          {!isLoginForm && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 w-64 rounded-lg bg-[#383A40] border-none focus:ring-0 focus:outline-none shadow-none"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 w-64 rounded-lg bg-[#383A40] border-none focus:ring-0 focus:outline-none shadow-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 w-64 rounded-lg bg-[#383A40] border-none focus:ring-0 focus:outline-none shadow-none"
            required
          />
          {!isLoginForm && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2 w-64 rounded-lg bg-[#383A40] border-none focus:ring-0 focus:outline-none shadow-none"
              required
            />
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{isLoginForm ? "Login successful!" : "Registration successful!"}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-64 p-2 btn btn-primary rounded-md hover:btn-primary/70 transition-colors">
            {loading ? "Processing..." : isLoginForm ? "Login" : "Register"}
          </button>
        </form>
      </div>

      {/* Slideshow */}
      <div className="relative w-full max-w-xl mx-auto bg-base-200 p-6 rounded-lg text-sm text-center">
        <p>{paragraphs[currentIndex]}</p>

        <div className="flex justify-center mt-4">
          {paragraphs.map((_, idx) => (
            <span
              key={idx}
              className={`h-3 w-3 mx-1 rounded-full cursor-pointer ${idx === currentIndex ? "bg-primary" : "bg-gray-400"}`}
              onClick={() => goToSlide(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Wrapper component that provides Recaptcha
function UserSettings() {
  return (
    <RecaptchaProvider>
      <UserSettingsContent />
    </RecaptchaProvider>
  );
}

export default UserSettings;
