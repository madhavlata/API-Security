import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from "./Layer1Demo.module.css"; // Import the stylesheet

const Layer1Demo = () => {
  const [selectedCert, setSelectedCert] = useState("client1.com");
  const [token, setToken] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetToken = () => {
    setApiResponse(null);
    // Use the base name of the certificate for the placeholder token
    setToken(`jwt.token.bound.to.${selectedCert.split(" ")[0]}.placeholder`);
  };

  const handleApiCall = () => {
    setIsLoading(true);
    setApiResponse(null);
    // Simulation logic: Success if the token contains the currently selected cert's base name
    const isSuccess = token.includes(selectedCert.split(" ")[0]);
    setTimeout(() => {
      if (isSuccess) {
        setApiResponse({
          status: 200,
          data: { accountId: "123", balance: 12500.75 },
        });
      } else {
        setApiResponse({
          status: 401,
          data: { message: "Token-binding validation failed. Stolen token?" },
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Layer 1: Unphishable Identity</h2>
      <p className={styles.subheader}>mTLS + Certificate-Bound Tokens</p>

      <div className={styles.mainGrid}>
        {/* Controls */}
        <div className={styles.controls}>
          <div>
            <label className={styles.label}>
              Simulated Client Certificate:
            </label>
            <select
              value={selectedCert}
              onChange={(e) => {
                setSelectedCert(e.target.value);
                // Don't clear the token, so we can test the "stolen token" scenario
                setApiResponse(null);
              }}
              className={styles.select}
            >
              <option>client1.com</option>
              <option>client2.com (Attacker)</option>
            </select>
          </div>
          <button onClick={handleGetToken} className={styles.button}>
            1. Get Access Token (Bound to '{selectedCert.split(" ")[0]}')
          </button>
          <button
            onClick={handleApiCall}
            disabled={!token || isLoading}
            className={styles.buttonPrimary}
          >
            2. Call Protected API: /accounts/123
          </button>
          <p className={styles.explanation}>
            Test the "stolen token" scenario: Get a token as 'client1.com', then
            switch the certificate to 'client2.com' and try to call the API.
          </p>
        </div>

        {/* Response */}
        <div className={styles.responseBox}>
          <h3 className={styles.responseHeader}>Gateway Response:</h3>
          {isLoading && <p>Loading...</p>}
          {apiResponse && (
            <motion.pre
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${styles.pre} ${
                apiResponse.status === 200 ? styles.success : styles.error
              }`}
            >
              <span style={{ fontWeight: 700 }}>
                HTTP Status: {apiResponse.status}
              </span>
              <br />
              {JSON.stringify(apiResponse.data, null, 2)}
            </motion.pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layer1Demo;
