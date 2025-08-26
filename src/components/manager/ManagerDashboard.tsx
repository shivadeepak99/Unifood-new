import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ClipboardList, 
  Settings,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { InventoryManager } from './InventoryManager';
import { OrderManager } from './OrderManager';
import { Analytics } from './Analytics';

type TabType = 'overview' | 'orders' | 'inventory' | 'analytics';

export const ManagerDashboard: React.FC = () => {
  const { orders, menuItems } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const completedOrders = orders.filter(order => order.status === 'served');
  const activeOrders = orders.filter(order => 
    ['ordered', 'preparing', 'ready'].includes(order.status)
  );
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount * 1.05), 0);
  const outOfStockItems = menuItems.filter(item => !item.isAvailable);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Canteen Manager Dashboard</h1>
        <p className="text-blue-100">Manage your canteen operations efficiently</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-orange-600">{activeOrders.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menu Items</p>
              <p className="text-2xl font-bold text-blue-600">{menuItems.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold text-purple-600">{completedOrders.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {outOfStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Inventory Alert</h3>
              <p className="text-red-700">
                {outOfStockItems.length} items are currently out of stock and unavailable to customers.
              </p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Manage Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.token}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items • ₹{(order.totalAmount * 1.05).toFixed(0)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Package className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Add Menu Item</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <ClipboardList className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">View Analytics</span>
            </button>

            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-colors">
              <Settings className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {orders.filter(order => {
                const today = new Date().toDateString();
                const orderDate = new Date(order.createdAt).toDateString();
                return orderDate === today;
              }).length}
            </div>
            <p className="text-sm text-gray-600">Orders Today</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ₹{orders.filter(order => {
                const today = new Date().toDateString();
                const orderDate = new Date(order.createdAt).toDateString();
                return orderDate === today && order.status === 'served';
              }).reduce((sum, order) => sum + (order.totalAmount * 1.05), 0).toFixed(0)}
            </div>
            <p className="text-sm text-gray-600">Revenue Today</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Math.round(orders.filter(order => {
                const today = new Date().toDateString();
                const orderDate = new Date(order.createdAt).toDateString();
                return orderDate === today && order.status === 'served';
              }).reduce((sum, order) => sum + order.estimatedPreparationTime, 0) / Math.max(1, completedOrders.length))}m
            </div>
            <p className="text-sm text-gray-600">Avg Prep Time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <OrderManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'analytics':
        return <Analytics />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};