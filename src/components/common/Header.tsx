import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Bell, 
  User, 
  Settings as SettingsIcon,
  LogOut,
  ChefHat
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { CartDropdown } from './CartDropdown';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { cartItems, notifications } = useApp();
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogoClick = () => {
    onNavigate('profile');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleNotificationClick = () => {
    onNavigate('profile');
    setShowNotifications(false);
  };
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">UniFood</h1>
              <p className="text-xs text-gray-600">IIIT Kottayam</p>
            </div>
          </button>


          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {user?.role === 'student' && (
              <>
                {/* Cart */}
                <div className="relative">
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>

                  {showCart && (
                    <CartDropdown 
                      isOpen={showCart}
                      onClose={() => setShowCart(false)} 
                      onViewCart={() => {
                        onNavigate('cart');
                        setShowCart(false);
                      }} 
                    />
                  )}
                </div>
              </>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-[60]">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(showCart || showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-[45]" 
          onClick={() => {
            setShowCart(false);
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};