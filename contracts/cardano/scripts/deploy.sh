#!/bin/bash

# Build the Plutus validator
cabal build

# Generate the Plutus script address
cardano-cli address build \
    --payment-script-file ../build/KoosiValidator.plutus \
    --testnet-magic 1 \
    --out-file ../build/validator.addr

# Create the token policy
cardano-cli transaction policyid \
    --script-file ../build/KoosiValidator.plutus \
    > ../build/policy.id

# Save deployment info for Firefly
cat > ../../firefly/config/deployments.cardano.yml << EOL
contracts:
  cardano:
    KoosiValidator:
      address: $(cat ../build/validator.addr)
      policyId: $(cat ../build/policy.id)
      chain: "cardano"
EOL

echo "Deployment completed. Check ../build/ for deployment artifacts."
