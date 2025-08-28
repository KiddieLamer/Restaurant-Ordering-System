'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QrCode, ArrowLeft, Smartphone, Users } from 'lucide-react';
import { generateSessionId } from '@/lib/utils';

export default function QRPage() {
  const [qrCodes, setQrCodes] = useState<Array<{
    tableNumber: string;
    qrUrl: string;
    sessionId: string;
  }>>([]);

  useEffect(() => {
    // Generate QR codes for different tables
    const tables = ['1', '2', '3', '4', '5', '6'];
    const codes = tables.map(tableNumber => ({
      tableNumber,
      sessionId: generateSessionId(),
      qrUrl: `${window.location.origin}/order/demo-restaurant/${tableNumber}?session=${generateSessionId()}`
    }));
    setQrCodes(codes);
  }, []);

  const generateQRCodeSVG = (url: string, size = 200) => {
    // Simple QR code representation using SVG
    // In real implementation, you'd use a proper QR code library
    const gridSize = 25;
    const cellSize = size / gridSize;
    
    // Generate a simple pattern based on URL
    const pattern = [];
    for (let i = 0; i < gridSize; i++) {
      pattern[i] = [];
      for (let j = 0; j < gridSize; j++) {
        // Create a pseudo-random pattern based on URL and position
        const hash = url.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (i + j + idx), 0);
        pattern[i][j] = hash % 2 === 0;
      }
    }

    return (
      <svg width={size} height={size} className="border-2 border-gray-300">
        {pattern.map((row, i) =>
          row.map((cell, j) => (
            <rect
              key={`${i}-${j}`}
              x={j * cellSize}
              y={i * cellSize}
              width={cellSize}
              height={cellSize}
              fill={cell ? '#000000' : '#ffffff'}
            />
          ))
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QR Codes Demo</h1>
              <p className="text-sm text-gray-600">Dummy QR codes untuk testing</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <QrCode className="text-blue-600 mt-1" size={24} />
            <div>
              <h2 className="font-semibold text-blue-900 mb-2">Cara Menggunakan QR Code</h2>
              <div className="text-blue-800 space-y-2">
                <p>1. <strong>Klik QR code</strong> di bawah untuk simulasi scan</p>
                <p>2. <strong>Atau copy link</strong> dan buka di browser/tab baru</p>
                <p>3. <strong>Pilih meja</strong> yang berbeda untuk testing session unik</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Codes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qr) => (
            <div key={qr.tableNumber} className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Users className="text-gray-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Meja {qr.tableNumber}
                  </h3>
                </div>
                
                {/* QR Code SVG */}
                <Link href={qr.qrUrl} className="block mx-auto w-fit hover:opacity-80 transition-opacity">
                  {generateQRCodeSVG(qr.qrUrl, 150)}
                </Link>
                
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  Session: {qr.sessionId.substring(0, 8)}...
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link
                  href={qr.qrUrl}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block text-sm font-medium"
                >
                  <Smartphone size={16} className="inline mr-2" />
                  Simulasi Scan
                </Link>
                
                <button
                  onClick={() => navigator.clipboard.writeText(qr.qrUrl)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Copy Link
                </button>
              </div>

              {/* URL Preview */}
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                {qr.qrUrl}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips Testing</h3>
          <ul className="text-yellow-800 space-y-1 text-sm">
            <li>• Setiap meja punya session ID unik</li>
            <li>• Klik QR code langsung redirect ke halaman order</li>
            <li>• Buka di tab/browser berbeda untuk simulasi customer berbeda</li>
            <li>• Session ID otomatis generate setiap reload halaman</li>
          </ul>
        </div>
      </div>
    </div>
  );
}