import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Target,
  Star
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Analytics: React.FC = () => {
  const { orders, menuItems, reviews } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedChart, setSelectedChart] = useState('sales');

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const completedOrders = orders.filter(order => order.status === 'served');
  
  const analytics = useMemo(() => {
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount * 1.05), 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = new Set(orders.map(order => order.userId)).size;

    // Popular items
    const itemSales = new Map<string, { item: any, quantity: number, revenue: number }>();
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.id;
        const existing = itemSales.get(key) || { item, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemSales.set(key, existing);
      });
    });

    const popularItems = Array.from(itemSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Category performance
    const categoryPerformance = new Map<string, { revenue: number, orders: number }>();
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = categoryPerformance.get(item.category) || { revenue: 0, orders: 0 };
        existing.revenue += item.price * item.quantity;
        existing.orders += item.quantity;
        categoryPerformance.set(item.category, existing);
      });
    });

    const topCategories = Array.from(categoryPerformance.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Recent trends (simulated daily data)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = completedOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.totalAmount * 1.05), 0)
      });
    }

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      popularItems,
      topCategories,
      dailyData
    };
  }, [completedOrders, orders]);

  const exportData = () => {
    const data = {
      summary: {
        totalRevenue: analytics.totalRevenue,
        totalOrders: analytics.totalOrders,
        averageOrderValue: analytics.averageOrderValue,
        totalCustomers: analytics.totalCustomers
      },
      popularItems: analytics.popularItems,
      categoryPerformance: analytics.topCategories,
      dailyTrends: analytics.dailyData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your canteen's performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{analytics.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% from last period
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.totalOrders}</p>
              <p className="text-sm text-blue-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.3% from last period
              </p>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Order</p>
              <p className="text-2xl font-bold text-orange-600">₹{analytics.averageOrderValue.toFixed(2)}</p>
              <p className="text-sm text-orange-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3.7% from last period
              </p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.totalCustomers}</p>
              <p className="text-sm text-purple-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2% from last period
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedChart('sales')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedChart === 'sales'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedChart('orders')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedChart === 'orders'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {analytics.dailyData.map((day, index) => {
              const maxValue = selectedChart === 'sales' 
                ? Math.max(...analytics.dailyData.map(d => d.revenue))
                : Math.max(...analytics.dailyData.map(d => d.orders));
              const value = selectedChart === 'sales' ? day.revenue : day.orders;
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-sm text-gray-900 text-right">
                    {selectedChart === 'sales' ? `₹${day.revenue.toFixed(0)}` : `${day.orders} orders`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </div>

          <div className="space-y-4">
            {analytics.popularItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  {index + 1}
                </div>
                <img
                  src={item.item.image}
                  alt={item.item.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.item.name}</p>
                  <p className="text-sm text-gray-600">{item.quantity} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{item.revenue.toFixed(0)}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{item.item.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
            <PieChart className="w-5 h-5 text-gray-600" />
          </div>

          <div className="space-y-4">
            {analytics.topCategories.map((category, index) => {
              const maxRevenue = analytics.topCategories[0]?.revenue || 1;
              const percentage = (category.revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-600">₹{category.revenue.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{category.orders} items sold</span>
                    <span>{percentage.toFixed(1)}% of total revenue</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Reviews Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Feedback</h3>
            <Star className="w-5 h-5 text-gray-600" />
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (reviews.length > 0 ? Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) : 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{reviews.length} total reviews</p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = reviews.filter(review => review.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};