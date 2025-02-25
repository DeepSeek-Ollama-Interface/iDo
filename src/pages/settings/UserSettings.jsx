import { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

function UserSettings() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const paragraphs = [
    "Quality Over Free – A Premium Experience for Everyone We believe in providing top-tier service without compromise, which is why we don’t offer free accounts. ",
    "Your Privacy, Protected by European Standards Your personal data is in safe hands—we strictly follow the European GDPR, the gold standard in data protection. No matter where you are in the world",
    "Online-Powered Performance – No Limits, Just Seamless Features To bring you cutting-edge features without restrictions, our premium functions require an internet connection—not for payment verification, but to provide real-time, high-speed processing that works effortlessly on any device."
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % paragraphs.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoginForm && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // reCAPTCHA verification
    if (!recaptchaToken) {
      alert("Please verify reCAPTCHA.");
      return;
    }

    const userData = { username, password, recaptchaToken };

    try {
      const endpoint = isLoginForm ? "/login" : "/register";
      const response = await axios.post(`http://your-api-url${endpoint}`, userData);
      console.log("API Response:", response.data);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
    }
  };

  const goToSlide = (index) => setCurrentIndex(index);

  const handleRecaptcha = (token) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4">
      <div className="h-[100px]">
        <div className="flex flex-inline items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setIsLoginForm(true)}
            className={`btn w-24 p-2 rounded-lg transition-colors ${isLoginForm ? 'btn-primary' : 'btn-primary/70'}`}>
            Login
          </button>
          <button
            onClick={() => setIsLoginForm(false)}
            className={`btn w-24 p-2 rounded-lg transition-colors ${!isLoginForm ? 'btn-primary' : 'btn-primary/70'}`}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <button type="submit" className="w-64 p-2 btn btn-primary rounded-md hover:btn-primary/70 transition-colors">
            {isLoginForm ? 'Login' : 'Register'}
          </button>
        </form>
      </div>

      {/* Google reCAPTCHA */}
      <ReCAPTCHA
        sitekey="6LdxA-IqAAAAAL-zX5WXpfZEgiBEkNRjUGMH24Ar"
        onChange={handleRecaptcha}
      />

      <div className="relative w-full max-w-xl mx-auto bg-base-200 p-6 rounded-lg text-sm text-center">
        <p>{paragraphs[currentIndex]}</p>

        <div className="flex justify-center mt-4">
          {paragraphs.map((_, idx) => (
            <span
              key={idx}
              className={`h-3 w-3 mx-1 rounded-full cursor-pointer ${
                idx === currentIndex ? "bg-primary" : "bg-gray-400"
              }`}
              onClick={() => goToSlide(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
