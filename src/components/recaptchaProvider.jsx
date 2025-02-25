import React, { createContext, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";

export const RecaptchaContext = createContext(null);

const RecaptchaProvider = ({ children, siteKey }) => {
  const [token, setToken] = useState(null);

  // Load reCAPTCHA script dynamically
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://www.google.com/recaptcha/api.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Function to execute reCAPTCHA and get token
  const executeRecaptcha = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject("reCAPTCHA not loaded");
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action: "submit" }).then(resolve).catch(reject);
      });
    });
  }, [siteKey]);

  return (
    <RecaptchaContext.Provider value={{ token, setToken, executeRecaptcha }}>
      {children}
    </RecaptchaContext.Provider>
  );
};

RecaptchaProvider.propTypes = {
  children: PropTypes.node.isRequired,
  siteKey: PropTypes.string.isRequired,
};

export default RecaptchaProvider;
