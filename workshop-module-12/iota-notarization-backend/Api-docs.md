# IOTA Notarization API Documentation

Complete API reference for the IOTA Notarization Backend service. This documentation covers all endpoints, request/response formats, error handling, and practical examples using Postman.

## Quick Links

- [Authentication](#authentication)
- [Base URL & Headers](#base-url--headers)
- [Error Handling](#error-handling)
- [System Endpoints](#system-endpoints)
- [File Operations](#file-operations)
- [Dynamic Notarization](#dynamic-notarization)
- [Locked Notarization](#locked-notarization)
- [Query & Verification](#query--verification)
- [Postman Examples](#postman-examples)
- [Complete Workflow Examples](#complete-workflow-examples)

---

## Authentication

The API uses wallet-based authentication through a configured private key. All blockchain operations are cryptographically signed by the wallet associated with your service instance.

### Setup Requirements

1. **Private Key**: Set `PRIVATE_KEY` in your `.env` file
2. **Network Access**: Ensure connectivity to IOTA testnet/devnet
3. **Funds**: Wallet must have sufficient IOTA tokens for gas fees
4. **Package ID**: Set `IOTA_NOTARIZATION_PKG_ID` for your deployed notarization package

### Key Formats Supported

- **Bech32**: `iotaprivkey1...` (recommended)
- **Base64**: 32-byte raw private key (development only)

---

## Base URL & Headers

### Base URL

```
http://localhost:3001/api/notarizations
```

### Standard Headers

```
Content-Type: application/json
```

### Multipart Headers (File Upload)

```
Content-Type: multipart/form-data
```

---

### Common Error Scenarios

| Scenario | Error Message | HTTP Status |
|----------|--------------|------------|
| Invalid SHA-256 hash | "content must be a valid SHA-256 hash (64 hex characters)" | 400 |
| Notarization not found | Error from blockchain | 500 |
| Update locked notarization | "Cannot update state of a locked notarization - it is immutable" | 500 |
| Transfer locked notarization | "Cannot transfer a locked notarization - it is non-transferable" | 500 |
| Destroy with active lock | "Cannot destroy notarization - it may be locked or have active delete locks" | 500 |
| Missing required fields | "[field] is required" | 400 |
| Insufficient wallet balance | Network/blockchain error | 500 |

---

## System Endpoints

### Health Check

**Endpoint**: `GET /health`

**Description**: Check service status, wallet connectivity, and network configuration.

**Parameters**: None

**Response**:

```json
{
  "success": true,
  "message": "IOTA Notarization Backend is healthy",
  "timestamp": "2025-10-13T06:53:48.161Z",
  "network": "testnet",
  "packageId": "0xc953...",
  "wallet": {
    "address": "0x8fa9...",
    "balance": "5687....",
    "hasPrivateKey": true
  }
}
```

### Wallet Information

**Endpoint**: `GET /wallet/info`

**Description**: Get detailed wallet information and balance.

**Parameters**: None

**Response**:

```json
{
  "success": true,
  "address": "0x8fa...",
  "balance": "568....",
  "network": "testnet",
  "hasPrivateKey": true
}
```

---

## File Operations

### Generate File Hash

**Endpoint**: `POST /hash`

**Description**: Compute SHA-256 hash of uploaded file. This hash can be used for notarization.

**Headers**:

```
Content-Type: multipart/form-data
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | File | Yes | The file to hash (max 10MB) |

**Response**:

```json
{
  "success": true,
  "hash": "96a544...",
  "algorithm": "sha256"
}
```

---

## Dynamic Notarization

Dynamic notarizations are mutable and support updates, transfers, and version tracking.

### Create Dynamic Notarization

**Endpoint**: `POST /dynamic`

**Description**: Create a mutable notarization that can be updated and transferred.

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "content": "96a5...",
  "metadata": "Document Version 1.0 - Initial draft",
  "description": "Legal contract for partnership agreement",
  "transferLock": {
    "unlockAt": 1760405520
  }
}
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| content | string | Yes | SHA-256 hash (64 hex characters) |
| metadata | string | No | State metadata describing the content |
| description | string | No | Immutable description set at creation |
| transferLock | object | No | Transfer restrictions |
| transferLock.unlockAt | number | No | Unix timestamp when transfers become allowed |
| transferLock.untilDestroyed | boolean | No | Permanent transfer lock |

**Response**:

```json
{
  "success": true,
  "notarizationId": "15b2...",
  "transactionDigest": "HSJ5X...",
  "type": "dynamic",
  "timestamp": "2025-10-13T07:02:40.954Z"
}
```

**Important Notes**:

- content must be a valid SHA-256 hash
- transferLock.unlockAt must be a future Unix timestamp
- description cannot be changed after creation

### Update State

**Endpoint**: `PUT /:notarizationId/state`

**Description**: Update the state content and metadata of a dynamic notarization.

**Headers**:

```
Content-Type: application/json
```

**Path Parameters**:

| Name | Type | Description |
|------|------|-------------|
| notarizationId | string | The notarization ID to update |

**Request Body**:

```json
{
  "content": "f1e2d3...",
  "metadata": "Document Version 2.0 - Revised terms"
}
```

**Response**:

```json
{
  "success": true,
  "notarizationId": "15b21...",
  "transactionDigest": "AfMGEFM...",
  "timestamp": "2025-10-13T08:00:44.160Z"
}
```

**Behavior**:

- Increments versionCount by 1
- Updates lastStateChangeAt timestamp
- Overwrites previous state completely
- Only works on dynamic notarizations

### Update Metadata

**Endpoint**: `PUT /:notarizationId/metadata`

**Description**: Update the updatable metadata of a dynamic notarization without affecting the state.

**Headers**:

```
Content-Type: application/json
```

**Path Parameters**:

| Name | Type | Description |
|------|------|-------------|
| notarizationId | string | The notarization ID |

**Request Body**:

```json
{
  "metadata": "Under legal review - Status: Pending approval"
}
```

**Response**:

```json
{
  "success": true,
  "notarizationId": "15b21de...",
  "transactionDigest": "Dvem7s...",
  "timestamp": "2025-10-13T08:03:32.628Z"
}
```

**Important**:

- Does not increment versionCount
- Does not affect state content
- Can be updated independently of state changes

### Transfer Ownership

**Endpoint**: `POST /:notarizationId/transfer`

**Description**: Transfer a dynamic notarization to another wallet address.

**Headers**:

```
Content-Type: application/json
```

**Path Parameters**:

| Name | Type | Description |
|------|------|-------------|
| notarizationId | string | The notarization ID to transfer |

**Request Body**:

```json
{
  "recipientAddress": "0xa4ed..."
}
```

**Response**:

```json
{
  "success": true,
  "notarizationId": "d6ce70...",
  "recipientAddress": "0xa4ed88...",
  "transactionDigest": "4vcoEj...",
  "timestamp": "2025-10-13T08:22:47.427Z"
}
```

**Restrictions**:

- Only works on dynamic notarizations
- Fails if transferLock is active
- Requires valid recipient address format
- You must own the notarization to transfer it

---

## Locked Notarization

Locked notarizations are immutable. Once created, they cannot be modified or transferred.

### Create Locked Notarization

**Endpoint**: `POST /locked`

**Description**: Create an immutable notarization for permanent records.

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "content": "b2c3d4e5f6a...",
  "metadata": "Final signed contract",
  "description": "Executed partnership agreement - Immutable record",
  "deleteLock": {
    "unlockAt": 1893456000
  }
}
```

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| content | string | Yes | SHA-256 hash (64 hex characters) |
| metadata | string | No | State metadata |
| description | string | No | Immutable description |
| deleteLock | object | No | Deletion restrictions |
| deleteLock.unlockAt | number | No | Unix timestamp when deletion becomes allowed |

**Response**:

```json
{
  "success": true,
  "notarizationId": "456b84...",
  "transactionDigest": "5qK...",
  "type": "locked",
  "timestamp": "2025-10-13T08:13:27.037Z"
}
```

**Immutable Properties**:

- Cannot update state
- Cannot update metadata
- Cannot transfer ownership
- Cannot destroy before deleteLock expires

---

## Query & Verification

### Get Notarization Details

**Endpoint**: `GET /:notarizationId`

**Description**: Retrieve complete information about a notarization.

**Path Parameters**:

| Name | Type | Description |
|------|------|-------------|
| notarizationId | string | The notarization ID |

**Response (Dynamic Notarization)**:

```json
{
  "success": true,
  "notarizationId": "15b2...",
  "state": {
    "content": "96a5...",
    "metadata": "Document Version 2.0 - Revised terms"
  },
  "versionCount": 1,
  "description": "Legal contract for partnership agreement",
  "metadata": "Under legal review - Status: Pending approval",
  "createdAt": "+057752-12-02T12:11:57.000Z",
  "method": "Dynamic",
  "locks": {
    "transferLocked": true,
    "updateLocked": false,
    "destroyAllowed": false
  }
}
```

**Response (Locked Notarization)**:

```json
{
  "success": true,
  "notarizationId": "456b848e0e1f09eca1c06ba2786a58ee8b4d49e9e35962e250820b3f78346022",
  "state": {
    "content": "b2c3d4e5f6a78901234567890123456789012345678901234567890123456789",
    "metadata": "Final signed contract"
  },
  "versionCount": 0,
  "description": "Executed partnership agreement - Immutable record",
  "createdAt": "+057753-01-20T15:48:32.000Z",
  "method": "Locked",
  "locks": {
    "transferLocked": true,
    "updateLocked": true,
    "destroyAllowed": false
  }
}
```

**Field Explanations**:

| Field | Description |
|-------|-------------|
| versionCount | Number of state updates (dynamic only) |
| method | "Dynamic" or "Locked" |
| locks.transferLocked | Whether transfers are blocked |
| locks.updateLocked | Whether updates are blocked |
| locks.destroyAllowed | Whether destruction is permitted |

### Verify Notarization

**Endpoint**: `POST /verify`

**Description**: Cryptographically verify that a notarization contains expected content.

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "notarizationId": "15b...",
  "expectedContent": "96a54..."
}
```

**Response**:

```json
{
  "success": true,
  "verified": true,
  "notarizationId": "15b21d...",
  "expectedContent": "96a5447...",
  "actualContent": "96a544...",
  "match": true
}
```

**Use Cases**:

- Verify document integrity
- Audit notarization records
- Prove content existence at specific time

### Destroy Notarization

**Endpoint**: `DELETE /:notarizationId`

**Description**: Destroy a notarization and recover the storage deposit.

**Path Parameters**:

| Name | Type | Description |
|------|------|-------------|
| notarizationId | string | The notarization ID to destroy |

**Response**:

```json
{
  "success": true,
  "notarizationId": "15b21...",
  "transactionDigest": "PQR678STU901...",
  "timestamp": "2025-10-13T12:05:00.000Z"
}
```

**Restrictions**:

- Dynamic: Can destroy if no active transfer locks
- Locked: Can only destroy after deleteLock expires

---

## Postman Examples

### 1. Health Check

**Method**: GET

**URL**: `http://localhost:3001/api/notarizations/health`

**Headers**: None

**Body**: None

**Expected Response**: 200 OK

```json
{
  "success": true,
  "message": "IOTA Notarization Backend is healthy",
  "timestamp": "2025-10-13T06:53:48.161Z",
  "network": "testnet",
  "packageId": "0xc953...",
  "wallet": {
    "address": "0x8fa9...",
    "balance": "5687...",
    "hasPrivateKey": true
  }
}
```

### 2. Get Wallet Info

**Method**: GET

**URL**: `http://localhost:3001/api/notarizations/wallet/info`

**Headers**: None

**Body**: None

**Expected Response**: 200 OK

```json
{
  "success": true,
  "address": "0x8f...",
  "balance": "5687...",
  "network": "testnet",
  "hasPrivateKey": true
}
```

### 3. Generate File Hash

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/hash`

**Headers**: 

```
Content-Type: multipart/form-data
```

**Body** (form-data):

- Key: `file`
- Value: Select a file to upload

**Expected Response**: 200 OK

```json
{
  "success": true,
  "hash": "96a544...",
  "algorithm": "sha256"
}
```

### 4. Create Dynamic Notarization

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/dynamic`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "content": "96a5447...",
  "metadata": "Document Version 1.0 - Initial draft",
  "description": "Legal contract for partnership agreement",
  "transferLock": {
    "unlockAt": 1760405520
  }
}
```

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "15b21...",
  "transactionDigest": "HSJ5Xc...",
  "type": "dynamic",
  "timestamp": "2025-10-13T07:02:40.954Z"
}
```

### 5. Create Dynamic Notarization (Without Lock)

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/dynamic`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "content": "96a544...",
  "metadata": "for transfer testing",
  "description": "Legal contract for partnership agreement"
}
```

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "d6ce70....",
  "transactionDigest": "HWG9....",
  "type": "dynamic",
  "timestamp": "2025-10-13T08:22:20.618Z"
}
```

### 6. Update State

**Method**: PUT

**URL**: `http://localhost:3001/api/notarizations/:id/state`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "content": "96a5447815...",
  "metadata": "Document Version 2.0 - Revised terms"
}
```

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "15b21de...",
  "transactionDigest": "AfMGE...",
  "timestamp": "2025-10-13T08:00:44.160Z"
}
```

### 7. Update Metadata

**Method**: PUT

**URL**: `http://localhost:3001/api/notarizations/:id/metadata`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "metadata": "Under legal review - Status: Pending approval"
}
```

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "15b21de...",
  "transactionDigest": "Dvem7s...",
  "timestamp": "2025-10-13T08:03:32.628Z"
}
```

### 8. Create Locked Notarization

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/locked`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "content": "b2c3d4....",
  "metadata": "Final signed contract",
  "description": "Executed partnership agreement - Immutable record",
  "deleteLock": {
    "unlockAt": 1760405520
  }
}
```

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "456b8...",
  "transactionDigest": "5qKkrZA...",
  "type": "locked",
  "timestamp": "2025-10-13T08:13:27.037Z"
}
```

### 9. Get Notarization Details (Dynamic)

**Method**: GET

**URL**: `http://localhost:3001/api/notarizations/:id`

**Headers**: None

**Body**: None

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "15b21...",
  "state": {
    "content": "96a544...",
    "metadata": "Document Version 2.0 - Revised terms"
  },
  "versionCount": 1,
  "description": "Legal contract for partnership agreement",
  "metadata": "Under legal review - Status: Pending approval",
  "createdAt": "+057752-12-02T12:11:57.000Z",
  "method": "Dynamic",
  "locks": {
    "transferLocked": true,
    "updateLocked": false,
    "destroyAllowed": false
  }
}
```

### 10. Get Notarization Details (Locked)

**Method**: GET

**URL**: `http://localhost:3001/api/notarizations/:id`

**Headers**: None

**Body**: None

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "456b84...",
  "state": {
    "content": "b2c3d4...",
    "metadata": "Final signed contract"
  },
  "versionCount": 0,
  "description": "Executed partnership agreement - Immutable record",
  "createdAt": "+057753-01-20T15:48:32.000Z",
  "method": "Locked",
  "locks": {
    "transferLocked": true,
    "updateLocked": true,
    "destroyAllowed": false
  }
}
```

### 11. Verify Notarization

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/verify`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "notarizationId": "15b21de...",
  "expectedContent": "96a5447..."
}
```

**Expected Response**: 200 OK

```json
{
  "success": true,
  "verified": true,
  "notarizationId": "15b21...",
  "expectedContent": "96a5447....",
  "actualContent": "96a54....",
  "match": true
}
```

### 12. Transfer Notarization

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/:id/transfer`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "recipientAddress": "0xa4ed..."
}
```

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "d6ce70...",
  "recipientAddress": "0xa4e...",
  "transactionDigest": "4vcoE...",
  "timestamp": "2025-10-13T08:22:47.427Z"
}
```

