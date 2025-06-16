import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            A free social service platform developed with ❤️ by{' '}
            <a
              href="https://www.lunorlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            >
              Lunor Labs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;