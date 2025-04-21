import { useEffect, useState } from 'react';

export default function useWallet() {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error('Erro ao conectar carteira:', err);
      }
    } else {
      alert('MetaMask não encontrada. Instale para continuar.');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0] || null);
      });
    }
  }, []);

  return { walletAddress, connectWallet };
}