### 13. Transfer Notarization (Locked - Expected Failure)

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/:id/transfer`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "recipientAddress": "0xa4e..."
}
```

**Expected Response**: 500 Internal Server Error

```json
{
  "success": false,
  "error": "Cannot transfer a locked notarization - it is non-transferable"
}
```

### 14. Transfer Without Ownership (Expected Failure)

**Method**: POST

**URL**: `http://localhost:3001/api/notarizations/:id/transfer`

**Headers**:

```
Content-Type: application/json
```

**Body** (raw JSON):

```json
{
  "recipientAddress": "0xa4..."
}
```

**Expected Response**: 500 Internal Server Error

```json
{
  "success": false,
  "error": "transaction returned an unexpected response; errors in transaction's effects: failure due to MoveAbort(MoveLocation { module: ModuleId { address: c9532095811596786e36bf4356a9986b8f6b5bd11943df0fcc51ae6059447fdd, name: Identifier(\"dynamic_notarization\") }, function: 2, instruction: 6, function_name: Some(\"transfer\") }, 0) in command 0."
}
```

**Note**: This occurs when trying to transfer a notarization that you do not own.

### 15. Destroy Notarization

**Method**: DELETE

**URL**: `http://localhost:3001/api/notarizations/:id`

**Headers**: None

