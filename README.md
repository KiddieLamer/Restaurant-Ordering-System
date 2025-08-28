# 🍽️ Restaurant Ordering System

Aplikasi ini adalah sistem pemesanan restoran berbasis QR Code.  
Customer cukup scan QR di meja → pilih menu → bayar → order masuk ke kasir/kitchen.  
Owner dapat memonitoring cashflow, stok, dan insight menu terlaris.

---

## 🚀 Fitur Utama

### Customer
- Scan QR di meja → masuk ke sesi unik.
- Melihat menu & menambahkan pesanan ke keranjang.
- Checkout dengan payment gateway (Midtrans/Xendit).
- Tracking status order (menunggu, diproses, selesai).

### Kasir / Kitchen
- Dashboard order masuk secara realtime.
- Update status pesanan → kirim ke kitchen/barista.
- Konfirmasi pembayaran & pesanan selesai.

### Owner
- Monitoring cashflow harian/mingguan/bulanan.
- Insight menu terlaris & stok bahan baku.
- FIFO (First In First Out) untuk inventory.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (React), TailwindCSS, TypeScript
- **Backend**: Node.js (Express), REST API + WebSocket (Socket.IO)
- **Database**: PostgreSQL (ORM: Prisma)
- **Payment Gateway**: Midtrans / Xendit
- **Deployment**: Docker + Docker Compose
- **Real-time**: Socket.IO untuk live updates

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+ (atau gunakan Docker)
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd restaurant-ordering-system
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.example backend/.env
cp .env.example frontend/.env.local

# Update database credentials dan API keys di .env files
```

### 3. Database Setup
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend akan berjalan di `http://localhost:3001`

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:3000`

---

## 🐳 Docker Deployment

### Quick Start dengan Docker Compose
```bash
# Build dan jalankan semua services
docker-compose up --build

# Jalankan di background
docker-compose up -d --build
```

Services yang akan berjalan:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Database**: PostgreSQL di port 5432
- **Adminer** (DB Admin): http://localhost:8080

### Stop Services
```bash
docker-compose down

# Hapus volumes juga (data akan hilang)
docker-compose down -v
```

---

## 📂 Struktur Repository

```
restaurant-ordering-system/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # API Controllers
│   │   ├── routes/         # Express Routes
│   │   ├── services/       # Business Logic
│   │   ├── middleware/     # Custom Middleware
│   │   └── utils/          # Helper Functions
│   ├── prisma/
│   │   └── schema.prisma   # Database Schema
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js React App
│   ├── src/
│   │   ├── app/           # App Router Pages
│   │   ├── components/    # Reusable Components
│   │   └── lib/          # Utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Docker Services
└── README.md
```

---

## 🖥️ Demo Pages

Setelah menjalankan aplikasi, kunjungi:

1. **Home**: http://localhost:3000
2. **Customer Order**: http://localhost:3000/order/demo-restaurant/1?session=demo-session
3. **Kitchen Dashboard**: http://localhost:3000/kitchen/demo-restaurant
4. **Owner Analytics**: http://localhost:3000/admin/demo-restaurant

---

## 🔧 Database Schema

### Main Entities:
- **Restaurant**: Data restoran
- **Table**: Meja dengan QR code unik
- **Category**: Kategori menu
- **MenuItem**: Item menu dengan harga
- **User**: Staff/admin restoran
- **Order**: Pesanan customer
- **OrderItem**: Detail item dalam pesanan

### Status Flows:
```
Order: PENDING → CONFIRMED → PREPARING → READY → SERVED
Payment: PENDING → PAID / FAILED
```

---

## 🔌 API Endpoints

### Tables
- `POST /api/tables` - Create table
- `GET /api/tables/:id` - Get table info
- `GET /api/tables/qr/:restaurantId/:tableNumber` - Generate QR
- `GET /api/tables/scan/:restaurantId/:tableNumber` - Scan QR

### Menu
- `GET /api/menu/:restaurantId` - Get menu
- `POST /api/menu/categories` - Create category
- `POST /api/menu/items` - Create menu item
- `PUT /api/menu/items/:id` - Update menu item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/kitchen/:restaurantId` - Kitchen orders
- `GET /api/orders/table/:tableId` - Table orders

---

## 🔄 Real-time Events

### Socket.IO Events:
- `join-table` - Customer bergabung ke meja
- `join-kitchen` - Kitchen staff bergabung
- `new-order` - Order baru masuk
- `order-updated` - Status order berubah
- `order-status-updated` - Update status untuk customer

---

## 🚧 Development

### Backend Development
```bash
cd backend
npm run dev     # Development dengan nodemon
npm run build   # Build TypeScript
npm run start   # Production mode
```

### Frontend Development
```bash
cd frontend
npm run dev     # Development dengan hot reload
npm run build   # Build production
npm run start   # Production mode
```

### Database Operations
```bash
cd backend
npx prisma studio              # Database GUI
npx prisma migrate dev         # Create migration
npx prisma generate           # Generate client
npx prisma db seed           # Seed database
```

---

## 📱 Features Status

✅ **Completed**:
- QR Code generation & scanning
- Customer ordering interface
- Kitchen dashboard dengan real-time updates
- Owner analytics dashboard
- Database schema & API endpoints
- Docker containerization
- Socket.IO real-time updates

🔄 **In Progress**:
- Midtrans payment integration
- User authentication & authorization
- Menu management interface
- Order history & reporting

📋 **Planned**:
- Mobile app (React Native)
- Inventory management
- Multi-restaurant support
- Advanced analytics & reporting
- Push notifications

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

Untuk support dan pertanyaan:
- Email: support@restaurant-ordering.com
- GitHub Issues: [Create Issue](../../issues)

---

**Made with ❤️ for Indonesian Restaurant Industry**
