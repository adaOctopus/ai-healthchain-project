import { useState } from 'react';
import axios from 'axios';

const API_BASE = '/api';

export default function ZKProofsTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [proof, setProof] = useState(null);

  // Generate Consent Proof
  const generateConsentProof = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/zk/consent-proof`, {
        patientId: 'patient-001',
        clinicianId: 'clinician-001',
        consentType: 'DataAccess'
      });
      
      const proofData = response.data?.proof || response.data?.data?.proof || response.proof;
      if (proofData) setProof(proofData);
      setResult({
        type: 'consent-proof',
        data: response.data || response
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Verify Consent Proof
  const verifyConsentProof = async () => {
    if (!proof) {
      setError('Please generate a proof first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/zk/verify-consent`, {
        proof: proof,
        expectedRoot: 'expected-root-hash'
      });
      
      setResult({
        type: 'verify-consent',
        data: response.data || response
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Generate Permission Proof
  const generatePermissionProof = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/zk/permission-proof`, {
        actorId: 'clinician-001',
        resourceId: 'patient-record-123',
        permission: 'read'
      });
      
      const proofData = response.data?.proof || response.data?.data?.proof || response.proof;
      if (proofData) setProof(proofData);
      setResult({
        type: 'permission-proof',
        data: response.data || response
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Verify Permission Proof
  const verifyPermissionProof = async () => {
    if (!proof) {
      setError('Please generate a proof first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/zk/verify-permission`, {
        proof: proof,
        expectedRoot: 'expected-root-hash'
      });
      
      setResult({
        type: 'verify-permission',
        data: response.data || response
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h3>Zero-Knowledge Proofs Testing</h3>
      <p>Test ZK proof generation and verification for consent and permissions</p>

      <div style={{ marginBottom: '30px' }}>
        <h4>Consent Proofs</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={generateConsentProof}
            disabled={loading}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processing...' : 'Generate Consent Proof'}
          </button>
          
          <button
            onClick={verifyConsentProof}
            disabled={loading || !proof}
            style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            Verify Consent Proof
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4>Permission Proofs</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={generatePermissionProof}
            disabled={loading}
            style={{ padding: '10px 20px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            Generate Permission Proof
          </button>
          
          <button
            onClick={verifyPermissionProof}
            disabled={loading || !proof}
            style={{ padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            Verify Permission Proof
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '5px', marginBottom: '20px', color: '#721c24' }}>
          <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
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
          <li><strong>Generate Consent Proof:</strong> Creates a ZK proof that consent exists without revealing details</li>
          <li><strong>Verify Consent Proof:</strong> Verifies the proof is valid</li>
          <li><strong>Generate Permission Proof:</strong> Creates a ZK proof for resource access permissions</li>
          <li><strong>Verify Permission Proof:</strong> Verifies the permission proof is valid</li>
        </ul>
        <p><strong>Note:</strong> Make sure the backend server is running on port 3000</p>
      </div>
    </div>
  );
}

