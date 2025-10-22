import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Upload,
  Search,
  Brain,
  Bell,
  Activity,
  CheckSquare,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Changes Overview', href: '/changes-overview', icon: CheckSquare },
  // { name: 'Dashboard (old)', href: '/dashboard', icon: Home },
  // { name: 'Scraping Management', href: '/scraping', icon: Search },
  // { name: 'Upload Documents', href: '/upload', icon: Upload },
  // { name: 'Change Detection', href: '/changes', icon: Activity },
  // { name: 'LLM Analysis', href: '/analysis', icon: Brain },
  // { name: 'Alerts & Settings', href: '/alerts', icon: Bell },
];

interface NavigationProps {
  setIsAuthenticated?: (value: boolean) => void;
}

export function Navigation({ setIsAuthenticated }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState<string>("");

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsername(user.username);
    }
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('user');

    // Set authentication state to false
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }

    // Navigate to login page
    navigate('/login');
  };

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
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Welcome, {username}
            </span>
            <Button
              variant={"ghost"}
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
