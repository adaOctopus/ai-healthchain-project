# Testing Backend APIs from Frontend

## Overview

All backend APIs are now accessible from the frontend UI. Each feature page has interactive buttons to test the API endpoints.

---

## Setup

### Step 1: Start Backend Server

```bash
cd server
npm start
```

The backend should run on `http://localhost:3000`

### Step 2: Start Frontend

```bash
cd client
npm run dev
```

The frontend should run on `http://localhost:5173`

---

## Available Test Pages

### 1. Data Integrity (`/integrity`)

**Test Merkle Tree Operations:**

- **Create Merkle Tree**: Creates a Merkle tree from records and returns the root hash
- **Generate Proof**: Generates a proof for a specific record
- **Verify Integrity**: Verifies that a record is valid using its proof

**API Endpoints:**
- `POST /api/integrity/tree` - Create Merkle tree
- `POST /api/integrity/proof` - Generate proof
- `POST /api/integrity/verify` - Verify integrity
- `POST /api/integrity/verify-batch` - Verify batch of records

**How to Test:**
1. Go to "Data Integrity" page
2. Click "Create Merkle Tree" - creates tree with sample records
3. Click "Generate Proof" - generates proof for a record
4. Click "Verify Integrity" - verifies the proof

---

### 2. Audit Trail (`/audit`)

**Test Audit Logging:**

- **Log Data Access**: Records when someone accesses patient data
- **Log Consent Change**: Records when consent is granted/revoked
- **Log AI Diagnostic**: Records AI diagnostic submissions
- **Query Audit Trail**: Retrieves audit logs for a resource

**API Endpoints:**
- `POST /api/audit/data-access` - Log data access
- `POST /api/audit/consent` - Log consent change
- `POST /api/audit/ai-diagnostic` - Log AI diagnostic
- `GET /api/audit/query` - Query audit trail
- `GET /api/audit/trail/:resourceId/:resourceType` - Get full trail

**How to Test:**
1. Go to "Audit Trail" page
2. Click any button to test that operation
3. View the result in the response area

---

### 3. ZK Proofs (`/zk-proofs`)

**Test Zero-Knowledge Proofs:**

- **Generate Consent Proof**: Creates a ZK proof that consent exists
- **Verify Consent Proof**: Verifies the consent proof
- **Generate Permission Proof**: Creates a ZK proof for resource access
- **Verify Permission Proof**: Verifies the permission proof

**API Endpoints:**
- `POST /api/zk/consent-proof` - Generate consent proof
- `POST /api/zk/verify-consent` - Verify consent proof
- `POST /api/zk/permission-proof` - Generate permission proof
- `POST /api/zk/verify-permission` - Verify permission proof

**How to Test:**
1. Go to "ZK Proofs" page
2. Click "Generate Consent Proof" first
3. Then click "Verify Consent Proof" to verify it
4. Same for permission proofs

---

### 4. Consensus (`/consensus`)

**Test Consensus Mechanism:**

- **Propose Block**: Proposes a new block with transactions
- **Vote on Block**: Votes on whether a proposed block is valid
- **Sync Chain**: Synchronizes blockchain state with peer nodes

**API Endpoints:**
- `POST /api/consensus/propose` - Propose block
- `POST /api/consensus/vote` - Vote on block
- `POST /api/consensus/sync` - Sync chain

**How to Test:**
1. Go to "Consensus" page
2. Click "Propose Block" - creates a block proposal
3. Click "Vote on Block" - votes on the proposed block
4. Click "Sync Chain" - syncs with peers

---

## Testing Flow

### Example: Test Data Integrity

1. **Start Backend:**
   ```bash
   cd server && npm start
   ```

2. **Start Frontend:**
   ```bash
   cd client && npm run dev
   ```

3. **Open Browser:**
   - Go to `http://localhost:5173`
   - Click "Data Integrity" in navigation

4. **Test Operations:**
   - Click "Create Merkle Tree" → See root hash
   - Click "Generate Proof" → See proof for a record
   - Click "Verify Integrity" → See verification result

5. **View Results:**
   - Results appear in the green box below buttons
   - Errors appear in the red box if something fails

---

## API Response Format

All APIs return JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": { ... }
}
```

---

## Troubleshooting

### "Network Error" or "Connection Refused"

**Problem:** Backend server is not running

**Solution:**
```bash
cd server
npm start
```

Make sure you see:
```
Server running on port 3000
```

### "404 Not Found"

**Problem:** API endpoint doesn't exist or route is wrong

**Solution:** Check that:
- Backend server is running
- Route path matches exactly (case-sensitive)
- Request method is correct (GET vs POST)

### "500 Internal Server Error"

**Problem:** Backend encountered an error processing the request

**Solution:**
- Check backend console for error details
- Verify request body format matches API requirements
- Check that required fields are provided

---

## Direct API Testing (Alternative)

You can also test APIs directly using `curl` or Postman:

### Example: Test Data Integrity

```bash
# Create Merkle Tree
curl -X POST http://localhost:3000/api/integrity/tree \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      "Record 1: Patient data",
      "Record 2: Medical history",
      "Record 3: Test results"
    ]
  }'
```

### Example: Test Audit Trail

```bash
# Log Data Access
curl -X POST http://localhost:3000/api/audit/data-access \
  -H "Content-Type: application/json" \
  -d '{
    "actorId": "clinician-001",
    "resourceId": "patient-record-123",
    "resourceType": "medical_record",
    "granted": true,
    "reason": "Treatment planning"
  }'
```

---

## Summary

**To test backend APIs:**

1. ✅ Start backend: `cd server && npm start`
2. ✅ Start frontend: `cd client && npm run dev`
3. ✅ Open browser: `http://localhost:5173`
4. ✅ Navigate to feature page (Data Integrity, Audit Trail, ZK Proofs, Consensus)
5. ✅ Click buttons to test API endpoints
6. ✅ View results in the response area

**All features are now testable from the frontend UI!** 🎉

