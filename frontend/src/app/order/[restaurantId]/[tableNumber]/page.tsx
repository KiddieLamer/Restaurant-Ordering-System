'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, ImageIcon, Search, Bell, Menu, User, X } from 'lucide-react';

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
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const tableNumber = params.tableNumber as string;
  const sessionId = searchParams.get('session');

  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchTableInfo();
    fetchMenu();
  }, [restaurantId, tableNumber]);

  useEffect(() => {
    // Filter categories based on search query
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.map(category => ({
        ...category,
        menuItems: category.menuItems.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.menuItems.length > 0);
      setFilteredCategories(filtered);
    }
  }, [categories, searchQuery]);

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
      setFilteredCategories(data);
    } catch (err) {
      setError('Failed to load menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (customerName.trim()) {
      setShowNameModal(false);
      localStorage.setItem(`customerName_${restaurantId}_${tableNumber}`, customerName);
    }
  };

  // Check if name already saved
  useEffect(() => {
    const savedName = localStorage.getItem(`customerName_${restaurantId}_${tableNumber}`);
    if (savedName) {
      setCustomerName(savedName);
      setShowNameModal(false);
    }
  }, [restaurantId, tableNumber]);

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
        customerName: customerName,
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
      
      // Redirect to order tracking page
      router.push(`/track/${order.id}`);
      
      // Show success message briefly
      alert(`Order submitted! Redirecting to order tracking...`);
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

  const renderContent = () => {
    if (activeTab === 'search') {
      return (
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari menu favorit Anda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {searchQuery.trim() && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Hasil pencarian untuk "{searchQuery}"
              </p>
            </div>
          )}

          {filteredCategories.map(category => (
            <div key={category.id} className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h2>
              <div className="space-y-4">
                {category.menuItems.map(item => {
                  const quantity = getCartItemQuantity(item.id);
                  return (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Menu Item Image */}
                      <div className="relative h-48 bg-gray-100">
                        {item.image ? (
                          <img
                            src={`http://localhost:3001${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-gray-400" size={48} />
                          </div>
                        )}
                      </div>
                      
                      {/* Menu Item Content */}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
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
                                  className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                              </>
                            )}
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'cart') {
      return (
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Keranjang Belanja</h2>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="text-gray-400 mx-auto mb-4" size={64} />
              <p className="text-gray-500 text-lg">Keranjang masih kosong</p>
              <p className="text-gray-400 text-sm">Mulai pesan menu favorit Anda!</p>
              <button
                onClick={() => setActiveTab('menu')}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg"
              >
                Lihat Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.menuItem.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.menuItem.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Rp {item.menuItem.price.toLocaleString('id-ID')} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(item.menuItem.id)}
                          className="bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.menuItem)}
                          className="bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="font-semibold text-blue-600">
                        Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-blue-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    Rp {getTotalAmount().toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  onClick={submitOrder}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'status') {
      return (
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Status Pesanan</h2>
          <div className="text-center py-12">
            <Bell className="text-gray-400 mx-auto mb-4" size={64} />
            <p className="text-gray-500 text-lg">Belum ada pesanan aktif</p>
            <p className="text-gray-400 text-sm">Pesanan Anda akan muncul di sini</p>
          </div>
        </div>
      );
    }

    // Default: Menu tab
    return (
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {filteredCategories.map(category => (
          <div key={category.id} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h2>
            <div className="space-y-4">
              {category.menuItems.map(item => {
                const quantity = getCartItemQuantity(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Menu Item Image */}
                    <div className="relative h-48 bg-gray-100">
                      {item.image ? (
                        <img
                          src={`http://localhost:3001${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="text-gray-400" size={48} />
                        </div>
                      )}
                    </div>
                    
                    {/* Menu Item Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
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
                                className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                            </>
                          )}
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{table?.restaurant.name}</h1>
              <p className="text-sm text-gray-600">
                Table {table?.tableNumber} • {customerName && `Halo, ${customerName}!`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {cart.length > 0 && (
                <div className="relative">
                  <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center absolute -top-2 -right-2 z-10">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setCustomerName('');
                  setShowNameModal(true);
                  localStorage.removeItem(`customerName_${restaurantId}_${tableNumber}`);
                }}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                title="Change name"
              >
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'menu' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Menu size={24} />
              <span className="text-xs mt-1">Menu</span>
            </button>
            
            <button
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'search' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Search size={24} />
              <span className="text-xs mt-1">Cari</span>
            </button>
            
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${
                activeTab === 'cart' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <ShoppingCart size={24} />
              <span className="text-xs mt-1">Keranjang</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('status')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'status' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Bell size={24} />
              <span className="text-xs mt-1">Status</span>
            </button>
          </div>
        </div>
      </div>

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

      {/* Customer Name Modal */}
      {(showNameModal || !customerName) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-blue-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Selamat Datang!
              </h2>
              <p className="text-gray-600 text-sm">
                Silakan masukkan nama Anda untuk pengalaman yang lebih personal
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Masukkan nama Anda..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                maxLength={50}
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
              
              <button
                onClick={handleNameSubmit}
                disabled={!customerName.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Mulai Memesan
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Nama Anda akan membantu staff restaurant memberikan pelayanan terbaik
            </p>
          </div>
        </div>
      )}
    </div>
  );
}