**Body**: None

**Expected Response**: 200 OK

```json
{
  "success": true,
  "notarizationId": "15b2...",
  "transactionDigest": "PQR678STU901...",
  "timestamp": "2025-10-13T12:05:00.000Z"
}
```

### 16. Destroy Notarization With Active Lock (Expected Failure)

**Method**: DELETE

**URL**: `http://localhost:3001/api/notarizations/:id`

**Headers**: None

**Body**: None

**Expected Response**: 500 Internal Server Error

```json
{
  "success": false,
  "error": "Cannot destroy notarization - it may be locked or have active delete locks"
}
```

**Note**: This occurs when trying to destroy a locked notarization with an active deleteLock.

---

## Request/Response Cheat Sheet

Quick reference for all API operations.

| Operation | Method | Endpoint | Body | Auth |
|-----------|--------|----------|------|------|
| Health Check | GET | `/health` | ❌ | ✅ Wallet |
| Wallet Info | GET | `/wallet/info` | ❌ | ✅ Wallet |
| File Hash | POST | `/hash` | ✅ Form-data | ✅ Wallet |
| Create Dynamic | POST | `/dynamic` | ✅ JSON | ✅ Wallet |
| Create Locked | POST | `/locked` | ✅ JSON | ✅ Wallet |
| Update State | PUT | `/:id/state` | ✅ JSON | ✅ Wallet |
| Update Metadata | PUT | `/:id/metadata` | ✅ JSON | ✅ Wallet |
| Transfer | POST | `/:id/transfer` | ✅ JSON | ✅ Wallet |
| Get Details | GET | `/:id` | ❌ | ✅ Wallet |
| Verify | POST | `/verify` | ✅ JSON | ✅ Wallet |
| Destroy | DELETE | `/:id` | ❌ | ✅ Wallet |

