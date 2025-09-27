import React, { useState } from "react";
import "./App.css";
import Layer1Demo from "./components/Layer1Demo";
import Layer2Demo from "./components/Layer2Demo";
import Layer3Demo from "./components/Layer3Demo";
import { motion } from "framer-motion";

function App() {
  const [activeTab, setActiveTab] = useState("Layer 1");

  const tabs = ["Layer 1", "Layer 2", "Layer 3"];

  const renderContent = () => {
    switch (activeTab) {
      case "Layer 1":
        return <Layer1Demo />;
      case "Layer 2":
        return <Layer2Demo />;
      case "Layer 3":
        return <Layer3Demo />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold text-cyan-400 tracking-tight">
          Intelligent API Security Fabric
        </h1>
        <p className="text-gray-400 mt-2">
          A Zero-Trust Demo for Modern Banking APIs
        </p>
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center border-b border-gray-700 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab ? "text-cyan-400" : "text-gray-500"
              } relative py-4 px-6 text-lg font-medium focus:outline-none transition-colors`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400"
                />
              )}
              {tab}
            </button>
          ))}
        </div>
        <main>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;
