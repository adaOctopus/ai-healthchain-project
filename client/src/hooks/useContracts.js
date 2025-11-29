import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, RPC_URL, NETWORK_ID } from '../config/contracts';

/**
 * React hook for interacting with deployed smart contracts
 * 
 * Usage:
 *   const { provider, signer, contracts, connectWallet, isConnected } = useContracts();
 */
export function useContracts() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  // Initialize provider (connect to Hardhat node)
  useEffect(() => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      setProvider(provider);
    } catch (err) {
      setError('Failed to connect to blockchain: ' + err.message);
    }
  }, []);

  // Load contract ABIs and create contract instances
  useEffect(() => {
    if (!provider || !signer) return;

    async function loadContracts() {
      try {
        // For now, we'll use minimal ABIs (you can expand these)
        // In production, you'd load full ABIs from artifacts
        
        const consentABI = [
          "function grantConsent(address,address,uint8,uint64,uint32) returns(bytes32)",
          "function revokeConsent(bytes32)",
          "function hasValidConsent(address,address,uint8) view returns(bool)",
          "function getConsent(bytes32) view returns(tuple(bytes32,address,address,uint8,uint8,uint64,uint64,uint32))",
          "function version() pure returns(string)",
          "event ConsentGranted(bytes32 indexed,address indexed,address indexed,uint8,uint64,uint64)"
        ];

        const auditABI = [
          "function logDataAccess(address,bytes32,bool,string) returns(bytes32)",
          "function logConsentChange(address,bytes32,string) returns(bytes32)",
          "function logAIDiagnostic(bytes32,bytes32,uint16) returns(bytes32)",
          "function getResourceAuditTrail(bytes32) view returns(bytes32[])",
          "event AuditLogged(bytes32 indexed,uint8 indexed,address indexed,bytes32,uint64,bool,string)"
        ];

        const integrityABI = [
          "function storeMerkleRoot(bytes32,bytes32,uint32) returns(bool)",
          "function verifyMerkleRoot(bytes32) view returns(bool,tuple)",
          "function getTotalRoots() view returns(uint256)"
        ];

        const consentContract = new ethers.Contract(
          CONTRACT_ADDRESSES.ConsentManagement,
          consentABI,
          signer
        );

        const auditContract = new ethers.Contract(
          CONTRACT_ADDRESSES.AuditTrail,
          auditABI,
          signer
        );

        const integrityContract = new ethers.Contract(
          CONTRACT_ADDRESSES.DataIntegrity,
          integrityABI,
          signer
        );

        setContracts({
          consent: consentContract,
          audit: auditContract,
          integrity: integrityContract
        });
      } catch (err) {
        setError('Failed to load contracts: ' + err.message);
      }
    }

    loadContracts();
  }, [provider, signer]);

  // Switch to correct network (Sepolia or Local)
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = NETWORK_ID === 11155111 ? '0xaa36a7' : '0x7a69'; // Sepolia or Local
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it (for Sepolia)
      if (switchError.code === 4902 && NETWORK_ID === 11155111) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: [RPC_URL],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  }, []);

  // Connect to MetaMask or use local account
  const connectWallet = useCallback(async () => {
    try {
      if (window.ethereum) {
        // Switch to correct network first
        await switchNetwork();
        
        // Use MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(address);
        setIsConnected(true);
        setError(null);
      } else {
        // Fallback: Use local Hardhat account
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        // Use first Hardhat account (you can change this)
        const wallet = new ethers.Wallet(
          '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
          provider
        );
        
        setProvider(provider);
        setSigner(wallet);
        setAccount(wallet.address);
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      setError('Failed to connect: ' + err.message);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    setSigner(null);
    setAccount(null);
    setIsConnected(false);
  }, []);

  return {
    provider,
    signer,
    contracts,
    isConnected,
    account,
    error,
    connectWallet,
    disconnect,
    switchNetwork
  };
}

