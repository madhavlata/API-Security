const express = require("express");
const { groth16 } = require("snarkjs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const customerData = { 1001: { birthYear: 1990 }, 1002: { birthYear: 2015 } };
const circuitsPath = path.join(__dirname, "../zkp-circuits/");

app.post("/generate-proof/is-over-18", async (req, res) => {
  try {
    const { customerId } = req.body;
    const customer = customerData[customerId];
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const input = {
      birthYear: customer.birthYear,
      currentYear: new Date().getFullYear(),
    };

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      path.join(circuitsPath, "age_check_js", "age_check.wasm"),
      path.join(circuitsPath, "age_check_final.zkey")
    );
    res.json({ proof, publicSignals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Proof generation failed" });
  }
});

app.get("/verification-key", (req, res) => {
  res.sendFile(path.join(circuitsPath, "verification_key.json"));
});

app.listen(3001, () =>
  console.log("ZKP Prover Service running on http://localhost:3001")
);
