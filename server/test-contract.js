/**
 * Quick test script to verify contract integration works
 * 
 * Run: node test-contract.js
 * 
 * Make sure Hardhat node is running first: cd contracts && npm run node
 */

const EthersContractService = require('./src/services/ethersContractService.js');

async function test() {
  try {
    console.log('🔌 Connecting to contracts...\n');
    const service = new EthersContractService();
    
    // Get accounts from Hardhat
    const accounts = await service.provider.listAccounts();
    const patient = accounts[0];
    const clinician = accounts[1];
    
    console.log('📋 Test Accounts:');
    console.log('   Patient:', patient);
    console.log('   Clinician:', clinician);
    console.log('');
    
    // Test 1: Grant consent
    console.log('🧪 Test 1: Granting consent...');
    const result = await service.grantConsent(
      patient,
      clinician,
      'Data Access',
      null, // No expiration
      1     // Purpose
    );
    
    console.log('✅ Consent granted!');
    console.log('   TX Hash:', result.transactionHash);
    console.log('   Block:', result.blockNumber);
    console.log('');
    
    // Test 2: Check consent
    console.log('🧪 Test 2: Checking consent...');
    const hasConsent = await service.hasValidConsent(patient, clinician, 'Data Access');
    console.log('✅ Has consent:', hasConsent);
    console.log('');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure Hardhat node is running:');
      console.error('   cd contracts && npm run node');
    }
    process.exit(1);
  }
}

test();

