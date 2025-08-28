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
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('order-updated', (updatedOrder: Order) => {
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
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      if (status === 'READY' || status === 'SERVED') {
        setOrders(prev => prev.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                    <p className="text-gray-600">Table {order.table.tableNumber}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-1" />
                    {getOrderDuration(order.createdAt)}m ago
                  </div>
                </div>

                <div className={`inline-block px-3 py-1 rounded-full text-sm border mb-4 ${statusColors[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </div>

                <div className="space-y-2 mb-4">
                  {order.orderItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x {item.menuItem.name}</span>
                        {item.notes && (
                          <p className="text-sm text-gray-600 italic">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Confirm
                      </button>
                    )}
                    
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center"
                      >
                        Start Preparing
                      </button>
                    )}
                    
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        Mark Ready
                      </button>
                    )}
                    
                    <button
                      onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}