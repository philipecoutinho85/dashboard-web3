// src/hooks/useWallet.js
import { useState, useEffect } from 'react';

const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('⚠️ MetaMask não está instalada!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      alert('❌ Falha ao conectar carteira. Verifique se a MetaMask está desbloqueada.');
    }
  };

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };

    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0] || '');
      });
    }
  }, []);

  return { walletAddress, connectWallet };
};

export default useWallet;
