import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full text-center py-4 border-t border-gray-200 dark:border-gray-700 mt-12 text-sm text-gray-600 dark:text-gray-400">
      MVP desenvolvido por <strong>Philipe Coutinho</strong> —{' '}
      <a
        href="https://p.coutinho.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#ff385c] hover:underline"
      >
        p.coutinho.com.br
      </a>
    </footer>
  );
};

export default Footer;
