# IOTA Identity Workshop: Native Rust + React

This repository contains the code for the "IOTA Identity Guided Codelab Workshop," a hands-on tutorial for building a full-stack University Degree Verification system using IOTA Identity, Native Rust (with Axum), and React. You'll learn to create DIDs, issue Verifiable Credentials (VCs), package them into Verifiable Presentations (VPs), and verify them on the IOTA network.

The workshop simulates a real-world scenario where a university (Issuer) issues a tamper-proof degree credential to a student (Holder), who presents it to an employer (Verifier) for instant validation—without intermediaries.

## Features

- **Native Rust Backend**: Uses IOTA Identity SDK for secure DID management, VC issuance, VP signing, and verification.
- **React Frontend**: Interactive UI with step-by-step workflow, state management, and error handling.
- **End-to-End Flow**: Demonstrates the complete IOTA Identity lifecycle (DID Creation → VC Issuance → VP Presentation → Verification).
- **Secure & Production-Ready**: Integrates Stronghold for key storage, JWT signing, and network resolution.
- **Cross-Platform**: Works on macOS, Windows, and Linux.

## Prerequisites

Before starting, ensure you have:

- **Rust & Cargo**: Latest stable version ([Install Guide](https://www.rust-lang.org/tools/install)).
- **Node.js & npm**: Version 18+ ([Install Guide](https://nodejs.org)).
- **Visual Studio Code** (recommended editor): With extensions like Rust Analyzer and ESLint ([Install Guide](https://code.visualstudio.com/download)).
- **Environment Variable**: Set `IOTA_IDENTITY_PKG_ID` to a unique identifier for your workshop session (e.g., `workshop-123`).

## Project Structure

iota-identity-workshop/ ├── iota-identity-backend/ # Rust Axum backend │ ├── Cargo.toml # Dependencies (identity_iota, axum, etc.) │ ├── crates/identity_logic/ # Helper functions (get_stronghold_storage, etc.) │ └── src/main.rs # API endpoints for DID/VC/VP/Verification └── iota-identity-frontend/ # React Vite frontend ├── package.json # Dependencies (lucide-react, etc.) └── src/App.jsx # Interactive workflow UI


## How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/iota-identity-workshop.git
cd iota-identity-workshop
```

### 2. Set Up the Backend (Rust)

Navigate to the backend directory:

```bash
cd iota-identity-backend
```

Install dependencies:

```bash
cargo build
```

Set the environment variable:

macOS/Linux:
```bash
export IOTA_IDENTITY_PKG_ID="workshop-123"
```

Windows (Command Prompt):

```bash
set IOTA_IDENTITY_PKG_ID=workshop-123
```

Windows (PowerShell):

```bash
$env:IOTA_IDENTITY_PKG_ID="workshop-123"
```

Run the backend server:

```bash
cargo run
```

The server starts at http://localhost:3001.

Keep this terminal open.

### 3. Set Up the Frontend (React)

Open a new terminal and navigate to the frontend directory:

```bash
cd ../iota-identity-frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The app starts at http://localhost:5173 (or the port shown in the terminal).

Open this URL in your browser.

### 4. Run the Workshop

In your browser, open http://localhost:5173.

In the settings section, enter:

IOTA Package ID:

API Base URL: http://localhost:3001/api.

Follow the interactive steps:

Step 1: Create Holder DID.

Step 2: Issue VC (degree credential).

Step 3: Create VP (signed presentation).

Step 4: Validate VP (verifier checks authenticity).

Check the console outputs in both the browser and backend terminal for logs and errors.

Troubleshooting

Cargo Build Fails: Update Rust (rustup update stable) and verify Cargo.toml dependencies (e.g., identity_iota = { git = "https://github.com/iotaledger/identity.rs", tag = "v0.8.0" }).

Frontend Connection Issues: Ensure the backend is running on port 3001 and CORS is enabled in main.rs.

Environment Variable Not Set: Double-check IOTA_IDENTITY_PKG_ID is set before running the backend.

Port Conflicts: If port 3001 or 5173 is in use, change the port in main.rs (backend) or vite.config.js (frontend).

Windows Users: Use Command Prompt or PowerShell; replace forward slashes (/) with backslashes (\) in paths if needed.

For detailed guidance, refer to the Workshop Documentation.

Dependencies

Backend (Cargo.toml)

Key dependencies:

axum = "0.6" – Web framework.

identity_iota = { git = "https://github.com/iotaledger/identity.rs", tag = "v0.8.0" } – IOTA Identity SDK.

identity_eddsa_verifier = "0.8" – Signature verification.

identity_storage = { version = "0.8", features = ["stronghold"] } – Key storage.

tokio = { version = "1.0", features = ["full"] } – Async runtime.

See iota-identity-backend/Cargo.toml for the full list.

Frontend (package.json)

react = "^18.2.0" – UI library.

lucide-react = "^0.263.0" – Icons.

vite = "^4.0" – Build tool.

See iota-identity-frontend/package.json for details.

Contributing

Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/AmazingFeature).
Commit your changes (git commit -m 'Add some AmazingFeature').
Push to the branch (git push origin feature/AmazingFeature).
Open a Pull Request.

License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

Acknowledgments
IOTA Foundation.
Rust Community and React Team for foundational tools.
Workshop inspired by IOTA Identity examples.

⭐ If this repo helped you, star it on GitHub! 🚀

For questions, open an issue or join the IOTA Discord.