---

## Complete Workflow Examples

### Workflow 1: Document Lifecycle Management

This workflow demonstrates creating, updating, and verifying a dynamic notarization.

**Step 1: Generate File Hash**

```
POST http://localhost:3001/api/notarizations/hash
Content-Type: multipart/form-data

file: [upload contract.pdf]
```

Response:
```json
{
  "success": true,
  "hash": "96a544...",
  "algorithm": "sha256"
}
```

**Step 2: Create Dynamic Notarization with Transfer Lock**

```
POST http://localhost:3001/api/notarizations/dynamic
Content-Type: application/json

{
  "content": "96a5...",
  "metadata": "Contract Draft v1.0",
  "description": "Partnership Agreement",
  "transferLock": {
    "unlockAt": 1760405520
  }
}
```

Response:
```json
{
  "success": true,
  "notarizationId": "15b2...",
  "transactionDigest": "HSJ5X...",
  "type": "dynamic",
  "timestamp": "2025-10-13T07:02:40.954Z"
}
```

**Step 3: Update Document with New Version**

```
PUT http://localhost:3001/api/notarizations/:id/state
Content-Type: application/json

{
  "content": "f1e2...",
  "metadata": "Contract Final v2.0"
}
```

Response:
```json
{
  "success": true,
  "notarizationId": "15b2...",
  "transactionDigest": "AfMG...",
  "timestamp": "2025-10-13T08:00:44.160Z"
}
```

