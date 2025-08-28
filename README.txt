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

- **Frontend**: Next.js (React), TailwindCSS  
- **Backend**: Node.js (Express/NestJS), REST API + WebSocket  
- **Database**: PostgreSQL (ORM: Prisma/Sequelize)  
- **Payment Gateway**: Midtrans / Xendit  
- **Deployment**: Docker + GitHub Actions / GitLab CI  
- **Monitoring**: Prometheus + Grafana  

---

## 📂 Struktur Repository

