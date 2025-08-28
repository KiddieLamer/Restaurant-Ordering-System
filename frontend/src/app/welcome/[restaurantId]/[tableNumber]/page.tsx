'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Star, Users, ChefHat, ImageIcon, Clock } from 'lucide-react';

interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  category: string;
  quantity: number;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo: string | null;
}

interface SplashData {
  restaurant: Restaurant;
  featuredItems: FeaturedItem[];
  totalOrders: number;
}

export default function WelcomePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const tableNumber = params.tableNumber as string;
  const sessionId = searchParams.get('session');

  const [splashData, setSplashData] = useState<SplashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchSplashData();
  }, [restaurantId]);

  useEffect(() => {
    if (splashData && splashData.featuredItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % splashData.featuredItems.length);
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(timer);
    }
  }, [splashData]);

  const fetchSplashData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/${restaurantId}/splash`);
      if (!response.ok) throw new Error('Failed to fetch splash data');
      const data = await response.json();
      setSplashData(data);
    } catch (error) {
      console.error('Error fetching splash data:', error);
    } finally {
      setLoading(false);
    }
  };

  const proceedToOrder = () => {
    const url = `/order/${restaurantId}/${tableNumber}${sessionId ? `?session=${sessionId}` : ''}`;
    router.push(url);
  };

  const getCurrentItem = () => {
    if (!splashData || splashData.featuredItems.length === 0) return null;
    return splashData.featuredItems[currentSlide] || splashData.featuredItems[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Memuat menu spesial...</p>
        </div>
      </div>
    );
  }

  if (!splashData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">Tidak dapat memuat data restaurant</p>
        </div>
      </div>
    );
  }

  const currentItem = getCurrentItem();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='5' cy='5' r='5'/%3E%3Ccircle cx='25' cy='25' r='5'/%3E%3Ccircle cx='45' cy='45' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mx-auto max-w-sm">
            <h1 className="text-3xl font-bold text-white mb-2">
              Selamat Datang di
            </h1>
            <h2 className="text-2xl font-semibold text-yellow-200">
              {splashData.restaurant.name}
            </h2>
            <p className="text-white/90 mt-2 text-sm">
              {splashData.restaurant.description}
            </p>
            <div className="flex items-center justify-center mt-4 space-x-6 text-white/80">
              <div className="flex items-center space-x-1">
                <Users size={16} />
                <span className="text-xs">{splashData.totalOrders}+ pesanan</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star size={16} />
                <span className="text-xs">Menu Terpopuler</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Food Carousel */}
        <div className="flex-1 px-6 pb-8">
          {currentItem && (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto">
              {/* Food Image */}
              <div className="relative h-64 bg-gray-100">
                {currentItem.image ? (
                  <img
                    src={`http://localhost:3001${currentItem.image}`}
                    alt={currentItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <ImageIcon className="text-gray-400 mx-auto mb-2" size={48} />
                      <p className="text-gray-500 text-sm">Foto Segera Hadir</p>
                    </div>
                  </div>
                )}
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <ChefHat size={12} className="mr-1" />
                    {currentItem.quantity > 0 ? 'TERLARIS' : 'SPESIAL'}
                  </div>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                    Rp {currentItem.price.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {currentItem.category}
                  </div>
                </div>
              </div>

              {/* Food Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentItem.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {currentItem.description || "Hidangan lezat yang disiapkan dengan bahan-bahan pilihan dan bumbu rahasia yang menggugah selera. Nikmati kelezatan autentik yang akan memanjakan lidah Anda."}
                </p>

                {/* Testimonial/Marketing Copy */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-500 rounded-full p-1">
                      <Star size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="text-orange-800 text-sm font-medium">
                        "Rasanya benar-benar menggugah selera! Bahan-bahannya fresh dan bumbunya pas banget."
                      </p>
                      <p className="text-orange-600 text-xs mt-1">
                        - Pelanggan setia
                      </p>
                    </div>
                  </div>
                </div>

                {currentItem.quantity > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Clock size={12} className="mr-1" />
                      Sudah dipesan {currentItem.quantity}x bulan ini
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Slide Indicators */}
          {splashData.featuredItems.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {splashData.featuredItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white shadow-lg' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="px-6 pb-8">
          <button
            onClick={proceedToOrder}
            className="w-full bg-white text-red-500 font-bold text-lg py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <ChefHat size={24} />
            <span>Mulai Pesan Sekarang</span>
            <ArrowRight size={24} />
          </button>
          
          <p className="text-center text-white/80 text-sm mt-3">
            ✨ Menu lengkap dan promo menarik menanti Anda!
          </p>
        </div>
      </div>
    </div>
  );
}