**Step 4: Update Status Metadata**

```
PUT http://localhost:3001/api/notarizations/:id/metadata
Content-Type: application/json

{
  "metadata": "Status: Signed and Executed"
}
```

Response:
```json
{
  "success": true,
  "notarizationId": "15b21...",
  "transactionDigest": "Dvem...",
  "timestamp": "2025-10-13T08:03:32.628Z"
}
```

**Step 5: Verify Final Content**

```
POST http://localhost:3001/api/notarizations/verify
Content-Type: application/json

{
  "notarizationId": "15b21...",
  "expectedContent": "f1e2..."
}
```

Response:
```json
{
  "success": true,
  "verified": true,
  "notarizationId": "15b2...",
  "expectedContent": "f1e2...",
  "actualContent": "f1e2d...",
  "match": true
}
```

### Workflow 2: Legal Document Preservation

This workflow demonstrates creating and preserving an immutable locked notarization.

**Step 1: Create Immutable Locked Notarization**

```
POST http://localhost:3001/api/notarizations/locked
Content-Type: application/json

{
  "content": "b2c3d4e5f....",
  "metadata": "Signed Legal Document",
  "description": "Certificate of Incorporation - Permanent Record",
  "deleteLock": {
    "unlockAt": 1893456000
  }
}
```

