import React, { createContext, useEffect, useState } from "react";

export const RecaptchaContext = createContext();

const RecaptchaProvider = ({ children }) => {
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        setRecaptchaReady(true);
      } else {
        console.error("reCAPTCHA failed to load");
      }
    };

    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=6Lc1uOIqAAAAAPh85Piq3M-huFU5ZeOhUsEs3nJq`;
      script.async = true;
      script.defer = true;
      script.onload = loadRecaptcha;
      document.body.appendChild(script);
    } else {
      loadRecaptcha();
    }
  }, []);

  const executeRecaptcha = async () => {
    if (!recaptchaReady) throw new Error("reCAPTCHA is not ready");

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute("6Lc1uOIqAAAAAPh85Piq3M-huFU5ZeOhUsEs3nJq", { action: "submit" })
          .then(resolve)
          .catch(reject);
      });
    });
  };

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha }}>
      {children}
    </RecaptchaContext.Provider>
  );
};

export default RecaptchaProvider;
