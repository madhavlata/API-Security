import React, { useState } from "react";
import { motion } from "framer-motion";

// In a real browser app, mTLS is handled by the browser/OS, not JS.
// We will simulate the CONCEPT here for the demo.
const Layer1Demo = () => {
  const [selectedCert, setSelectedCert] = useState("client1.com");
  const [token, setToken] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetToken = () => {
    setApiResponse(null);
    setToken(`jwt.token.bound.to.${selectedCert}.cert.placeholder`);
  };

  const handleApiCall = () => {
    setIsLoading(true);
    setApiResponse(null);
    // SIMULATION: If token is bound to Client1 cert, and we are using Client1 cert, it succeeds.
    const isSuccess = token.includes(selectedCert);
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
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-cyan-400 mb-1">
        Layer 1: Unphishable Identity
      </h2>
      <p className="text-gray-400 mb-6">mTLS + Certificate-Bound Tokens</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Simulated Client Certificate:
            </label>
            <select
              value={selectedCert}
              // This is the corrected line
              onChange={(e) => {
                setSelectedCert(e.target.value);
                setApiResponse(null);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            >
              <option>client1.com</option>
              <option>client2.com (Attacker)</option>
            </select>
          </div>
          <button
            onClick={handleGetToken}
            className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-md py-2 font-bold"
          >
            1. Get Access Token (Bound to '{selectedCert}')
          </button>
          <button
            onClick={handleApiCall}
            disabled={!token || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-md py-2 font-bold disabled:opacity-50"
          >
            2. Call Protected API: /accounts/123
          </button>
          <p className="text-xs text-gray-500 pt-2">
            This demo simulates the token binding check. If you get a token as
            'client1.com' and then try to use it as 'client2.com', the gateway
            rejects it, proving the token is useless if stolen.
          </p>
        </div>

        {/* Response */}
        <div className="bg-gray-900 rounded-md p-4 h-full">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            Gateway Response:
          </h3>
          {isLoading && <p>Loading...</p>}
          {apiResponse && (
            <motion.pre
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm whitespace-pre-wrap ${
                apiResponse.status === 200 ? "text-green-400" : "text-red-400"
              }`}
            >
              <span className="font-bold">
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
