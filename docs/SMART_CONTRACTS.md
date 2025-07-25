# Koosi Smart Contract Specification

## Overview

Koosi's smart contract system is built on the Cardano blockchain using Plutus, enabling secure and verifiable digital time capsules with complex trigger conditions.

## Contract Architecture

### Core Types

```haskell
-- Main data types
data Capsule = Capsule {
    capsuleId :: CapsuleId,
    content :: ContentHash,
    creator :: PubKeyHash,
    recipients :: [PubKeyHash],
    trigger :: TriggerCondition,
    status :: CapsuleStatus
}

data TriggerCondition = 
    TimeBasedTrigger POSIXTime
    | EventBasedTrigger EventCriteria
    | ConsensusTrigger ConsensusParams
    | CompositeTrigger [TriggerCondition]

data CapsuleStatus = 
    Sealed
    | PartiallyUnsealed
    | Unsealed
    | Expired

data ConsensusParams = ConsensusParams {
    members :: [PubKeyHash],
    threshold :: Integer,
    timeLimit :: Maybe POSIXTime
}

-- Validator types
data CapsuleAction = 
    Create CapsuleParams
    | AddRecipient PubKeyHash
    | UpdateTrigger TriggerCondition
    | Unseal Evidence
    | EmergencyRelease EmergencyProof
```

## Smart Contracts

### 1. KoosiVault Contract

The main contract managing capsule creation and access.

```haskell
-- Validator script
validateKoosiVault :: Capsule -> CapsuleAction -> ScriptContext -> Bool
validateKoosiVault capsule action ctx = case action of
    Create params -> validateCreate params ctx
    AddRecipient recipient -> validateAddRecipient capsule recipient ctx
    UpdateTrigger newTrigger -> validateTriggerUpdate capsule newTrigger ctx
    Unseal evidence -> validateUnseal capsule evidence ctx
    EmergencyRelease proof -> validateEmergency capsule proof ctx

-- Helper validators
validateCreate :: CapsuleParams -> ScriptContext -> Bool
validateCreate params ctx = 
    checkCreatorSignature &&
    validParameters params &&
    sufficientFunds

validateUnseal :: Capsule -> Evidence -> ScriptContext -> Bool
validateUnseal capsule evidence ctx =
    checkRecipientSignature &&
    validateEvidence capsule evidence &&
    triggerConditionMet capsule ctx
```

### 2. ConditionalTrigger Contract

Manages and verifies trigger conditions.

```haskell
-- Validator script
validateTrigger :: TriggerCondition -> Evidence -> ScriptContext -> Bool
validateTrigger condition evidence ctx = case condition of
    TimeBasedTrigger time -> 
        currentTime ctx >= time
    
    EventBasedTrigger criteria ->
        validateEventEvidence criteria evidence
    
    ConsensusTrigger params ->
        validateConsensus params ctx
    
    CompositeTrigger conditions ->
        all (\c -> validateTrigger c evidence ctx) conditions
```

### 3. MultiPartyConsensus Contract

Handles group decision-making for capsule release.

```haskell
-- Validator script
validateConsensus :: ConsensusParams -> [Signature] -> ScriptContext -> Bool
validateConsensus params sigs ctx =
    sufficientSignatures params sigs &&
    validMembers params sigs &&
    withinTimeLimit params ctx

-- Consensus checking
sufficientSignatures :: ConsensusParams -> [Signature] -> Bool
sufficientSignatures params sigs =
    length (verifiedSignatures sigs) >= threshold params
```

## Token System

### Native Tokens

```haskell
-- Access control tokens
data AccessToken = AccessToken {
    tokenName :: TokenName,
    policy :: MintingPolicy,
    metadata :: TokenMetadata
}

-- Policy script
validateAccessToken :: TokenParams -> ScriptContext -> Bool
validateAccessToken params ctx =
    validIssuer params ctx &&
    correctAmount ctx &&
    validMetadata params
```

## Emergency Protocols

### Dead Man's Switch

```haskell
-- Emergency release mechanism
data EmergencyProof = EmergencyProof {
    inactivityPeriod :: POSIXTime,
    backupSignatures :: [Signature],
    evidence :: Evidence
}

validateEmergency :: Capsule -> EmergencyProof -> ScriptContext -> Bool
validateEmergency capsule proof ctx =
    sufficientInactivityPeriod proof &&
    validBackupSignatures capsule proof &&
    validEmergencyEvidence proof
```

## Security Measures

### Access Control

```haskell
-- Permission checking
checkPermissions :: PubKeyHash -> Capsule -> ScriptContext -> Bool
checkPermissions pkh capsule ctx =
    isCreator pkh capsule ||
    isRecipient pkh capsule ||
    hasValidAccessToken pkh ctx

-- Token validation
validateAccessToken :: TokenName -> ScriptContext -> Bool
validateAccessToken name ctx =
    correctTokenPolicy ctx &&
    tokenNotExpired ctx &&
    validTokenMetadata ctx
```

### Privacy Protection

```haskell
-- Content privacy
data EncryptedContent = EncryptedContent {
    ciphertext :: ByteString,
    nonce :: ByteString,
    ephemeralPubKey :: PubKeyHash
}

validateEncryption :: EncryptedContent -> ScriptContext -> Bool
validateEncryption content ctx =
    validEncryptionScheme content &&
    correctKeyDerivation content &&
    integrityCheck content
```

## Testing Framework

```haskell
-- Property-based tests
prop_validCreation :: CapsuleParams -> Property
prop_validCreation params =
    forAll genValidParams $ \p ->
        validateCreate p emptyCtx === True

-- Unit tests
test_consensusThreshold :: TestTree
test_consensusThreshold = testGroup "Consensus Tests"
    [ testCase "Sufficient signatures" $
        validateConsensus params validSigs ctx @?= True
    , testCase "Insufficient signatures" $
        validateConsensus params invalidSigs ctx @?= False
    ]
```

## Deployment Guidelines

1. **Testing Environment**
   - Use testnet for initial deployment
   - Run comprehensive property-based tests
   - Perform security audits

2. **Mainnet Deployment**
   - Multi-signature deployment process
   - Phased rollout strategy
   - Emergency shutdown capability

3. **Monitoring**
   - Track contract interactions
   - Monitor token economics
   - Alert system for anomalies
