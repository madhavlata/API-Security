import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, Cpu } from "lucide-react";
import styles from "./Layer2Demo.module.css";

const attackLogs = [
  "POST /payments/1' OR '1'='1 -> 400",
  "GET /users/../../etc/passwd -> 404",
  "GET /internal/config.json.bak -> 404",
  "POST /transfer/amount=-999 -> 400",
  "GET /api/v1/auth/debug -> 403",
];

const Layer2Demo = () => {
  const [status, setStatus] = useState("nominal"); // 'nominal', 'attack', 'blocked'
  const [logs, setLogs] = useState([]);
  const [key, setKey] = useState(0);

  const addLog = (message, type) => {
    setLogs((prev) => [
      { message, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4),
    ]);
  };

  useEffect(() => {
    let attackInterval, normalInterval;
    if (status === "attack") {
      addLog("Fuzzing attack detected!", "alert");
      attackInterval = setInterval(() => {
        const randomLog =
          attackLogs[Math.floor(Math.random() * attackLogs.length)];
        addLog(randomLog, "attack");
      }, 300);
      const blockTimeout = setTimeout(() => setStatus("blocked"), 2500);
      return () => {
        clearInterval(attackInterval);
        clearTimeout(blockTimeout);
      };
    }
    if (status === "blocked") {
      addLog("Threat mitigated. Shield active.", "shield");
      const nominalTimeout = setTimeout(() => {
        setStatus("nominal");
        setKey((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(nominalTimeout);
    }
    addLog("GET /accounts/123 -> 200 OK", "nominal");
    normalInterval = setInterval(
      () => addLog("GET /accounts/123 -> 200 OK", "nominal"),
      3000
    );
    return () => clearInterval(normalInterval);
  }, [status]);

  const orbVariants = {
    nominal: {
      scale: 1,
      boxShadow: "0 0 30px #0ea5e9, 0 0 60px #0ea5e9",
      backgroundColor: "#0ea5e9",
    },
    attack: {
      scale: 1.1,
      boxShadow: "0 0 40px #ef4444, 0 0 80px #ef4444",
      backgroundColor: "#ef4444",
    },
    blocked: {
      scale: 1,
      boxShadow: "0 0 30px #0ea5e9, 0 0 60px #0ea5e9",
      backgroundColor: "#0ea5e9",
    },
  };

  const getStatusClass = () => {
    if (status === "attack") return styles.statusAttack;
    if (status === "blocked") return styles.statusBlocked;
    return styles.statusNominal;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Layer 2: Proactive Shield</h2>
      <p className={styles.subheader}>
        AI-Driven Behavioral Analysis & Threat Mitigation
      </p>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <div>
            <h3 className={styles.logsHeader} style={{ marginBottom: "1rem" }}>
              System Status
            </h3>
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={styles.statusBox}
              >
                {status === "nominal" && (
                  <Cpu className={styles.statusNominal} size={32} />
                )}
                {status === "attack" && (
                  <AlertTriangle
                    className={styles.statusAttack}
                    style={{ animation: "pulse 1s infinite" }}
                    size={32}
                  />
                )}
                {status === "blocked" && (
                  <ShieldCheck className={styles.statusBlocked} size={32} />
                )}
                <span className={`${styles.statusText} ${getStatusClass()}`}>
                  {status.toUpperCase()}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.logsContainer}>
            <h3 className={styles.logsHeader}>Live Gateway Logs:</h3>
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.time + log.message}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={styles.logEntry}
                >
                  <span
                    className={`${styles.logTime} ${
                      log.type === "attack" && styles.logTimeAttack
                    }`}
                  >
                    {log.time}
                  </span>
                  <span
                    className={`${styles.logMessage} ${
                      log.type === "attack" && styles.logMessageAttack
                    }`}
                  >
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setStatus("attack")}
            className={styles.simulateButton}
            disabled={status !== "nominal"}
          >
            Simulate Fuzzing Attack
          </button>
        </div>

        <div key={key} className={styles.rightColumn}>
          <motion.div
            className={styles.orb}
            variants={orbVariants}
            animate={status}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <AnimatePresence>
              {status === "blocked" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className={styles.shield}
                >
                  <ShieldCheck size={80} style={{ color: "#bae6fd" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {status === "attack" &&
            Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className={styles.particleAttack}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 1 + 0.5,
                  repeat: Infinity,
                }}
              />
            ))}
          {status === "nominal" &&
            Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className={styles.particleNormal}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: Math.random() * 5 + 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Layer2Demo;
