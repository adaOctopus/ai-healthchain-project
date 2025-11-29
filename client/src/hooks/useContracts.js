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
  const [loading, setLoading] = useState(false);

  // Don't initialize provider automatically - wait for user to connect
  // This prevents errors when MetaMask or local node isn't available

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

  // Switch to correct network (Sepolia or Local) - OPTIONAL, user can call this manually
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    
    // Only switch if we're using Sepolia (not localhost)
    if (NETWORK_ID !== 11155111) {
      throw new Error('Network switching only available for Sepolia');
    }
    
    try {
      const chainId = '0xaa36a7'; // Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it (for Sepolia)
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: [RPC_URL || 'https://rpc.sepolia.org'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
        } catch (addError) {
          throw new Error('Could not add Sepolia network. Please add it manually in MetaMask.');
        }
      } else if (switchError.code === 4001) {
        throw new Error('Network switch was rejected.');
      } else {
        throw switchError;
      }
    }
  }, []);

  // Connect to MetaMask or use local account
  const connectWallet = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Check if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        // Fallback: Use local Hardhat account (only if localhost)
        if (RPC_URL.includes('localhost') || RPC_URL.includes('127.0.0.1')) {
          try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const wallet = new ethers.Wallet(
              '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
              provider
            );
            
            setProvider(provider);
            setSigner(wallet);
            setAccount(wallet.address);
            setIsConnected(true);
            setError(null);
            setLoading(false);
            return;
          } catch (err) {
            setError('Failed to connect to local node: ' + err.message);
            setLoading(false);
            return;
          }
        } else {
          setError('MetaMask not found. Please install MetaMask.');
          setLoading(false);
          return;
        }
      }

      // MetaMask is available - connect to it
      // Handle multiple providers (some users have multiple wallets)
      let ethereum = window.ethereum;
      
      // If multiple providers, prefer MetaMask
      if (window.ethereum?.providers) {
        ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
      } else if (window.ethereum && !window.ethereum.isMetaMask) {
        // Not MetaMask, but might still work
        console.warn('Non-MetaMask wallet detected, attempting connection anyway');
      }
      
      if (!ethereum) {
        setError('No Ethereum provider found. Please install MetaMask.');
        setLoading(false);
        return;
      }

      try {
        // Check if MetaMask is ready - wait a bit if needed
        if (!ethereum.isConnected || !ethereum._state) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Try to get existing accounts first (doesn't trigger popup)
        let accounts = [];
        try {
          accounts = await ethereum.request({ method: 'eth_accounts' });
        } catch (e) {
          // Ignore - will request new connection below
        }

        // If no accounts, request connection
        if (!accounts || accounts.length === 0) {
          try {
            accounts = await ethereum.request({ 
              method: 'eth_requestAccounts'
            });
          } catch (reqError) {
            // MetaMask specific error handling
            if (reqError.code === 4001) {
              throw new Error('Connection rejected by user');
            } else if (reqError.code === -32002) {
              throw new Error('Connection request already pending. Check MetaMask.');
            } else {
              // Log full error for debugging
              console.error('Full MetaMask error:', reqError);
              throw new Error(`MetaMask error: ${reqError.message || reqError.code || JSON.stringify(reqError)}`);
            }
          }
        }
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned. Please unlock MetaMask.');
        }

        const address = accounts[0];
        console.log('Connected account:', address);
        
        // Create provider - this might fail if MetaMask is in bad state
        let provider;
        try {
          provider = new ethers.BrowserProvider(ethereum);
        } catch (providerError) {
          throw new Error(`Failed to create provider: ${providerError.message}`);
        }
        
        // Get signer
        let signer;
        try {
          signer = await provider.getSigner();
        } catch (signerError) {
          throw new Error(`Failed to get signer: ${signerError.message}`);
        }
        
        // Verify address
        let signerAddress;
        try {
          signerAddress = await signer.getAddress();
        } catch (addrError) {
          throw new Error(`Failed to get address: ${addrError.message}`);
        }
        
        if (signerAddress.toLowerCase() !== address.toLowerCase()) {
          console.warn('Address mismatch:', signerAddress, 'vs', address);
        }
        
        setProvider(provider);
        setSigner(signer);
        setAccount(signerAddress);
        setIsConnected(true);
        setError(null);
        console.log('Successfully connected to MetaMask');
      } catch (requestError) {
        console.error('MetaMask connection error:', requestError);
        const errorMsg = requestError.message || 'Unknown error';
        setError(`MetaMask connection failed: ${errorMsg}. Make sure MetaMask is unlocked and try again.`);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
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
    loading,
    connectWallet,
    disconnect,
    switchNetwork
  };
}

