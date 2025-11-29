import { useState } from 'react';
import { useContracts } from '../hooks/useContracts';
import { CONSENT_TYPES, CONTRACT_ADDRESSES } from '../config/contracts';

/**
 * Component for interacting with smart contracts from the frontend
 */
export default function ContractInteraction() {
  const { contracts, isConnected, account, connectWallet, error, loading: walletLoading } = useContracts();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // Form state
  const [patientId, setPatientId] = useState('');
  const [clinicianId, setClinicianId] = useState('');
  const [consentType, setConsentType] = useState('Data Access');

  // Grant consent
  const handleGrantConsent = async () => {
    if (!contracts.consent || !isConnected) {
      alert('Please connect wallet first');
      return;
    }

    setLoading(true);
    setResult(null);
    setTxHash(null);

    try {
      // Convert addresses - if not starting with 0x, assume they're UUIDs and use first Hardhat account
      const patientAddress = patientId.startsWith('0x') 
        ? patientId 
        : '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // First Hardhat account
      
      const clinicianAddress = clinicianId.startsWith('0x')
        ? clinicianId
        : '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Second Hardhat account

      const type = CONSENT_TYPES[consentType] || 0;

      console.log('Submitting transaction...', {
        patientAddress,
        clinicianAddress,
        type,
        consentType
      });

      // Submit transaction
      const tx = await contracts.consent.grantConsent(
        patientAddress,
        clinicianAddress,
        type,
        0, // No expiration
        1  // Purpose
      );

      setTxHash(tx.hash);
      setResult('Transaction submitted! Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await tx.wait();
      
      setResult(`✅ Consent granted successfully!`);
      setTxHash(tx.hash);
      
      console.log('Transaction confirmed:', {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check consent
  const handleCheckConsent = async () => {
    if (!contracts.consent || !isConnected) {
      alert('Please connect wallet first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const patientAddress = patientId.startsWith('0x') 
        ? patientId 
        : '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      
      const clinicianAddress = clinicianId.startsWith('0x')
        ? clinicianId
        : '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

      const type = CONSENT_TYPES[consentType] || 0;

      const hasConsent = await contracts.consent.hasValidConsent(
        patientAddress,
        clinicianAddress,
        type
      );

      setResult(hasConsent 
        ? '✅ Valid consent exists' 
        : '❌ No valid consent found'
      );
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Smart Contract Interaction</h2>

      {/* Connection Status */}
      <div style={{ marginBottom: '20px', padding: '10px', background: isConnected ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
        {isConnected ? (
          <div>
            <strong>✅ Connected</strong>
            {account && <p>Account: {account}</p>}
          </div>
        ) : (
          <div>
            <strong>❌ Not Connected</strong>
            <button 
              onClick={connectWallet} 
              disabled={walletLoading}
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px',
                cursor: walletLoading ? 'not-allowed' : 'pointer',
                opacity: walletLoading ? 0.6 : 1
              }}
            >
              {walletLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>

      {/* Form */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Patient Address:</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="0x... or use default"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          <small>Leave empty to use default Hardhat account</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Clinician Address:</label>
          <input
            type="text"
            value={clinicianId}
            onChange={(e) => setClinicianId(e.target.value)}
            placeholder="0x... or use default"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          <small>Leave empty to use default Hardhat account</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Consent Type:</label>
          <select
            value={consentType}
            onChange={(e) => setConsentType(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="Data Access">Data Access</option>
            <option value="AI Analysis">AI Analysis</option>
            <option value="Research">Research</option>
            <option value="Sharing">Sharing</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleGrantConsent}
            disabled={loading || !isConnected}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processing...' : 'Grant Consent'}
          </button>

          <button
            onClick={handleCheckConsent}
            disabled={loading || !isConnected}
            style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            Check Consent
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ padding: '15px', background: '#e7f3ff', borderRadius: '5px', marginTop: '20px' }}>
          <strong>Result:</strong>
          <p>{result}</p>
          {txHash && (
            <div>
              <strong>Transaction Hash:</strong>
              <p style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{txHash}</p>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
        <strong>💡 How it works:</strong>
        <ul>
          <li>Click "Connect Wallet" to connect to MetaMask or use local Hardhat account</li>
          <li>Enter addresses (or leave empty for defaults)</li>
          <li>Click "Grant Consent" to submit a transaction to the blockchain</li>
          <li>Wait for confirmation - you'll see the transaction hash</li>
        </ul>
        <p><strong>Contract Address:</strong> {CONTRACT_ADDRESSES.ConsentManagement}</p>
      </div>
    </div>
  );
}

