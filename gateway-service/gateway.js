const https = require("https");
const fs = require("fs");
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- mTLS Server Setup ---
const options = {
  key: fs.readFileSync("../certs/localhost-key.pem"),
  cert: fs.readFileSync("../certs/localhost.pem"),
  ca: fs.readFileSync("../certs/rootCA.pem"),
  requestCert: true,
  rejectUnauthorized: false, // Set to false for demo to analyze failure cases
};

// --- Layer 2: Behavioral Analysis Setup ---
let requestCounts = {};
let profiles = { "client1.com": { baseline_rps: 5 } }; // Default profile
let blockedClients = new Set();

setInterval(() => {
  requestCounts = {};
}, 1000); // Reset counts every second
setInterval(() => {
  blockedClients.clear();
}, 30000); // Unblock clients every 30s

const behavioralAnalysis = (req, res, next) => {
  const clientID = req.socket.getPeerCertificate().subject.CN;
  if (blockedClients.has(clientID)) {
    return res.status(429).json({
      message: "Client is temporarily blocked due to unusual activity.",
    });
  }

  requestCounts[clientID] = (requestCounts[clientID] || 0) + 1;
  const clientProfile = profiles[clientID];

  if (
    clientProfile &&
    requestCounts[clientID] > clientProfile.baseline_rps * 2
  ) {
    // 2x threshold
    blockedClients.add(clientID);
    console.log(`ATTACK DETECTED: Blocking client ${clientID}`);
    return res
      .status(429)
      .json({ message: "Unusual activity detected. Client blocked." });
  }
  next();
};

// --- Layer 1: Token Binding Middleware ---
const verifyTokenBinding = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).send("No token provided.");
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "HACKATHON_SECRET");
    const clientCert = req.socket.getPeerCertificate();

    if (!decoded.cnf || !clientCert.raw) {
      return res.status(401).send("Token or certificate invalid for binding.");
    }

    const certHash = crypto
      .createHash("sha256")
      .update(clientCert.raw)
      .digest("base64url");
    if (certHash !== decoded.cnf["x5t#S256"]) {
      return res
        .status(401)
        .send("Token-binding validation failed. Stolen token?");
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid Token", error: err.message });
  }
};

// --- Endpoints ---
app.post("/oauth/token", (req, res) => {
  const clientCert = req.socket.getPeerCertificate();
  if (!clientCert || !clientCert.subject) {
    return res.status(400).send("Valid client certificate required.");
  }
  const certHash = crypto
    .createHash("sha256")
    .update(clientCert.raw)
    .digest("base64url");
  const payload = {
    sub: clientCert.subject.CN,
    iss: "my-bank",
    cnf: { "x5t#S256": certHash },
  };
  const token = jwt.sign(payload, "HACKATHON_SECRET", { expiresIn: "1h" });
  res.json({ access_token: token });
});

// Protected Endpoint
app.get("/accounts/:id", behavioralAnalysis, verifyTokenBinding, (req, res) => {
  const logEntry = `${new Date().toISOString()},${req.user.sub},${req.path}\n`;
  fs.appendFileSync("api_logs.csv", logEntry);
  res.json({ accountId: req.params.id, balance: 12500.75, currency: "USD" });
});

https.createServer(options, app).listen(8443, () => {
  console.log("Intelligent API Gateway running on https://localhost:8443");
});
