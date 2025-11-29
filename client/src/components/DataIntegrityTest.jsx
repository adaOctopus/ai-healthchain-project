import { useState } from 'react';
import axios from 'axios';

const API_BASE = '/api';

export default function DataIntegrityTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [treeRoot, setTreeRoot] = useState(null);

  // Create Merkle Tree
  const createTree = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const records = [
        'Record 1: Patient data',
        'Record 2: Medical history',
        'Record 3: Test results'
      ];
      
      const response = await axios.post(`${API_BASE}/integrity/tree`, { records });
      setTreeRoot(response.data.root);
      setResult({
        type: 'tree',
        data: response.data
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate Proof
  const generateProof = async () => {
    if (!treeRoot) {
      setError('Please create a tree first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const record = 'Record 1: Patient data';
      const response = await axios.post(`${API_BASE}/integrity/proof`, {
        record,
        root: treeRoot
      });
      
      setResult({
        type: 'proof',
        data: response.data
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Integrity
  const verifyIntegrity = async () => {
    if (!treeRoot) {
      setError('Please create a tree first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const record = 'Record 1: Patient data';
      
      // First get proof
      const proofRes = await axios.post(`${API_BASE}/integrity/proof`, {
        record,
        root: treeRoot
      });
      
      // Then verify
      const verifyRes = await axios.post(`${API_BASE}/integrity/verify`, {
        record,
        proof: proofRes.data.proof,
        root: treeRoot
      });
      
      setResult({
        type: 'verify',
        data: verifyRes.data
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h3>Data Integrity Testing</h3>
      <p>Test Merkle tree creation, proof generation, and verification</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={createTree}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Create Merkle Tree'}
        </button>
        
        <button
          onClick={generateProof}
          disabled={loading || !treeRoot}
          style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Generate Proof
        </button>
        
        <button
          onClick={verifyIntegrity}
          disabled={loading || !treeRoot}
          style={{ padding: '10px 20px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Verify Integrity
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '5px', marginBottom: '20px', color: '#721c24' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ padding: '15px', background: '#d4edda', borderRadius: '5px', marginTop: '20px' }}>
          <strong>Result:</strong>
          <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
        <strong>💡 How it works:</strong>
        <ul>
          <li><strong>Create Merkle Tree:</strong> Creates a Merkle tree from records and returns the root hash</li>
          <li><strong>Generate Proof:</strong> Generates a proof for a specific record in the tree</li>
          <li><strong>Verify Integrity:</strong> Verifies that a record is valid using its proof and the root</li>
        </ul>
        <p><strong>Note:</strong> Make sure the backend server is running on port 3000</p>
      </div>
    </div>
  );
}

