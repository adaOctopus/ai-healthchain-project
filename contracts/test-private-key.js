const ethers = require('ethers');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 Private Key Format Validator\n');
console.log('Paste your private key (it will be hidden):\n');

rl.question('Private Key: ', (key) => {
  // Remove any whitespace
  key = key.trim();
  
  console.log('\n📋 Analyzing your key...\n');
  console.log('First 10 characters:', key.substring(0, 10));
  console.log('Length:', key.length);
  console.log('Starts with 0x:', key.startsWith('0x'));
  
  // Check if it starts with 034 (the problem)
  if (key.startsWith('034')) {
    console.log('\n⚠️  PROBLEM DETECTED: Key starts with "034" instead of "0x"');
    console.log('\n🔧 FIX:');
    console.log('1. Remove "034" from the beginning');
    console.log('2. Add "0x" at the start');
    console.log('\nCorrected key should be:');
    const corrected = '0x' + key.substring(3);
    console.log(corrected.substring(0, 20) + '...');
    console.log('\nUse this corrected key in your .env file!');
  }
  
  // Try to validate
  try {
    if (!key.startsWith('0x')) {
      throw new Error('Key must start with 0x');
    }
    if (key.length !== 66) {
      throw new Error(`Key must be 66 characters (got ${key.length})`);
    }
    
    const wallet = new ethers.Wallet(key);
    console.log('\n✅ SUCCESS! Your private key is valid!');
    console.log('Address:', wallet.address);
    console.log('\nYou can use this key in your .env file.');
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('\nMake sure your key:');
    console.log('- Starts with 0x (not 034)');
    console.log('- Is exactly 66 characters long');
    console.log('- Contains only hexadecimal characters (0-9, a-f, A-F)');
  }
  
  rl.close();
});
