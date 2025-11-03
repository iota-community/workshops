# IOTA Notarization Backend

A blockchain-based document notarization service built on IOTA that enables creating, managing, and verifying immutable or mutable digital records. Perfect for legal documents, certificates, and compliance records.

## Project Overview

This backend service provides REST APIs to notarize documents on the IOTA blockchain. Documents can be stored as either dynamic (mutable) or locked (immutable) notarizations with optional time-based access controls.

## Quick Start

### Prerequisites

- Node.js (v16+)
- npm or pnpm
- IOTA testnet/network wallet configured

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Configure environment
cp .env.example .env
```

### Environment Configuration

Create a `.env` file with these required variables:

```env
# IOTA Blockchain Configuration
IOTA_NOTARIZATION_PKG_ID=<your-deployed-package-id>
NETWORK_URL=https://api.testnet.iota.cafe

# Wallet Configuration - ED25519 private key (bech32 or base64)
PRIVATE_KEY=iotaprivkey1...

# Server Configuration
PORT=3001
```

**Key Details:**
- `IOTA_NOTARIZATION_PKG_ID`: Obtained from deploying the notarization smart contract on IOTA
- `PRIVATE_KEY`: Can be bech32 format (`iotaprivkey1...`) or base64. Generate a new wallet if needed
- `NETWORK_URL`: Points to IOTA testnet (funds available via faucet)

### Running the Server

```bash
# Development with auto-reload
npm run dev

# Production build and run
npm run build
npm start
```

Server starts at `http://localhost:3001`

## Project Structure

```
├── src/
│   ├── controllers/
│   │   └── notarizationController.ts    # HTTP request handlers
│   ├── services/
│   │   ├── notarizationService.ts       # Core business logic & blockchain operations
│   │   └── walletService.ts             # Wallet management & IOTA client
│   ├── utils/
│   │   └── crypto.ts                    # SHA-256 hashing utilities
│   ├── routes/
│   │   └── notarizationRoutes.ts        # API route definitions
│   └── server.ts                        # Express app initialization
├── package.json                         # Dependencies & scripts
└── tsconfig.json                        # TypeScript configuration
```

## File Responsibilities

### `notarizationController.ts`
**What:** HTTP request/response handler for all API endpoints  
**Why:** Separates HTTP concerns from business logic; validates input data before passing to services  
**Key Methods:**
- `createDynamic()` - Creates mutable notarizations
- `createLocked()` - Creates immutable notarizations
- `updateState()` / `updateMetadata()` - Updates dynamic notarizations
- `transferNotarization()` - Transfers ownership
- `destroyNotarization()` - Deletes notarization
- `verify()` - Verifies document integrity
- `healthCheck()` - System status

### `notarizationService.ts`
**What:** Core business logic for blockchain operations  
**Why:** Handles all IOTA blockchain interactions; manages notarization lifecycle  
**Key Methods:**
- `createDynamicNotarization()` - Creates mutable records with optional transfer locks
- `createLockedNotarization()` - Creates immutable records with optional delete locks
- `updateState()` - Changes content (dynamic only)
- `updateMetadata()` - Updates metadata independently
- `transferNotarization()` - Transfers to new owner (dynamic only)
- `destroyNotarization()` - Destroys notarization (unlocks storage)
- `getNotarizationDetails()` - Retrieves full record info
- `verifyNotarization()` - Confirms content integrity

### `walletService.ts`
**What:** Wallet and blockchain client management  
**Why:** Handles private key setup, IOTA client initialization, wallet balance checks  
**Key Responsibilities:**
- Loads/generates ED25519 keypair from environment
- Supports both bech32 and base64 private key formats
- Creates IOTA SDK client connected to testnet
- Manages wallet balance and faucet requests
- Provides signer for transaction signing

### `crypto.ts`
**What:** Cryptographic utilities  
**Why:** Computes SHA-256 hashes; validates hash format for blockchain operations  
**Key Methods:**
- `computeSHA256()` - Computes file/string hash
- `computeFileHash()` - Computes hash from file buffer
- `isValidSHA256Hash()` - Validates 64-character hex format

### `notarizationRoutes.ts`
**What:** Express route definitions  
**Why:** Maps HTTP methods and paths to controller methods; handles multipart file uploads  
**Routes:**
- `POST /hash` - File hashing (multipart)
- `POST /dynamic` - Create dynamic notarization
- `POST /locked` - Create locked notarization
- `PUT /:id/state` - Update state
- `PUT /:id/metadata` - Update metadata
- `POST /:id/transfer` - Transfer ownership
- `DELETE /:id` - Destroy notarization
- `GET /:id` - Retrieve details
- `POST /verify` - Verify content
- `GET /health` - Health check
- `GET /wallet/info` - Wallet info

### `server.ts`
**What:** Express application setup and initialization  
**Why:** Bootstraps the API server; configures middleware and error handling  
**Responsibilities:**
- Initializes Express app
- Enables CORS and JSON parsing
- Registers routes
- Implements error and 404 handlers
- Starts server on configured port

### `package.json`
**What:** Project metadata and dependencies  
**Why:** Defines build scripts and required packages  
**Key Scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server

## API Workflow

### Complete Flow Example

1. **Hash Document**
   ```
   POST /api/notarizations/hash
   Upload file → Get SHA-256 hash
   ```

2. **Create Notarization**
   ```
   POST /api/notarizations/dynamic
   Send hash + metadata → Blockchain stores → Returns notarization ID
   ```

3. **Manage Document**
   ```
   PUT /api/notarizations/:id/state
   Update content/metadata (dynamic only)
   ```

4. **Verify Integrity**
   ```
   POST /api/notarizations/verify
   Send ID + expected hash → Confirms match
   ```

5. **Transfer or Destroy**
   ```
   POST /api/notarizations/:id/transfer (dynamic only)
   DELETE /api/notarizations/:id (when unlocked)
   ```

## Notarization Types

**Dynamic Notarizations:**
- Mutable - content and metadata can be updated
- Transferable (unless locked)
- Tracks version history
- Use for evolving documents

**Locked Notarizations:**
- Immutable - cannot be modified or transferred
- Permanent blockchain record
- Optional delete lock prevents destruction
- Use for finalized legal documents

## Authentication

Wallet-based authentication via private key. All blockchain transactions are cryptographically signed by the wallet configured in the `.env` file. No user/password authentication required.

## Error Handling

The API returns standardized JSON responses:

```json
{
  "success": true/false,
  "error": "Error message if applicable",
  "data": "Response payload"
}
```

Common errors are documented in the API docs. Check HTTP status codes (400 for validation, 500 for blockchain errors).

## Testing

Use Postman to test all endpoints. Complete request/response examples are provided in `api-docs.md`.

1. Start server: `npm run dev`
2. Health check: `GET http://localhost:3001/api/notarizations/health`
3. Use Postman collection (examples in documentation)

## Security Notes

- **Private Key**: Store securely, never commit `.env` to version control
- **SHA-256**: Hashing is cryptographically secure; collisions are mathematically impossible
- **Locked Records**: Immutable by design - provides strong audit trail
- **Blockchain**: All transactions are recorded on IOTA distributed ledger

## Support

- Full API documentation: See `./Api-docs.md`
- Health endpoint: `GET http://localhost:3001/api/notarizations/health`
- IOTA docs: https://docs.iota.org/developer/iota-notarization/
