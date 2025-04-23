// src/hooks/useWallet.js
import { useState, useEffect } from 'react';

const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('⚠️ MetaMask não está instalada!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error('Erro ao conectar carteira:', err);
      alert('❌ Falha ao conectar carteira.');
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };

    checkWalletConnection();

    // Atualiza automaticamente se usuário mudar de conta
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0] || '');
      });
    }
  }, []);

  return { walletAddress, connectWallet };
};

export default useWallet;
