const ganache = require("ganache");

const options = {
  wallet: {
    deterministic: true, // Use deterministic addresses
    totalAccounts: 10,   // Generate 10 accounts
    defaultBalance: 1000 // Give each account 1000 ETH
  },
  chain: {
    chainId: 1337,      // Local chain ID
    networkId: 1337,
    hardfork: "london"  // Use London hardfork for EIP-1559
  },
  logging: {
    quiet: false        // Show RPC logs
  }
};

const server = ganache.server(options);

server.listen(8545, async (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  
  console.log("🔗 Local blockchain started on http://127.0.0.1:8545");
  console.log("\n🔑 Available Accounts:");
  
  const provider = server.provider;
  const accounts = await provider.request({ method: "eth_accounts" });
  
  accounts.forEach((account, index) => {
    console.log(`(${index}) ${account}`);
  });
});
