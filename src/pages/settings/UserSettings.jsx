import { useState, useEffect } from "react";

function UserSettings() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const paragraphs = [
    "Quality Over Free – A Premium Experience for Everyone We believe in providing top-tier service without compromise, which is why we don’t offer free accounts. Every paid subscription directly supports our platform, ensuring unmatched quality, stability, and fairness for all users. At just a small cost—even as low as $1—you gain access to a premium experience where every feature is optimized for your benefit. We’re committed to delivering the best, and your support allows us to maintain a high-performance, ad-free environment that truly values its users.",
    "Your Privacy, Protected by European Standards Your personal data is in safe hands—we strictly follow the European GDPR, the gold standard in data protection. No matter where you are in the world, our transparent and secure policies ensure that your information remains private and fully protected. We don’t just comply with GDPR; we embrace it because we believe privacy is a fundamental right. You can use our services with complete peace of mind, knowing your data is handled with the highest level of security.",
    "Online-Powered Performance – No Limits, Just Seamless Features To bring you cutting-edge features without restrictions, our premium functions require an internet connection—not for payment verification, but to provide real-time, high-speed processing that works effortlessly on any device. Instead of limiting functionality, we’ve designed an intelligent, cloud-powered system that enhances performance, compatibility, and ease of use. This means you get a smooth, optimized experience wherever you go—without technical headaches."
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % paragraphs.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoginForm && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log(`${isLoginForm ? 'Login' : 'Register'} with`, { username, password });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4">
      <div className="flex flex-inline items-center justify-center gap-4 mb-4">
        <button 
          onClick={() => setIsLoginForm(true)} 
          className={`btn w-24 p-2 rounded-lg transition-colors rounded-md ${isLoginForm ? 'btn-primary' : 'btn-primary/70'}`}>
          Login
        </button>
        <button 
          onClick={() => setIsLoginForm(false)} 
          className={`btn w-24 p-2 rounded-lg transition-colors rounded-md ${!isLoginForm ? 'btn-primary' : 'btn-primary/70'}`}>
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

      <div className="h-auto w-full flex items-center justify-center text-left text-sm text-center">
        <p>{paragraphs[currentIndex]}</p>
      </div>
    </div>
  );
}

export default UserSettings;
