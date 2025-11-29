import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
import ContractInteraction from './components/ContractInteraction'
import './App.css'

// API base URL
const API_BASE = '/api'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <h1>AI Health Chains - Blockchain Assessment</h1>
            <nav>
              <Link to="/">Dashboard</Link>
              <Link to="/consent">Consent Management</Link>
              <Link to="/integrity">Data Integrity</Link>
              <Link to="/zk-proofs">ZK Proofs</Link>
              <Link to="/audit">Audit Trail</Link>
              <Link to="/consensus">Consensus</Link>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/consent" element={<ConsentManagement />} />
              <Route path="/integrity" element={<DataIntegrity />} />
              <Route path="/zk-proofs" element={<ZKProofs />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/consensus" element={<Consensus />} />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>AI Health Chains - Senior Blockchain Engineer Assessment</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

function Dashboard() {
  const [blockchainInfo, setBlockchainInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendAvailable, setBackendAvailable] = useState(false)

  useEffect(() => {
    fetchBlockchainInfo()
  }, [])

  const fetchBlockchainInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/blockchain/info`, {
        timeout: 3000, // 3 second timeout
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      })
      if (response.status === 200) {
        setBlockchainInfo(response.data)
        setBackendAvailable(true)
      } else {
        setBackendAvailable(false)
      }
    } catch (error) {
      // Silently handle all backend errors - backend is optional
      setBackendAvailable(false)
      // Don't log - backend is optional and errors are expected when it's not running
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <h2>Blockchain Dashboard</h2>
      
      {!backendAvailable && (
        <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>ℹ️ Backend not running</strong>
          <p>Start the backend server to see blockchain info. Contract interactions work without the backend.</p>
        </div>
      )}

      {loading ? (
        <p>Loading blockchain information...</p>
      ) : blockchainInfo ? (
        <div className="info-grid">
          <div className="info-card">
            <h3>Chain Length</h3>
            <p className="large-number">{blockchainInfo.chainLength}</p>
          </div>
          <div className="info-card">
            <h3>Total Transactions</h3>
            <p className="large-number">{blockchainInfo.totalTransactions}</p>
          </div>
          <div className="info-card">
            <h3>Node ID</h3>
            <p className="code">{blockchainInfo.nodeId}</p>
          </div>
          <div className="info-card">
            <h3>Network Nodes</h3>
            <p className="large-number">{blockchainInfo.networkNodes.length}</p>
          </div>
        </div>
      ) : (
        !backendAvailable && <p>Backend server is not running. Start it to see blockchain info.</p>
      )}

      <div className="features-overview">
        <h3>Features to Implement</h3>
        <ul>
          <li>✅ Consent Management - Smart contract for patient consent</li>
          <li>✅ Data Integrity - Merkle tree implementation</li>
          <li>✅ ZK Proofs - Zero-knowledge proof system</li>
          <li>✅ Audit Trail - Immutable logging</li>
          <li>✅ Consensus - Network agreement mechanism</li>
        </ul>
      </div>
    </div>
  )
}

function ConsentManagement() {
  return (
    <div className="feature-page">
      <h2>Consent Management</h2>
      <p className="feature-description">
        Interact with smart contracts directly from the frontend.
        Grant consent, revoke consent, and check consent status on the blockchain.
      </p>
      <ContractInteraction />
    </div>
  )
}

function DataIntegrity() {
  return (
    <div className="feature-page">
      <h2>Data Integrity</h2>
      <p className="feature-description">
        Implement Merkle tree data structure for tamper-evident record keeping.
        Generate and verify proofs for data integrity.
      </p>
      <div className="feature-status">
        <p>Status: <span className="status-pending">To be implemented</span></p>
        <p>See <code>server/src/features/data-integrity/</code> for implementation files.</p>
      </div>
    </div>
  )
}

function ZKProofs() {
  return (
    <div className="feature-page">
      <h2>Zero-Knowledge Proofs</h2>
      <p className="feature-description">
        Implement zero-knowledge proof system for permission verification
        without revealing underlying data.
      </p>
      <div className="feature-status">
        <p>Status: <span className="status-pending">To be implemented</span></p>
        <p>See <code>server/src/features/zk-proofs/</code> for implementation files.</p>
      </div>
    </div>
  )
}

function AuditTrail() {
  return (
    <div className="feature-page">
      <h2>Audit Trail</h2>
      <p className="feature-description">
        Implement immutable audit logging system that records all data access,
        consent changes, and AI diagnostic submissions on the blockchain.
      </p>
      <div className="feature-status">
        <p>Status: <span className="status-pending">To be implemented</span></p>
        <p>See <code>server/src/features/audit-trail/</code> for implementation files.</p>
      </div>
    </div>
  )
}

function Consensus() {
  return (
    <div className="feature-page">
      <h2>Consensus Mechanism</h2>
      <p className="feature-description">
        Implement consensus algorithm for transaction validation and block creation
        in the permissioned blockchain network.
      </p>
      <div className="feature-status">
        <p>Status: <span className="status-pending">To be implemented</span></p>
        <p>See <code>server/src/features/consensus/</code> for implementation files.</p>
      </div>
    </div>
  )
}

export default App

