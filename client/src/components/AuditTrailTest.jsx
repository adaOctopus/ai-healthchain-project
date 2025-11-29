import { useState } from 'react';
import axios from 'axios';

const API_BASE = '/api';

export default function AuditTrailTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Log Data Access
  const logDataAccess = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/audit/data-access`, {
        actorId: 'clinician-001',
        resourceId: 'patient-record-123',
        resourceType: 'medical_record',
        granted: true,
        reason: 'Treatment planning',
        metadata: { timestamp: new Date().toISOString() }
      });
      
      setResult({
        type: 'data-access',
        data: response.data || response
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Log Consent Change
  const logConsentChange = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/audit/consent`, {
        consentId: 'consent-123',
        action: 'granted',
        actorId: 'patient-001',
        patientId: 'patient-001',
        clinicianId: 'clinician-001',
        consentType: 'DataAccess',
        metadata: { timestamp: new Date().toISOString() }
      });
      
      setResult({
        type: 'consent',
        data: response.data || response
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Log AI Diagnostic
  const logAIDiagnostic = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/audit/ai-diagnostic`, {
        recordId: 'record-123',
        diagnosticId: 'diagnostic-456',
        confidence: 95,
        metadata: { model: 'AI-Model-v1', timestamp: new Date().toISOString() }
      });
      
      setResult({
        type: 'ai-diagnostic',
        data: response.data || response
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Query Audit Trail
  const queryAuditTrail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.get(`${API_BASE}/audit/query`, {
        params: {
          resourceId: 'patient-record-123',
          resourceType: 'medical_record',
          limit: 10
        }
      });
      
      setResult({
        type: 'query',
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
      <h3>Audit Trail Testing</h3>
      <p>Test immutable audit logging for data access, consent changes, and AI diagnostics</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={logDataAccess}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Log Data Access'}
        </button>
        
        <button
          onClick={logConsentChange}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Log Consent Change
        </button>
        
        <button
          onClick={logAIDiagnostic}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Log AI Diagnostic
        </button>
        
        <button
          onClick={queryAuditTrail}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Query Audit Trail
        </button>
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
          <li><strong>Log Data Access:</strong> Records when someone accesses patient data</li>
          <li><strong>Log Consent Change:</strong> Records when consent is granted/revoked</li>
          <li><strong>Log AI Diagnostic:</strong> Records AI diagnostic submissions</li>
          <li><strong>Query Audit Trail:</strong> Retrieves audit logs for a resource</li>
        </ul>
        <p><strong>Note:</strong> Make sure the backend server is running on port 3000</p>
      </div>
    </div>
  );
}

