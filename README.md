# Intelligent API Security Fabric - Hackathon Project

## Prerequisites

1.  **Node.js** (v18+)
2.  **OpenSSL** or **mkcert** for generating TLS certificates.
3.  **Circom & snarkjs** for the ZKP layer.
    ```bash
    npm install -g circom snarkjs
    ```

## Step 1: Generate TLS Certificates

Create the `certs` directory. Use `mkcert` (recommended) or `openssl` to create a local Certificate Authority (CA) and certificates for the server and two clients.

```bash
# Using mkcert
cd certs
mkcert -install
mkcert localhost # server-cert.pem & server-key.pem
mkcert client1.com # client1.com.pem & client1.com-key.pem
mkcert client2.com # client2.com.pem & client2.com-key.pem
```

## Step 2: Compile the ZKP Circuit

Navigate to the `zkp-circuits` directory and run these commands in order.

```bash
cd zkp-circuits

# 1. Compile the circuit
circom age_check.circom --r1cs --wasm

# 2. Start the trusted setup (powers of tau)
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# 3. Contribute to the ceremony (just once for this demo)
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# 4. Phase 2 setup
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup age_check.r1cs pot12_final.ptau age_check_0000.zkey

# 5. Create final zkey
snarkjs zkey contribute age_check_0000.zkey age_check_final.zkey --name="My Name" -v

# 6. Export verification key
snarkjs zkey export verificationkey age_check_final.zkey verification_key.json
```

## Step 3: Install & Run Services

Open three separate terminals for each service.

**Terminal 1: Gateway Service**
```bash
cd gateway-service
npm install
node gateway.js
```

**Terminal 2: ZKP Prover Service**
```bash
cd zkp-prover-service
npm install
node zkp_service.js
```

**Terminal 3: Frontend App**
```bash
cd frontend-app
npm install
npm run dev
```

Now, open your browser to the URL provided by the Vite dev server (e.g., `http://localhost:5173`).