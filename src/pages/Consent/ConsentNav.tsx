/**
 * ConsentNav - Shared sub-navigation for consent pages
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/consent/config', label: 'Configuration' },
  { path: '/consent/dashboard', label: 'Dashboard' },
  { path: '/consent/logs', label: 'Logs' },
  { path: '/consent/audit', label: 'Audit' },
];

const ConsentNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === tab.path
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};

export default ConsentNav;
