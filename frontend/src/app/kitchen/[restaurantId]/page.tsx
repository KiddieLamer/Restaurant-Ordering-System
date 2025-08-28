'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import io from 'socket.io-client';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem: {
    id: string;
    name: string;
    description?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  table: {
    tableNumber: string;
  };
  orderItems: OrderItem[];
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
  READY: 'bg-green-100 text-green-800 border-green-200',
  SERVED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
};

export default function KitchenDashboard() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    fetchKitchenOrders();
    
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('join-kitchen');

    newSocket.on('new-order', (order: Order) => {
      console.log('📨 Kitchen received new-order:', order.orderNumber);
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('order-updated', (updatedOrder: Order) => {
      console.log('📨 Kitchen received order-updated:', updatedOrder.orderNumber, 'status:', updatedOrder.status);
      setOrders(prev => 
        prev.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [restaurantId]);

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/kitchen/${restaurantId}`);
      if (!response.ok) throw new Error('Failed to load orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to: ${status}`);
      
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      console.log(`✅ Successfully updated order status to: ${status}`);
      
      if (status === 'READY' || status === 'SERVED') {
        console.log(`🗑️ Removing order from kitchen view (status: ${status})`);
        setOrders(prev => prev.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getOrderDuration = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Dashboard</h1>
          <p className="text-gray-600">Active Orders: {orders.length}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-xl">No active orders</p>
            <p className="text-gray-500 mt-2">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map(order => {
              const duration = getOrderDuration(order.createdAt);
              const isUrgent = duration > 15;
              
              return (
                <div 
                  key={order.id} 
                  className={`bg-white border-l-4 shadow-lg transform transition-all hover:scale-105 ${
                    order.status === 'PENDING' ? 'border-yellow-400 bg-yellow-50' :
                    order.status === 'CONFIRMED' ? 'border-blue-400 bg-blue-50' :
                    order.status === 'PREPARING' ? 'border-orange-400 bg-orange-50' :
                    'border-green-400 bg-green-50'
                  } ${isUrgent ? 'ring-2 ring-red-300 animate-pulse' : ''}`}
                  style={{
                    fontFamily: 'monospace',
                    backgroundImage: `repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 98%,
                      #e5e7eb 100%
                    )`
                  }}
                >
                  {/* Ticket Header */}
                  <div className="bg-white p-3 border-b-2 border-dashed border-gray-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 tracking-wider">
                          #{order.orderNumber.split('-')[1]}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          🪑 TABLE {order.table.tableNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                          isUrgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          ⏰ {duration}min
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="p-3 pb-2">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColors[order.status]}`}>
                      {order.status === 'PENDING' && '🔔 MENUNGGU KONFIRMASI'}
                      {order.status === 'CONFIRMED' && '✅ DIKONFIRMASI'}
                      {order.status === 'PREPARING' && '👨‍🍳 SEDANG DIMASAK'}
                      {order.status === 'READY' && '🍽️ SIAP DIANTAR'}
                    </div>
                  </div>

                  {/* Order Items - Ticket Style */}
                  <div className="px-3 pb-3">
                    <div className="bg-white p-3 border border-dashed border-gray-300 font-mono text-sm">
                      <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                        <p className="font-bold text-center">📋 ORDER DETAILS</p>
                      </div>
                      
                      {order.orderItems.map((item, index) => (
                        <div key={item.id} className="mb-2 last:mb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="font-bold text-gray-800">
                                {item.quantity}x {item.menuItem.name}
                              </span>
                              {item.notes && (
                                <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1 border-l-2 border-orange-400">
                                  📝 {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          {index < order.orderItems.length - 1 && (
                            <div className="border-b border-dotted border-gray-300 mt-2"></div>
                          )}
                        </div>
                      ))}
                      
                      <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-gray-800">
                          <span>TOTAL:</span>
                          <span>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 bg-gray-50 border-t border-dashed border-gray-300">
                    <div className="space-y-2">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center font-bold text-sm transition-colors"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          ✅ TERIMA PESANAN
                        </button>
                      )}
                      
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center font-bold text-sm transition-colors"
                        >
                          👨‍🍳 MULAI MASAK
                        </button>
                      )}
                      
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'READY')}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center font-bold text-sm transition-colors"
                        >
                          🍽️ SIAP DIANTAR
                        </button>
                      )}
                      
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                        className="w-full bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        <XCircle size={14} className="mr-1" />
                        ❌ BATAL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}