Response:
```json
{
  "success": true,
  "notarizationId": "456b8....",
  "transactionDigest": "5qKkr....",
  "type": "locked",
  "timestamp": "2025-10-13T08:13:27.037Z"
}
```

**Step 2: Verify the Permanent Record**

```
POST http://localhost:3001/api/notarizations/verify
Content-Type: application/json

{
  "notarizationId": "456b848....",
  "expectedContent": "b2c3d4...."
}
```

Response:
```json
{
  "success": true,
  "verified": true,
  "notarizationId": "456b...",
  "expectedContent": "b2c3...",
  "actualContent": "b2c3d...",
  "match": true
}
```

**Step 3: Retrieve Full Details**

```
GET http://localhost:3001/api/notarizations/:id
```

Response:
```json
{
  "success": true,
  "notarizationId": "456b8...",
  "state": {
    "content": "b2c3d4...",
    "metadata": "Signed Legal Document"
  },
  "versionCount": 0,
  "description": "Certificate of Incorporation - Permanent Record",
  "createdAt": "+057753-01-20T15:48:32.000Z",
  "method": "Locked",
  "locks": {
    "transferLocked": true,
    "updateLocked": true,
    "destroyAllowed": false
  }
}
```

### Workflow 3: Ownership Transfer

This workflow demonstrates transferring a dynamic notarization to a new owner.

**Step 1: Create Transferable Dynamic Notarization**

```
POST http://localhost:3001/api/notarizations/dynamic
Content-Type: application/json

{
  "content": "c3d4e5...",
  "metadata": "Project Documentation",
  "description": "Software Design Documents"
}
```

Response:
```json
{
  "success": true,
  "notarizationId": "d6ce7...",
  "transactionDigest": "HWG9sy...",
  "type": "dynamic",
  "timestamp": "2025-10-13T08:22:20.618Z"
}
```

**Step 2: Transfer to New Owner**

```
POST http://localhost:3001/api/notarizations/:id/transfer
Content-Type: application/json

{
  "recipientAddress": "0xa4ed..."
}
```

Response:
```json
{
  "success": true,
  "notarizationId": "d6ce70...",
  "recipientAddress": "0xa4ed...",
  "transactionDigest": "4vcoE...",
  "timestamp": "2025-10-13T08:22:47.427Z"
}
```

---

## Error Codes & Troubleshooting

### Common Error Messages

**Invalid SHA-256 Hash**

