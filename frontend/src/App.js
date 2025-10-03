import React, { useState } from "react";
import styles from "./App.module.css";
import Layer1Demo from "./components/Layer1Demo";
import Layer2Demo from "./components/Layer2Demo";
import Layer3Demo from "./components/Layer3Demo";
import { motion, AnimatePresence } from "framer-motion";
import { LockKeyhole } from "lucide-react";

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

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
    <div className={styles.appContainer}>
      <div className={styles.backgroundGrid} />

      <header className={styles.header}>
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className={styles.logo}
        >
          <LockKeyhole size={48} />
        </motion.div>
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className={styles.title}
        >
          Intelligent API Security Fabric
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className={styles.subtitle}
        >
          A Zero-Trust Demo for Modern Banking APIs
        </motion.p>
      </header>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className={styles.mainContent}
      >
        <div className={styles.tabContainer}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabButton} ${
                activeTab === tab ? styles.activeTab : ""
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className={styles.activeTabIndicator}
                />
              )}
            </button>
          ))}
        </div>
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}

export default App;
