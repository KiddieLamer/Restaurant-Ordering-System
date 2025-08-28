'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Clock } from 'lucide-react';

interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

interface Analytics {
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  topMenuItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailySales: DailySales[];
}

export default function AdminDashboard() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId]);

  const fetchAnalytics = async () => {
    try {
      // Mock data for demo - in real app, this would fetch from API
      const mockAnalytics: Analytics = {
        todayRevenue: 2500000,
        todayOrders: 45,
        monthlyRevenue: 45000000,
        monthlyOrders: 850,
        topMenuItems: [
          { name: 'Nasi Goreng Spesial', quantity: 32, revenue: 960000 },
          { name: 'Ayam Bakar', quantity: 28, revenue: 980000 },
          { name: 'Sate Kambing', quantity: 25, revenue: 750000 },
          { name: 'Gado-Gado', quantity: 22, revenue: 440000 },
          { name: 'Es Teh Manis', quantity: 67, revenue: 335000 }
        ],
        dailySales: [
          { date: '2024-01-20', revenue: 2200000, orders: 38 },
          { date: '2024-01-21', revenue: 2800000, orders: 52 },
          { date: '2024-01-22', revenue: 1900000, orders: 31 },
          { date: '2024-01-23', revenue: 3200000, orders: 58 },
          { date: '2024-01-24', revenue: 2600000, orders: 47 },
          { date: '2024-01-25', revenue: 2900000, orders: 55 },
          { date: '2024-01-26', revenue: 2500000, orders: 45 }
        ]
      };
      
      setTimeout(() => {
        setAnalytics(mockAnalytics);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Analytics</h1>
          <p className="text-gray-600">Monitor your restaurant performance and insights</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {analytics.todayRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.todayOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {analytics.monthlyRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.monthlyOrders}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID')}
                />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Menu Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Menu Items</h3>
            <div className="space-y-4">
              {analytics.topMenuItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Rp {item.revenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View All Orders
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Manage Menu
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Generate QR Codes
            </button>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}