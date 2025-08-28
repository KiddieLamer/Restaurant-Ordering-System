'use client';

import Link from 'next/link';
import { QrCode, ChefHat, BarChart3, Users } from 'lucide-react';
import { useState } from 'react';
import { generateSessionId } from '@/lib/utils';

export default function Home() {
  const [demoSessionId] = useState(() => generateSessionId());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            🍽️ Restaurant Ordering System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Scan QR di meja → pilih menu → bayar → order masuk ke kasir/kitchen.
            Sistem pemesanan restoran berbasis QR Code yang modern dan efisien.
          </p>
          <Link 
            href="/menu"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center text-lg font-medium"
          >
            📋 Lihat Menu Lengkap
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <QrCode className="text-blue-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Order</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Scan QR code untuk memesan makanan dan minuman
            </p>
            <div className="space-y-2">
              <Link 
                href={`/order/demo-restaurant/1?session=${demoSessionId}`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block text-sm"
              >
                Demo Order
              </Link>
              <Link 
                href="/qr"
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors inline-block text-sm"
              >
                Lihat QR Codes
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="text-orange-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kitchen Dashboard</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Monitor pesanan masuk dan update status masakan
            </p>
            <Link 
              href="/kitchen/demo-restaurant"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-block text-sm"
            >
              Open Kitchen
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Owner Analytics</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Monitor penjualan, menu terlaris, dan cashflow
            </p>
            <Link 
              href="/admin/demo-restaurant"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block text-sm"
            >
              View Analytics
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="text-purple-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Management</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Kelola staff, meja, dan QR code restoran
            </p>
            <Link 
              href="/admin/demo-restaurant/tables"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block text-sm"
            >
              Manage Tables
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Tech Stack</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
              <p className="text-gray-600 text-sm">Next.js, React, TailwindCSS</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
              <p className="text-gray-600 text-sm">Node.js, Express, Socket.IO</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Database</h3>
              <p className="text-gray-600 text-sm">PostgreSQL, Prisma ORM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}