Error:
```
"content must be a valid SHA-256 hash (64 hex characters)"
```

Solution: Ensure the content string is exactly 64 hexadecimal characters. Use the `/hash` endpoint to generate valid hashes from files.

**Cannot Update Locked Notarization**

Error:
```
"Cannot update state of a locked notarization - it is immutable"
```

Solution: Locked notarizations are immutable by design. Use dynamic notarizations if you need to update content later.

**Cannot Transfer Locked Notarization**

Error:
```
"Cannot transfer a locked notarization - it is non-transferable"
```

Solution: Locked notarizations cannot be transferred. Only dynamic notarizations support transfers.

**Cannot Transfer Without Ownership**

Error:
```
"transaction returned an unexpected response; errors in transaction's effects: failure due to MoveAbort..."
```

Solution: You can only transfer notarizations that you own. Verify you are the current owner before attempting transfer.

**Cannot Destroy With Active Lock**

Error:
```
"Cannot destroy notarization - it may be locked or have active delete locks"
```

Solution: Wait for the deleteLock to expire before attempting destruction, or create the notarization without a lock.

**Missing Required Fields**

Error:
```
"[field] is required"
```

Solution: Check the endpoint documentation and ensure all required fields are provided in the request body.

**Network Connectivity Issues**

Error:
```
"Network error" or blockchain-related errors
```

Solution: 
- Verify NETWORK_URL is correctly configured
- Check IOTA testnet status
- Ensure your wallet has sufficient IOTA tokens for gas fees
- Check your internet connection

### Debugging Tips

1. **Always start with health check**: Verify the service is running and wallet is connected
   ```
   GET http://localhost:3001/api/notarizations/health
   ```

2. **Verify wallet balance**: Ensure you have sufficient funds
   ```
   GET http://localhost:3001/api/notarizations/wallet/info
   ```

3. **Check environment variables**: Verify `.env` file contains:
   - `IOTA_NOTARIZATION_PKG_ID`
   - `NETWORK_URL`
   - `PRIVATE_KEY`
   - `PORT`

4. **Validate hashes**: Use SHA-256 hash generators to verify hash format
   ```
   POST http://localhost:3001/api/notarizations/hash
   ```

5. **Review blockchain errors**: Detailed error messages often contain IOTA SDK diagnostics

6. **Check ownership**: Ensure you own the notarization before updating or transferring

7. **Monitor logs**: Check server console output for detailed error information

---

## Rate Limiting & Best Practices

### Best Practices

1. **Use meaningful metadata**: Include descriptive metadata for easier auditing
2. **Generate hashes properly**: Always use the `/hash` endpoint for file hashing
3. **Plan lock times**: Consider your business needs before setting transfer or delete locks
4. **Verify after operations**: Use the `/verify` endpoint to confirm successful operations
5. **Store notarization IDs**: Keep records of created notarization IDs for future reference
6. **Monitor wallet balance**: Check balance before performing operations that consume gas
7. **Use appropriate notarization type**:
   - Use **dynamic** for evolving documents
   - Use **locked** for permanent records

### Batch Operations

For multiple operations, consider:
- Spacing requests to avoid overwhelming the network
- Using transaction digests for confirmation tracking
- Implementing retry logic for failed operations

---

## Security Considerations

1. **Private Key Management**:
   - Never commit `.env` files to version control
   - Use environment variables in production
   - Rotate keys regularly in high-security environments

2. **SHA-256 Hash Verification**:
   - Hash collisions are mathematically impossible
   - Hashes uniquely identify document content
   - Always store hashes alongside notarization IDs

3. **Transfer Security**:
   - Verify recipient addresses before transfer
   - Use transfer locks to prevent unauthorized transfers
   - Keep transaction digests for audit trails

4. **Locked Notarizations**:
   - Use for legally binding documents
   - Set appropriate deleteLock times
   - Immutability provides strong security guarantees

---

## Support & Resources

- **Documentation**: http://localhost:3001/
- **Health Check**: http://localhost:3001/api/notarizations/health
- **IOTA Documentation**: https://docs.iota.org/developer/iota-notarization/