import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import * as snarkjs from "snarkjs";

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

      // Step 1: Verify the proof is cryptographically valid
      const isVerified = await snarkjs.groth16.verify(
        vKey,
        publicSignals,
        proof
      );

      if (isVerified) {
        // --- THIS IS THE CRUCIAL FIX ---
        // Step 2: Check the actual result from the public output signal
        const isOver18 = publicSignals[0] === "1";

        setResult({
          status: "success",
          // Step 3: Display the correct message based on the result
          message: isOver18
            ? "✅ Verification Successful: Customer is over 18."
            : "✅ Verification Successful: Customer is NOT over 18.",
          proofData: { proof, publicSignals },
        });
        // --- END OF FIX ---
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
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-cyan-400 mb-1">
        Layer 3: Zero-Knowledge Privacy
      </h2>
      <p className="text-gray-400 mb-6">
        Fulfilling business needs without exposing sensitive data.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 bg-gray-900/50 p-6 rounded-md">
          <h3 className="text-lg font-semibold">Lender's Portal</h3>
          <p className="text-sm text-gray-400">
            We need to verify if the customer is over 18 to approve a loan,
            without seeing their birthdate.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer ID:
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            >
              <option value="1001">1001 (Born 1990)</option>
              <option value="1002">1002 (Born 2015)</option>
            </select>
          </div>
          <button
            onClick={handleVerification}
            disabled={isLoading || !vKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-md py-3 font-bold text-lg disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Age > 18"}
          </button>
        </div>

        <div className="bg-gray-900 rounded-md p-4 min-h-[200px]">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            Verification Result:
          </h3>
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p
                className={`text-xl font-bold mb-4 ${
                  result.status === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {result.message}
              </p>
              <p className="text-sm text-gray-500 font-mono">
                <span className="font-bold text-gray-400">Highlight:</span> The
                customer's actual birth year was never sent to this application.
                We only received a verifiable cryptographic proof.
              </p>
              {result.proofData && (
                <details className="mt-4">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Show Cryptographic Proof
                  </summary>
                  <pre className="text-xs bg-gray-800 p-2 rounded mt-2 whitespace-pre-wrap break-all">
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
