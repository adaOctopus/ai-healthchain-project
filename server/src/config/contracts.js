// Contract addresses (from your deployment)
// Update these if you redeploy contracts

module.exports = {
  ConsentManagement: '0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363',
  AuditTrail: '0xcacFd7298887451302DE75685A0eAC9b77E59157',
  DataIntegrity: '0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4',
  
  // Local Hardhat node
  RPC_URL: process.env.CONTRACT_RPC_URL || 'http://localhost:8545',
  
  // Use first Hardhat account (or set your own via env)
  // This is the default Hardhat account #0 private key
  PRIVATE_KEY: process.env.CONTRACT_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};

