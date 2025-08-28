'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  menuItems: MenuItem[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface Table {
  id: string;
  tableNumber: string;
  restaurant: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
  };
}

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = params.restaurantId as string;
  const tableNumber = params.tableNumber as string;
  const sessionId = searchParams.get('session');

  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTableInfo();
    fetchMenu();
  }, [restaurantId, tableNumber]);

  const fetchTableInfo = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tables/scan/${restaurantId}/${tableNumber}?session=${sessionId}`
      );
      if (!response.ok) throw new Error('Table not found');
      const data = await response.json();
      setTable(data.table);
    } catch (err) {
      setError('Failed to load table information');
      console.error(err);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/menu/${restaurantId}`);
      if (!response.ok) throw new Error('Failed to load menu');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.menuItem.id !== menuItemId);
    });
  };

  const getCartItemQuantity = (menuItemId: string) => {
    const item = cart.find(item => item.menuItem.id === menuItemId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0 || !table) return;

    try {
      const orderData = {
        tableId: table.id,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      };

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const order = await response.json();
      alert(`Order submitted successfully! Order number: ${order.orderNumber}`);
      setCart([]);
    } catch (err) {
      alert('Failed to submit order. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{table?.restaurant.name}</h1>
              <p className="text-sm text-gray-600">Table {table?.tableNumber}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => cart.length > 0 && document.getElementById('cart-modal')?.classList.remove('hidden')}
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {categories.map(category => (
          <div key={category.id} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h2>
            <div className="space-y-4">
              {category.menuItems.map(item => {
                const quantity = getCartItemQuantity(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <p className="text-lg font-semibold text-blue-600 mt-2">
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {quantity > 0 && (
                          <>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                          </>
                        )}
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Cart Modal */}
      <div id="cart-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Order</h2>
              <button
                onClick={() => document.getElementById('cart-modal')?.classList.add('hidden')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={item.menuItem.id} className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <p className="font-medium">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-600">
                    Rp {item.menuItem.price.toLocaleString('id-ID')} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                Rp {getTotalAmount().toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={submitOrder}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}