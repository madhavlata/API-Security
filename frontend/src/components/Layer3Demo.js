import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import * as snarkjs from "snarkjs";
import styles from "./Layer3Demo.module.css"; // Import the new CSS module

const zkpApi = axios.create({ baseURL: "http://localhost:3001" });

const Layer3Demo = () => {
  const [customerId, setCustomerId] = useState("1001");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [vKey, setVKey] = useState(null);

  useEffect(() => {
    const fetchVKey = async () => {
      try {
        const { data } = await zkpApi.get("/verification-key");
        setVKey(data);
      } catch (error) {
        console.error("Failed to fetch verification key", error);
        setResult({
          status: "error",
          message: "Could not load verification key from ZKP service.",
        });
      }
    };
    fetchVKey();
  }, []);

  const handleVerification = async () => {
    if (!vKey) {
      setResult({ status: "error", message: "Verification key not loaded." });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      const {
        data: { proof, publicSignals },
      } = await zkpApi.post("/generate-proof/is-over-18", { customerId });

      const isVerified = await snarkjs.groth16.verify(
        vKey,
        publicSignals,
        proof
      );

      if (isVerified) {
        const isOver18 = publicSignals[0] === "1";
        setResult({
          status: "success",
          message: isOver18
            ? "✅ Verification Successful: Customer is over 18."
            : "✅ Verification Successful: Customer is NOT over 18.",
          proofData: { proof, publicSignals },
        });
      } else {
        setResult({
          status: "error",
          message:
            "❌ Invalid Proof: The cryptographic proof could not be verified.",
        });
      }
    } catch (error) {
      console.error("Verification failed", error);
      setResult({
        status: "error",
        message: `API Error: ${error.response?.data?.error || error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Layer 3: Zero-Knowledge Privacy</h2>
      <p className={styles.subheader}>
        Fulfilling business needs without exposing sensitive data.
      </p>

      <div className={styles.mainGrid}>
        <div className={styles.controls}>
          <h3 className={styles.portalHeader}>Lender's Portal</h3>
          <p className={styles.explanation}>
            We need to verify if the customer is over 18 to approve a loan,
            without seeing their birthdate.
          </p>
          <div>
            <label className={styles.label}>Customer ID:</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={styles.select}
            >
              <option value="1001">1001 (Born 1990)</option>
              <option value="1002">1002 (Born 2015)</option>
            </select>
          </div>
          <button
            onClick={handleVerification}
            disabled={isLoading || !vKey}
            className={styles.buttonPrimary}
          >
            {isLoading ? "Verifying..." : "Verify Age > 18"}
          </button>
        </div>

        <div className={styles.responseBox}>
          <h3 className={styles.responseHeader}>Verification Result:</h3>
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p
                className={`${styles.resultMessage} ${
                  result.status === "success" ? styles.success : styles.error
                }`}
              >
                {result.message}
              </p>
              <p className={styles.highlight}>
                <span style={{ fontWeight: 700 }}>Highlight:</span> The
                customer's actual birth year was never sent to this application.
                We only received a verifiable cryptographic proof.
              </p>
              {result.proofData && (
                <details className={styles.details}>
                  <summary className={styles.summary}>
                    Show Cryptographic Proof
                  </summary>
                  <pre className={styles.pre}>
                    {JSON.stringify(result.proofData, null, 2)}
                  </pre>
                </details>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layer3Demo;
