import { useState } from 'react';
import axios from 'axios';

const API_BASE = '/api';

export default function ConsensusTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [blockHash, setBlockHash] = useState(null);

  // Propose Block
  const proposeBlock = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const transactions = [
        {
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          amount: 100,
          data: 'Test transaction 1'
        },
        {
          from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          amount: 50,
          data: 'Test transaction 2'
        }
      ];
      
      const response = await axios.post(`${API_BASE}/consensus/propose`, { transactions });
      setBlockHash(response.data.blockHash);
      setResult({
        type: 'propose',
        data: response.data
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Vote on Block
  const voteOnBlock = async () => {
    if (!blockHash) {
      setError('Please propose a block first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/consensus/vote`, {
        blockHash: blockHash,
        isValid: true
      });
      
      setResult({
        type: 'vote',
        data: response.data
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sync Chain
  const syncChain = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/consensus/sync`, {
        peerNodeId: 'node-001',
        chainLength: 5
      });
      
      setResult({
        type: 'sync',
        data: response.data
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h3>Consensus Testing</h3>
      <p>Test block proposal, voting, and chain synchronization</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={proposeBlock}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Propose Block'}
        </button>
        
        <button
          onClick={voteOnBlock}
          disabled={loading || !blockHash}
          style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Vote on Block
        </button>
        
        <button
          onClick={syncChain}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Sync Chain
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '5px', marginBottom: '20px', color: '#721c24' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ padding: '15px', background: '#d4edda', borderRadius: '5px', marginTop: '20px' }}>
          <strong>Result ({result.type}):</strong>
          <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
        <strong>💡 How it works:</strong>
        <ul>
          <li><strong>Propose Block:</strong> Proposes a new block with transactions for network validation</li>
          <li><strong>Vote on Block:</strong> Votes on whether a proposed block is valid</li>
          <li><strong>Sync Chain:</strong> Synchronizes blockchain state with peer nodes</li>
        </ul>
        <p><strong>Note:</strong> Make sure the backend server is running on port 3000</p>
      </div>
    </div>
  );
}

