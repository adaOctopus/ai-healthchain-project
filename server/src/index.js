/**
 * AI Health Chains - Blockchain Assessment Backend Server
 * 
 * This is the main entry point for the backend server.
 * The server provides a REST API for interacting with the permissioned blockchain.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import blockchain core
const Blockchain = require('./core/Blockchain.js');
const NodeManager = require('./core/NodeManager.js');

// Import feature routes (to be implemented)
const consentRoutes = require('./features/consent-management/consentController.js');
const integrityRoutes = require('./features/data-integrity/integrityController.js');
const zkRoutes = require('./features/zk-proofs/zkController.js');
const auditRoutes = require('./features/audit-trail/auditController.js');
const consensusRoutes = require('./features/consensus/consensusController.js');

// Import data
const { patients, clinicians, aiModels, medicalRecords, consentRecords } = require('./data/generated-data.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize blockchain
const blockchain = new Blockchain();
const nodeManager = new NodeManager(blockchain);

// Store mock data in memory (in production, this would be a database)
app.locals.blockchain = blockchain;
app.locals.nodeManager = nodeManager;
app.locals.data = {
  patients,
  clinicians,
  aiModels,
  medicalRecords,
  consentRecords
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    blockchain: {
      chainLength: blockchain.getChainLength(),
      latestBlock: blockchain.getLatestBlock()?.hash || null,
      nodeId: nodeManager.getNodeId()
    }
  });
});

// Blockchain info endpoint
app.get('/api/blockchain/info', (req, res) => {
  const info = {
    chainLength: blockchain.getChainLength(),
    latestBlock: blockchain.getLatestBlock(),
    nodeId: nodeManager.getNodeId(),
    networkNodes: nodeManager.getNetworkNodes(),
    totalTransactions: blockchain.getTotalTransactions()
  };
  res.json(info);
});

// Feature routes (custom blockchain)
app.use('/api/consent', consentRoutes);
app.use('/api/integrity', integrityRoutes);
app.use('/api/zk', zkRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/consensus', consensusRoutes);

// Real Solidity contract routes (if available)
try {
  const EthersContractService = require('./services/ethersContractService.js');
  const ethersContractService = new EthersContractService();
  app.locals.ethersContractService = ethersContractService;
  
  // Add contract endpoints
  app.use('/api/contracts/consent', require('./features/consent-management/consentEthersController.js'));
  
  console.log('✓ Real Solidity contract endpoints enabled at /api/contracts/*');
} catch (error) {
  console.warn('⚠️  Real contract service not available:', error.message);
  console.warn('   Continuing with custom blockchain only');
  console.warn('   To enable: Make sure contracts are compiled and Hardhat node is running');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      path: req.path
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║   AI Health Chains - Blockchain Assessment Server            ║
║                                                              ║
║   Server running on: http://localhost:${PORT}                    ║
║   Node ID: ${nodeManager.getNodeId()}                                    ║
║   Blockchain initialized with ${blockchain.getChainLength()} blocks              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  
  // Initialize with genesis block if chain is empty
  if (blockchain.getChainLength() === 0) {
    blockchain.createGenesisBlock();
    console.log('✓ Genesis block created');
  }
});

module.exports = app;

