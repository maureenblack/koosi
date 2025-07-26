{-# LANGUAGE DataKinds           #-}
{-# LANGUAGE FlexibleContexts    #-}
{-# LANGUAGE NoImplicitPrelude   #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE TemplateHaskell     #-}
{-# LANGUAGE TypeApplications    #-}
{-# LANGUAGE TypeFamilies        #-}
{-# LANGUAGE TypeOperators       #-}

module KoosiValidator where

import           PlutusTx.Prelude
import qualified PlutusTx
import           Plutus.V2.Ledger.Api
import           Plutus.V2.Ledger.Contexts
import qualified Ledger.Ada                     as Ada
import           Ledger.Value                   (AssetClass)

-- | Token types that match Ethereum contract
data KoosiTokenType = AccessToken | PremiumToken | SpecialCapsule
PlutusTx.makeIsDataIndexed ''KoosiTokenType [('AccessToken, 0), ('PremiumToken, 1), ('SpecialCapsule, 2)]

-- | Cross-chain transfer data
data CrossChainTransfer = CrossChainTransfer
    { ethTxHash      :: BuiltinByteString
    , ethAddress     :: BuiltinByteString
    , tokenType      :: KoosiTokenType
    , amount         :: Integer
    }
PlutusTx.makeIsDataIndexed ''CrossChainTransfer [('CrossChainTransfer, 0)]

-- | Validator parameters
data KoosiParams = KoosiParams
    { bridgeOperator :: PubKeyHash
    , tokenPolicy    :: CurrencySymbol
    }
PlutusTx.makeIsDataIndexed ''KoosiParams [('KoosiParams, 0)]

{-# INLINABLE mkKoosiValidator #-}
mkKoosiValidator :: KoosiParams -> CrossChainTransfer -> ScriptContext -> Bool
mkKoosiValidator params transfer ctx = 
    traceIfFalse "Invalid bridge operator" signedByBridgeOperator &&
    traceIfFalse "Invalid token transfer" validTokenTransfer
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    signedByBridgeOperator :: Bool
    signedByBridgeOperator = txSignedBy info $ bridgeOperator params

    validTokenTransfer :: Bool
    validTokenTransfer = case tokenType transfer of
        AccessToken    -> validateTokenMint 1
        PremiumToken   -> validateTokenMint 2
        SpecialCapsule -> validateTokenMint 3

    validateTokenMint :: Integer -> Bool
    validateTokenMint tokenId =
        let expectedValue = Value.singleton (tokenPolicy params) tokenId (amount transfer)
         in traceIfFalse "Incorrect token minting" $ 
            expectedValue == txInfoMint info

-- | Compile the validator
koosiValidator :: KoosiParams -> Scripts.TypedValidator CrossChainTransfer
koosiValidator params = Scripts.mkTypedValidator @CrossChainTransfer
    ($$(PlutusTx.compile [|| mkKoosiValidator ||]) `PlutusTx.applyCode` PlutusTx.liftCode params)
    $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @CrossChainTransfer

-- | Create the validator script
koosiValidatorScript :: KoosiParams -> Script
koosiValidatorScript = Scripts.validatorScript . koosiValidator
