import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package,
  AlertCircle,
  RefreshCw,
  Star,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';

export const OrderTracking: React.FC = () => {
  const { user } = useAuth();
  const { orders, reviews, addReview } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', itemId: '' });

  const userOrders = orders
    .filter(order => order.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeOrders = userOrders.filter(order => 
    ['ordered', 'preparing', 'ready'].includes(order.status)
  );

  const completedOrders = userOrders.filter(order => 
    ['served', 'cancelled'].includes(order.status)
  );

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // This would be replaced with actual WebSocket updates
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'ordered':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'ready':
        return <Truck className="w-5 h-5 text-green-500" />;
      case 'served':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimatedTime = (order: Order) => {
    const orderTime = new Date(order.createdAt);
    const scheduledTime = new Date(`${orderTime.toDateString()} ${order.scheduledTime}`);
    const now = new Date();

    if (order.status === 'served') return 'Completed';
    if (order.status === 'cancelled') return 'Cancelled';
    if (scheduledTime < now && order.status === 'ready') return 'Ready for pickup';
    
    const diffMinutes = Math.max(0, Math.ceil((scheduledTime.getTime() - now.getTime()) / (1000 * 60)));
    
    if (diffMinutes === 0) return 'Ready soon';
    return `Ready in ${diffMinutes}m`;
  };

  const handleReview = (itemId: string) => {
    setReviewData({ ...reviewData, itemId });
    setShowReviewModal(true);
  };

  const submitReview = () => {
    addReview(reviewData.itemId, reviewData.rating, reviewData.comment);
    setShowReviewModal(false);
    setReviewData({ rating: 5, comment: '', itemId: '' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Orders</h2>
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.token}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{getEstimatedTime(order)}</p>
                    </div>
                  </div>

                  {/* Order Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm text-gray-600">Pickup: {order.scheduledTime}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          order.status === 'ordered' ? 'bg-blue-500 w-1/4' :
                          order.status === 'preparing' ? 'bg-orange-500 w-2/4' :
                          order.status === 'ready' ? 'bg-green-500 w-3/4' :
                          'bg-green-600 w-full'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-lg font-semibold text-gray-900">
                      Total: ₹{(order.totalAmount * 1.05).toFixed(2)}
                    </p>
                    {order.status === 'ready' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <p className="text-sm font-medium text-green-800">
                          Ready for pickup! Show token: {order.token}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order History</h2>
          {completedOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed orders yet</h3>
              <p className="text-gray-600">Your completed orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.token}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        ₹{(order.totalAmount * 1.05).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                          {order.status === 'served' && !reviews.some(r => r.menuItemId === item.id && r.userId === user?.id) && (
                            <button
                              onClick={() => handleReview(item.id)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <Star className="w-4 h-4" />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === 'served' && (
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Reorder
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setReviewData({ ...reviewData, rating })}
                        className={`p-1 ${rating <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Share your experience..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};