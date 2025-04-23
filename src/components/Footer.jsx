import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          🔐 Este sistema é um <strong>MVP</strong> de assinatura digital com validade jurídica.
          <br className="hidden sm:block" />
          Desenvolvido por <strong>Philipe Coutinho</strong> —{' '}
          <a
            href="https://p.coutinho.com.br"
            className="text-[#ff385c] underline hover:text-red-500 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            p.coutinho.com.br
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
