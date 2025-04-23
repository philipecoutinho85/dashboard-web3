import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700 py-4 mt-8">
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        🔐 Este sistema é um MVP de assinatura digital com validação jurídica.
        <br />
        Desenvolvido por <strong>Philipe Coutinho</strong> —{' '}
        <a
          href="https://p.coutinho.com.br"
          className="text-[#ff385c] underline hover:text-red-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          p.coutinho.com.br
        </a>
      </div>
    </footer>
  );
};

export default Footer;
