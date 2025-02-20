import { useState, useEffect } from "react";

function UserSettings() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const paragraphs = [
    "Quality Over Free – A Premium Experience for Everyone We believe in providing top-tier service without compromise, which is why we don’t offer free accounts. Every paid subscription directly supports our platform, ensuring unmatched quality, stability, and fairness for all users. At just a small cost—even as low as $1—you gain access to a premium experience where every feature is optimized for your benefit. We’re committed to delivering the best, and your support allows us to maintain a high-performance, ad-free environment that truly values its users.",
    "Your Privacy, Protected by European Standards Your personal data is in safe hands—we strictly follow the European GDPR, the gold standard in data protection. No matter where you are in the world, our transparent and secure policies ensure that your information remains private and fully protected. We don’t just comply with GDPR; we embrace it because we believe privacy is a fundamental right. You can use our services with complete peace of mind, knowing your data is handled with the highest level of security.",
    "Online-Powered Performance – No Limits, Just Seamless Features To bring you cutting-edge features without restrictions, our premium functions require an internet connection—not for payment verification, but to provide real-time, high-speed processing that works effortlessly on any device. Instead of limiting functionality, we’ve designed an intelligent, cloud-powered system that enhances performance, compatibility, and ease of use. This means you get a smooth, optimized experience wherever you go—without technical headaches."
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % paragraphs.length);
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4">

      <div className="flex flex-inline items-center justify-center gap-4">
        <button className="btn btn-primary w-24 p-2 rounded-lg hover:bg-blue-600 transition-colors">
          Login
        </button>
        <button className="btn btn-primary w-24 p-2 rounded-lg hover:bg-blue-600 transition-colors">
          Register
        </button>
      </div>

      <div className="h-auto w-full flex items-center justify-center text-sm text-center">
        <p>{paragraphs[currentIndex]}</p>
      </div>

    </div>
  );
}

export default UserSettings;
