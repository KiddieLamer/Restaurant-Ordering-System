'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Star } from 'lucide-react';

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

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Demo data - in real app this would come from API
  const demoCategories: Category[] = [
    {
      id: '1',
      name: 'Makanan Utama',
      description: 'Hidangan utama yang mengenyangkan',
      menuItems: [
        {
          id: '1',
          name: 'Nasi Goreng Spesial',
          description: 'Nasi goreng dengan telur, ayam, dan udang',
          price: 25000,
          isAvailable: true
        },
        {
          id: '2',
          name: 'Ayam Bakar Madu',
          description: 'Ayam bakar dengan saus madu dan lalapan',
          price: 35000,
          isAvailable: true
        },
        {
          id: '3',
          name: 'Sate Kambing',
          description: '10 tusuk sate kambing dengan lontong',
          price: 45000,
          isAvailable: true
        }
      ]
    },
    {
      id: '2',
      name: 'Minuman',
      description: 'Minuman segar untuk menemani makanan',
      menuItems: [
        {
          id: '4',
          name: 'Es Teh Manis',
          description: 'Teh manis dingin yang menyegarkan',
          price: 8000,
          isAvailable: true
        },
        {
          id: '5',
          name: 'Jus Jeruk',
          description: 'Jus jeruk segar tanpa gula tambahan',
          price: 15000,
          isAvailable: true
        },
        {
          id: '6',
          name: 'Kopi Hitam',
          description: 'Kopi robusta pilihan, diseduh fresh',
          price: 12000,
          isAvailable: true
        }
      ]
    },
    {
      id: '3',
      name: 'Dessert',
      description: 'Pencuci mulut yang manis',
      menuItems: [
        {
          id: '7',
          name: 'Es Campur',
          description: 'Es campur dengan berbagai topping',
          price: 18000,
          isAvailable: true
        },
        {
          id: '8',
          name: 'Pisang Goreng',
          description: 'Pisang goreng crispy dengan madu',
          price: 12000,
          isAvailable: true
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(demoCategories);
      setSelectedCategory(demoCategories[0]?.id || '');
      setLoading(false);
    }, 1000);
  }, []);

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

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Menu Restoran Demo</h1>
                <p className="text-sm text-gray-600">Lihat semua menu yang tersedia</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-medium">Untuk memesan:</p>
              <p className="text-xs text-gray-500">Scan QR di meja Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {selectedCategoryData && (
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCategoryData.name}</h2>
              {selectedCategoryData.description && (
                <p className="text-gray-600">{selectedCategoryData.description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {selectedCategoryData.menuItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.isAvailable && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Tersedia
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      <p className="text-lg font-semibold text-blue-600">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tertarik untuk memesan? 🍽️
          </h3>
          <p className="text-gray-600 mb-4">
            Untuk memesan makanan, silakan scan QR code yang ada di meja Anda atau coba demo order
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/order/demo-restaurant/1?session=demo-session"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              <Clock size={20} className="mr-2" />
              Coba Demo Order
            </Link>
            <button className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Punya QR Code? Scan di Sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}