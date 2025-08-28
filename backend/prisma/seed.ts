import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      id: 'demo-restaurant',
      name: 'Warung Makan Sederhana',
      address: 'Jl. Merdeka No. 123, Jakarta',
      phone: '021-123456789',
      email: 'info@warungsederhana.com',
      description: 'Warung makan tradisional dengan cita rasa autentik Indonesia'
    }
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Makanan Utama',
        description: 'Nasi dan lauk pauk',
        restaurantId: restaurant.id,
        sortOrder: 1
      }
    }),
    prisma.category.create({
      data: {
        name: 'Minuman',
        description: 'Minuman segar dan tradisional',
        restaurantId: restaurant.id,
        sortOrder: 2
      }
    }),
    prisma.category.create({
      data: {
        name: 'Camilan',
        description: 'Snack dan makanan ringan',
        restaurantId: restaurant.id,
        sortOrder: 3
      }
    })
  ]);

  // Create menu items
  const menuItems = await Promise.all([
    // Makanan Utama
    prisma.menuItem.create({
      data: {
        name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng dengan ayam, telur, dan kerupuk',
        price: 30000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 1
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Ayam Bakar',
        description: 'Ayam bakar bumbu kecap dengan nasi putih',
        price: 35000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 2
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Sate Kambing',
        description: '10 tusuk sate kambing dengan lontong',
        price: 30000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 3
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Gado-Gado',
        description: 'Sayuran segar dengan bumbu kacang',
        price: 20000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 4
      }
    }),

    // Minuman
    prisma.menuItem.create({
      data: {
        name: 'Es Teh Manis',
        description: 'Teh manis dengan es batu',
        price: 5000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 1
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Es Jeruk',
        description: 'Jeruk peras segar dengan es',
        price: 8000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 2
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Kopi Hitam',
        description: 'Kopi robusta pilihan',
        price: 6000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 3
      }
    }),

    // Camilan
    prisma.menuItem.create({
      data: {
        name: 'Kerupuk Udang',
        description: 'Kerupuk udang renyah',
        price: 3000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 1
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Pisang Goreng',
        description: 'Pisang goreng crispy dengan madu',
        price: 12000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 2
      }
    })
  ]);

  // Create tables
  const tables = await Promise.all([
    prisma.table.create({
      data: {
        tableNumber: '1',
        qrCode: 'http://localhost:3000/order/demo-restaurant/1',
        restaurantId: restaurant.id
      }
    }),
    prisma.table.create({
      data: {
        tableNumber: '2',
        qrCode: 'http://localhost:3000/order/demo-restaurant/2',
        restaurantId: restaurant.id
      }
    }),
    prisma.table.create({
      data: {
        tableNumber: '3',
        qrCode: 'http://localhost:3000/order/demo-restaurant/3',
        restaurantId: restaurant.id
      }
    }),
    prisma.table.create({
      data: {
        tableNumber: '4',
        qrCode: 'http://localhost:3000/order/demo-restaurant/4',
        restaurantId: restaurant.id
      }
    }),
    prisma.table.create({
      data: {
        tableNumber: '5',
        qrCode: 'http://localhost:3000/order/demo-restaurant/5',
        restaurantId: restaurant.id
      }
    })
  ]);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'owner@warungsederhana.com',
        name: 'Budi Santoso',
        passwordHash: 'hashed_password_here',
        role: 'OWNER',
        restaurantId: restaurant.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'kitchen@warungsederhana.com',
        name: 'Sari Kitchen',
        passwordHash: 'hashed_password_here',
        role: 'KITCHEN',
        restaurantId: restaurant.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'cashier@warungsederhana.com',
        name: 'Andi Kasir',
        passwordHash: 'hashed_password_here',
        role: 'CASHIER',
        restaurantId: restaurant.id
      }
    })
  ]);

  console.log('✅ Seed completed successfully!');
  console.log({
    restaurant: restaurant.name,
    categories: categories.length,
    menuItems: menuItems.length,
    tables: tables.length,
    users: users.length
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });