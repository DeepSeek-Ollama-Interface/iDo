import React, { useContext, useState } from "react";
import axios from "axios";
import { RecaptchaContext } from "../../components/recaptchaProvider";

const UserSettings = () => {
  const { executeRecaptcha } = useContext(RecaptchaContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await executeRecaptcha(); // Get reCAPTCHA token
      if (!token) throw new Error("Failed to generate reCAPTCHA token");

      const response = await axios.post("/api/auth/login", { email, password, recaptcha: token });
      console.log("Login successful:", response.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default UserSettings;
