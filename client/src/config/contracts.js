// Contract addresses (from your deployment)
// Update these if you redeploy contracts

export const CONTRACT_ADDRESSES = {
  ConsentManagement: '0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363',
  AuditTrail: '0xcacFd7298887451302DE75685A0eAC9b77E59157',
  DataIntegrity: '0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4',
};

// RPC URL - Use Sepolia or local Hardhat
// Set VITE_SEPOLIA_RPC_URL in client/.env for Sepolia
// Or leave empty to use local Hardhat node
export const RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || 'http://localhost:8545';

// Network ID - Sepolia = 11155111, Local = 31337
export const NETWORK_ID = import.meta.env.VITE_SEPOLIA_RPC_URL ? 11155111 : 31337;

// Consent Type mapping
export const CONSENT_TYPES = {
  'Data Access': 0,
  'AI Analysis': 1,
  'Research': 2,
  'Sharing': 3
};

