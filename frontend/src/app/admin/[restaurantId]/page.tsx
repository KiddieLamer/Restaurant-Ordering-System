'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Clock, AlertTriangle, Package, Wallet, Plus, Minus, Calendar, Edit3 } from 'lucide-react';

interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

interface TopMenuItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface CashFlow {
  income: number;
  expense: number;
  netIncome: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stockQuantity: number;
  minStockAlert: number;
  unit: string;
}

interface Analytics {
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  topMenuItems: TopMenuItem[];
  dailySales: DailySales[];
  salesPeriod: string;
  intervalLabel: string;
  cashflow: CashFlow;
  lowStockItems: LowStockItem[];
}

interface StockItem {
  id: string;
  name: string;
  stockQuantity: number;
  minStockAlert: number;
  unit: string;
  category: {
    name: string;
  };
}

interface CashFlowEntry {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCashFlowModal, setShowCashFlowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [stockUpdateForm, setStockUpdateForm] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: '',
    reason: ''
  });
  const [newCashFlow, setNewCashFlow] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/${restaurantId}?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/${restaurantId}/stock`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      const data = await response.json();
      setStockItems(data.items);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const updateStock = async () => {
    if (!editingStock) return;

    try {
      const response = await fetch(`http://localhost:3001/api/analytics/${restaurantId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuItemId: editingStock.id,
          type: stockUpdateForm.type,
          quantity: parseInt(stockUpdateForm.quantity),
          reason: stockUpdateForm.reason
        })
      });

      if (!response.ok) throw new Error('Failed to update stock');
      
      // Refresh data
      await Promise.all([fetchAnalytics(), fetchStockData()]);
      
      // Reset form
      setStockUpdateForm({
        type: 'IN',
        quantity: '',
        reason: ''
      });
      setEditingStock(null);
      
      console.log('📦 Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const addCashFlowEntry = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/${restaurantId}/cashflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newCashFlow.type,
          amount: parseFloat(newCashFlow.amount),
          description: newCashFlow.description,
          category: newCashFlow.category
        })
      });

      if (!response.ok) throw new Error('Failed to add cashflow entry');
      
      // Refresh analytics
      await fetchAnalytics();
      
      // Reset form
      setNewCashFlow({
        type: 'INCOME',
        amount: '',
        description: '',
        category: ''
      });
      setShowCashFlowModal(false);
      
      console.log('💰 Cashflow entry added successfully');
    } catch (error) {
      console.error('Error adding cashflow entry:', error);
      alert('Failed to add cashflow entry');
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
                <p className="text-sm font-medium text-gray-600">Net Income (Month)</p>
                <p className={`text-2xl font-bold ${analytics.cashflow.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rp {analytics.cashflow.netIncome.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Wallet className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.lowStockItems.length}</p>
              </div>
              <div className={`p-3 rounded-full ${analytics.lowStockItems.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertTriangle className={`${analytics.lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`} size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Income</h3>
              <div className="bg-green-100 p-2 rounded-full">
                <Plus className="text-green-600" size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">
              Rp {analytics.cashflow.income.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Expenses</h3>
              <div className="bg-red-100 p-2 rounded-full">
                <Minus className="text-red-600" size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">
              Rp {analytics.cashflow.expense.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Profit Margin</h3>
              <div className="bg-blue-100 p-2 rounded-full">
                <TrendingUp className="text-blue-600" size={16} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${analytics.cashflow.income > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
              {analytics.cashflow.income > 0 ? 
                `${((analytics.cashflow.netIncome / analytics.cashflow.income) * 100).toFixed(1)}%` : 
                '0%'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {analytics.intervalLabel} Revenue
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeriod('today')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedPeriod === 'today' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedPeriod('7days')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedPeriod === '7days' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setSelectedPeriod('30days')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedPeriod === '30days' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    if (selectedPeriod === 'today') {
                      return value; // Already formatted as "HH:00"
                    } else {
                      return new Date(value).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                      });
                    }
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']}
                  labelFormatter={(label) => {
                    if (selectedPeriod === 'today') {
                      return `${label} (Today)`;
                    } else {
                      return new Date(label).toLocaleDateString('id-ID');
                    }
                  }}
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

        {/* Stock Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="text-orange-600 mr-2" size={20} />
                Low Stock Alert
              </h3>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                {analytics.lowStockItems.length} items
              </span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analytics.lowStockItems.length > 0 ? (
                analytics.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-400 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-red-600">
                        Stock: {item.stockQuantity} {item.unit} (Min: {item.minStockAlert})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-bold text-sm">
                        {item.stockQuantity <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="text-green-600 mx-auto mb-2" size={48} />
                  <p className="text-green-600 font-medium">All items in good stock!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowCashFlowModal(true)}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Plus className="mr-2" size={20} />
                Add Cashflow Entry
              </button>
              <button 
                onClick={() => {
                  setShowStockModal(true);
                  fetchStockData();
                }}
                className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
              >
                <Package className="mr-2" size={20} />
                Manage Stock
              </button>
              <Link 
                href={`/admin/${restaurantId}/orders`}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                View All Orders
              </Link>
              <Link 
                href={`/admin/${restaurantId}/menu`}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                Manage Menu
              </Link>
              <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Cashflow Modal */}
        {showCashFlowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Cashflow Entry</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newCashFlow.type}
                    onChange={(e) => setNewCashFlow({...newCashFlow, type: e.target.value as 'INCOME' | 'EXPENSE'})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newCashFlow.amount}
                    onChange={(e) => setNewCashFlow({...newCashFlow, amount: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCashFlow.description}
                    onChange={(e) => setNewCashFlow({...newCashFlow, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newCashFlow.category}
                    onChange={(e) => setNewCashFlow({...newCashFlow, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select category</option>
                    {newCashFlow.type === 'INCOME' ? (
                      <>
                        <option value="Sales">Sales</option>
                        <option value="Other Income">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Ingredients">Ingredients</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Other Expense">Other Expense</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCashFlowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCashFlowEntry}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  disabled={!newCashFlow.amount || !newCashFlow.description || !newCashFlow.category}
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Management Modal */}
        {showStockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Stock Management</h3>
                  <button
                    onClick={() => {
                      setShowStockModal(false);
                      setEditingStock(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {stockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="text-gray-400 mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Loading stock data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stockItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-lg ${
                          item.stockQuantity <= item.minStockAlert 
                            ? 'border-red-200 bg-red-50' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">
                                Category: {item.category.name}
                              </span>
                              <span className={`text-sm font-medium ${
                                item.stockQuantity <= 0 
                                  ? 'text-red-600' 
                                  : item.stockQuantity <= item.minStockAlert 
                                    ? 'text-orange-600' 
                                    : 'text-green-600'
                              }`}>
                                Stock: {item.stockQuantity} {item.unit}
                              </span>
                              <span className="text-sm text-gray-500">
                                Min Alert: {item.minStockAlert}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setEditingStock(item);
                              setStockUpdateForm({
                                type: 'IN',
                                quantity: '',
                                reason: ''
                              });
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center"
                          >
                            <Edit3 size={16} className="mr-1" />
                            Update
                          </button>
                        </div>

                        {/* Stock Update Form */}
                        {editingStock?.id === item.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-3">Update Stock: {item.name}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                  value={stockUpdateForm.type}
                                  onChange={(e) => setStockUpdateForm({
                                    ...stockUpdateForm, 
                                    type: e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT'
                                  })}
                                  className="w-full p-2 border border-gray-300 rounded"
                                >
                                  <option value="IN">Stock In (+)</option>
                                  <option value="OUT">Stock Out (-)</option>
                                  <option value="ADJUSTMENT">Adjustment (Set)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {stockUpdateForm.type === 'ADJUSTMENT' ? 'New Stock' : 'Quantity'}
                                </label>
                                <input
                                  type="number"
                                  value={stockUpdateForm.quantity}
                                  onChange={(e) => setStockUpdateForm({
                                    ...stockUpdateForm, 
                                    quantity: e.target.value
                                  })}
                                  className="w-full p-2 border border-gray-300 rounded"
                                  placeholder="Enter quantity"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <input
                                  type="text"
                                  value={stockUpdateForm.reason}
                                  onChange={(e) => setStockUpdateForm({
                                    ...stockUpdateForm, 
                                    reason: e.target.value
                                  })}
                                  className="w-full p-2 border border-gray-300 rounded"
                                  placeholder="Enter reason"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <button
                                onClick={() => setEditingStock(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={updateStock}
                                disabled={!stockUpdateForm.quantity || !stockUpdateForm.reason}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Update Stock
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}