# Koosi API Reference

## REST API Endpoints (Planned)

### Authentication

#### Social Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "provider": "google",
  "token": "oauth-token"
}
```

#### Wallet Connection
```http
POST /api/auth/wallet/connect
Content-Type: application/json

{
  "walletType": "cardano",
  "address": "addr1..."
}
```

### Time Capsules

#### Create Capsule
```http
POST /api/capsules
Content-Type: application/json

{
  "content": {
    "type": "text|audio|video",
    "data": "encrypted-content"
  },
  "recipients": ["user-id-1", "user-id-2"],
  "trigger": {
    "type": "time|event|consensus",
    "conditions": {}
  }
}
```

#### Get Capsule
```http
GET /api/capsules/:id
Authorization: Bearer <token>
```

#### List User's Capsules
```http
GET /api/capsules
Authorization: Bearer <token>
Query: status=pending|active|delivered
```

### Triggers

#### Create Trigger
```http
POST /api/triggers
Content-Type: application/json

{
  "type": "event",
  "conditions": {
    "event": "graduation",
    "verification": "university-api"
  }
}
```

#### Verify Trigger
```http
POST /api/triggers/:id/verify
Content-Type: application/json

{
  "evidence": {
    "type": "document",
    "content": "base64-encoded"
  }
}
```

### Group Consensus

#### Create Consensus Group
```http
POST /api/consensus
Content-Type: application/json

{
  "members": ["user-id-1", "user-id-2"],
  "threshold": 2,
  "description": "Graduation verification group"
}
```

#### Submit Vote
```http
POST /api/consensus/:id/vote
Content-Type: application/json

{
  "decision": "approve|reject",
  "comment": "Optional comment"
}
```

## Smart Contract Interface (Planned)

### Capsule Contract

```haskell
-- Create new capsule
createCapsule :: CapsuleParams -> Contract ()

-- Add recipient
addRecipient :: CapsuleId -> Address -> Contract ()

-- Set trigger condition
setTrigger :: CapsuleId -> TriggerCondition -> Contract ()

-- Release capsule
releaseCapsule :: CapsuleId -> Evidence -> Contract ()
```

### Consensus Contract

```haskell
-- Create consensus group
createConsensus :: [Address] -> Integer -> Contract ()

-- Submit vote
submitVote :: ConsensusId -> Vote -> Contract ()

-- Check consensus status
checkConsensus :: ConsensusId -> Contract Bool
```

## WebSocket Events

### Capsule Events

```javascript
// Subscribe to capsule updates
socket.on('capsule:update', (data) => {
  console.log('Capsule updated:', data);
});

// Subscribe to trigger events
socket.on('trigger:activated', (data) => {
  console.log('Trigger activated:', data);
});

// Subscribe to consensus progress
socket.on('consensus:progress', (data) => {
  console.log('Consensus progress:', data);
});
```

## Error Codes

| Code | Description |
|------|-------------|
| 1001 | Invalid capsule parameters |
| 1002 | Unauthorized access |
| 1003 | Invalid trigger condition |
| 1004 | Consensus not reached |
| 1005 | Invalid evidence |
| 2001 | Blockchain error |
| 2002 | Storage error |
| 3001 | Rate limit exceeded |

## Rate Limits

- Authentication: 5 requests per minute
- Capsule Creation: 10 requests per hour
- API Queries: 100 requests per minute
- Consensus Votes: 20 requests per hour

## SDK Integration (Future)

```typescript
import { KoosiSDK } from '@koosi/sdk';

const koosi = new KoosiSDK({
  apiKey: 'your-api-key',
  network: 'mainnet|testnet'
});

// Create a new capsule
const capsule = await koosi.capsules.create({
  content: 'encrypted-content',
  trigger: {
    type: 'event',
    conditions: {}
  }
});

// Monitor trigger status
koosi.triggers.subscribe(triggerId, (status) => {
  console.log('Trigger status:', status);
});
```
