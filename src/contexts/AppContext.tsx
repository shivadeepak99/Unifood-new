import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, CartItem, Order, Review, TimeSlot, Notification } from '../types';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Menu & Cart
  menuItems: MenuItem[];
  cartItems: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Orders
  orders: Order[];
  createOrder: (scheduledTime: string, specialInstructions?: string) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Reviews
  reviews: Review[];
  addReview: (menuItemId: string, rating: number, comment: string) => void;
  
  // Time Slots
  timeSlots: TimeSlot[];
  generateTimeSlots: () => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  
  // Manager functions
  addMenuItem: (item: Omit<MenuItem, 'id' | 'averageRating' | 'reviewCount'>) => void;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
  
  // Search & Filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Daily token reset
  generateDailyToken: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken pieces and traditional spices',
    price: 120,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/1247755/pexels-photo-1247755.jpeg',
    isVeg: false,
    cuisine: 'Indian',
    spiceLevel: 3,
    allergens: ['dairy'],
    nutritionalInfo: { calories: 450, protein: 25, carbs: 60, fat: 15 },
    isAvailable: true,
    ingredients: ['Chicken', 'Basmati Rice', 'Spices', 'Yogurt', 'Onions'],
    averageRating: 4.5,
    reviewCount: 23,
    preparationTime: 25
  },
  {
    id: '2',
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy tomato-based curry with soft paneer cubes',
    price: 100,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg',
    isVeg: true,
    cuisine: 'Indian',
    spiceLevel: 2,
    allergens: ['dairy'],
    nutritionalInfo: { calories: 320, protein: 18, carbs: 15, fat: 22 },
    isAvailable: true,
    ingredients: ['Paneer', 'Tomatoes', 'Cream', 'Spices', 'Onions'],
    averageRating: 4.3,
    reviewCount: 18,
    preparationTime: 20
  },
  {
    id: '3',
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato curry, served with chutney and sambar',
    price: 60,
    category: 'Breakfast',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg',
    isVeg: true,
    cuisine: 'South Indian',
    spiceLevel: 2,
    allergens: [],
    nutritionalInfo: { calories: 250, protein: 8, carbs: 45, fat: 6 },
    isAvailable: true,
    ingredients: ['Rice', 'Lentils', 'Potatoes', 'Spices'],
    averageRating: 4.7,
    reviewCount: 31,
    preparationTime: 15
  },
  {
    id: '4',
    name: 'Chicken Tikka',
    description: 'Marinated chicken pieces grilled to perfection in a tandoor oven',
    price: 150,
    category: 'Appetizer',
    image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
    isVeg: false,
    cuisine: 'Indian',
    spiceLevel: 3,
    allergens: ['dairy'],
    nutritionalInfo: { calories: 180, protein: 28, carbs: 5, fat: 6 },
    isAvailable: true,
    ingredients: ['Chicken', 'Yogurt', 'Spices', 'Lemon'],
    averageRating: 4.6,
    reviewCount: 27,
    preparationTime: 20
  },
  {
    id: '5',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime soda with mint leaves and a hint of black salt',
    price: 30,
    category: 'Beverages',
    image: 'https://images.pexels.com/photos/1304647/pexels-photo-1304647.jpeg',
    isVeg: true,
    cuisine: 'Indian',
    spiceLevel: 0,
    allergens: [],
    nutritionalInfo: { calories: 45, protein: 0, carbs: 12, fat: 0 },
    isAvailable: true,
    ingredients: ['Lime', 'Soda Water', 'Mint', 'Black Salt'],
    averageRating: 4.2,
    reviewCount: 15,
    preparationTime: 5
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(SAMPLE_MENU_ITEMS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('unifood_orders');
    const savedReviews = localStorage.getItem('unifood_reviews');
    const savedMenuItems = localStorage.getItem('unifood_menu');
    
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedMenuItems) setMenuItems(JSON.parse(savedMenuItems));
    
    generateTimeSlots();
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('unifood_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('unifood_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('unifood_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Generate slots from current time + 30 minutes to 10 PM
    for (let hour = currentHour; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip past time slots
        if (hour === currentHour && minute <= currentMinute + 30) continue;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: true,
          capacity: 20,
          booked: Math.floor(Math.random() * 10)
        });
      }
    }
    
    setTimeSlots(slots);
  };

  const addToCart = (item: MenuItem, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const generateDailyToken = (): string => {
    const today = new Date().toDateString();
    let tokenCount = parseInt(localStorage.getItem(`token_count_${today}`) || '0') + 1;
    localStorage.setItem(`token_count_${today}`, tokenCount.toString());
    return `${today.replace(/\s+/g, '').toUpperCase().slice(0, 8)}-${tokenCount.toString().padStart(3, '0')}`;
  };

  const createOrder = async (scheduledTime: string, specialInstructions?: string): Promise<string> => {
    if (!user || cartItems.length === 0) return '';

    const orderId = `ORDER_${Date.now()}`;
    const token = generateDailyToken();
    const estimatedTime = cartItems.reduce((total, item) => Math.max(total, item.preparationTime), 0);

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      items: [...cartItems],
      totalAmount: cartTotal,
      status: 'ordered',
      scheduledTime,
      token,
      createdAt: new Date(),
      specialInstructions,
      estimatedPreparationTime: estimatedTime
    };

    setOrders(prev => [...prev, newOrder]);
    clearCart();

    // Add notification
    addNotification({
      userId: user.id,
      title: 'Order Placed Successfully',
      message: `Your order #${token} has been placed and will be ready by ${scheduledTime}`,
      type: 'success',
      read: false
    });

    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          // Add notification for status change
          const statusMessages = {
            preparing: 'Your order is being prepared',
            ready: 'Your order is ready for pickup',
            served: 'Your order has been served',
            cancelled: 'Your order has been cancelled'
          };

          if (statusMessages[status]) {
            addNotification({
              userId: order.userId,
              title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
              message: `${statusMessages[status]} - Token: ${order.token}`,
              type: status === 'cancelled' ? 'error' : 'info',
              read: false
            });
          }

          return { ...order, status };
        }
        return order;
      })
    );
  };

  const addReview = (menuItemId: string, rating: number, comment: string) => {
    if (!user) return;

    const newReview: Review = {
      id: `review_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      menuItemId,
      rating,
      comment,
      createdAt: new Date()
    };

    setReviews(prev => [...prev, newReview]);

    // Update menu item rating
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === menuItemId) {
          const itemReviews = [...reviews.filter(r => r.menuItemId === menuItemId), newReview];
          const averageRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
          return {
            ...item,
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount: itemReviews.length
          };
        }
        return item;
      })
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Manager functions
  const addMenuItem = (item: Omit<MenuItem, 'id' | 'averageRating' | 'reviewCount'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item_${Date.now()}`,
      averageRating: 0,
      reviewCount: 0
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <AppContext.Provider value={{
      // Menu & Cart
      menuItems,
      cartItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,

      // Orders
      orders,
      createOrder,
      updateOrderStatus,

      // Reviews
      reviews,
      addReview,

      // Time Slots
      timeSlots,
      generateTimeSlots,

      // Notifications
      notifications,
      addNotification,
      markNotificationRead,

      // Manager functions
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,

      // Search & Filter
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,

      // Utilities
      generateDailyToken
    }}>
      {children}
    </AppContext.Provider>
  );
};