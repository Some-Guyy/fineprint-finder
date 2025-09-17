import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Search, 
  Brain, 
  Bell,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  // { name: 'Dashboard (old)', href: '/dashboard', icon: Home },
  // { name: 'Scraping Management', href: '/scraping', icon: Search },
  // { name: 'Upload Documents', href: '/upload', icon: Upload },
  // { name: 'Change Detection', href: '/changes', icon: Activity },
  // { name: 'LLM Analysis', href: '/analysis', icon: Brain },
  // { name: 'Alerts & Settings', href: '/alerts', icon: Bell },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Regulatory Monitor
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium space-x-2',
                      isActive
                        ? 'text-indigo-600 border-b-2 border-indigo-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
