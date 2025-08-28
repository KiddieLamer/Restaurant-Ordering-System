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
        description: 'Nasi goreng dengan ayam, telur, acar, dan kerupuk udang. Dimasak dengan bumbu rahasia warung',
        price: 30000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 1,
        stockQuantity: 50,
        minStockAlert: 10,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Ayam Bakar Kecap',
        description: 'Ayam kampung bakar bumbu kecap manis, disajikan dengan nasi putih hangat dan lalapan',
        price: 35000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 2,
        stockQuantity: 25,
        minStockAlert: 5,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Sate Kambing Madura',
        description: '10 tusuk sate kambing pilihan dengan bumbu kacang khas Madura, lontong, dan timun',
        price: 45000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 3,
        stockQuantity: 3,
        minStockAlert: 5,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Gado-Gado Jakarta',
        description: 'Sayuran segar (kol, tauge, tahu, tempe) dengan bumbu kacang gurih dan kerupuk',
        price: 20000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 4,
        stockQuantity: 30,
        minStockAlert: 8,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Rendang Daging Sapi',
        description: 'Daging sapi empuk dimasak dengan bumbu rendang khas Padang, disajikan dengan nasi putih',
        price: 45000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 5,
        stockQuantity: 20,
        minStockAlert: 5,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Mie Ayam Bakso',
        description: 'Mie kuning dengan ayam cincang, bakso sapi, pangsit, dan kuah kaldu yang gurih',
        price: 25000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 6,
        stockQuantity: 35,
        minStockAlert: 10,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Nasi Gudeg Yogya',
        description: 'Nasi dengan gudeg manis, ayam kampung, telur pindang, dan sambal krecek',
        price: 28000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 7,
        stockQuantity: 25,
        minStockAlert: 8,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Soto Betawi',
        description: 'Soto daging sapi dengan santan, kentang, tomat, dan taburan bawang goreng',
        price: 32000,
        categoryId: categories[0].id,
        restaurantId: restaurant.id,
        sortOrder: 8,
        stockQuantity: 20,
        minStockAlert: 5,
        unit: 'porsi'
      }
    }),

    // Minuman
    prisma.menuItem.create({
      data: {
        name: 'Es Teh Manis',
        description: 'Teh hitam manis dingin dengan es batu, minuman klasik yang menyegarkan',
        price: 5000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 1,
        stockQuantity: 100,
        minStockAlert: 20,
        unit: 'gelas'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Es Jeruk Nipis',
        description: 'Jeruk nipis segar diperas dengan air dingin dan gula, sangat menyegarkan',
        price: 8000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 2,
        stockQuantity: 45,
        minStockAlert: 15,
        unit: 'gelas'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Kopi Hitam Tubruk',
        description: 'Kopi robusta asli diseduh tubruk dengan gula aren, cita rasa khas Indonesia',
        price: 8000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 3,
        stockQuantity: 80,
        minStockAlert: 25,
        unit: 'cangkir'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Es Kelapa Muda',
        description: 'Kelapa muda segar dengan es batu dan sedikit garam, alami dan sehat',
        price: 12000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 4,
        stockQuantity: 15,
        minStockAlert: 5,
        unit: 'gelas'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Es Cendol Dawet',
        description: 'Cendol hijau dengan santan kental, gula merah, dan es serut',
        price: 15000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 5,
        stockQuantity: 25,
        minStockAlert: 8,
        unit: 'gelas'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Jus Alpukat',
        description: 'Alpukat segar diblender dengan susu kental manis dan es, creamy dan lezat',
        price: 18000,
        categoryId: categories[1].id,
        restaurantId: restaurant.id,
        sortOrder: 6,
        stockQuantity: 20,
        minStockAlert: 5,
        unit: 'gelas'
      }
    }),

    // Camilan
    prisma.menuItem.create({
      data: {
        name: 'Kerupuk Udang Sidoarjo',
        description: 'Kerupuk udang asli Sidoarjo yang renyah dan gurih, cocok untuk teman makan',
        price: 5000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 1,
        stockQuantity: 2,
        minStockAlert: 5,
        unit: 'bungkus'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Pisang Goreng Kipas',
        description: 'Pisang raja goreng crispy berbentuk kipas dengan taburan gula halus dan madu',
        price: 15000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 2,
        stockQuantity: 15,
        minStockAlert: 8,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Tahu Isi Goreng',
        description: 'Tahu putih diisi dengan tauge, wortel, dan bumbu, digoreng hingga kecoklatan',
        price: 12000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 3,
        stockQuantity: 20,
        minStockAlert: 5,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Tempe Mendoan',
        description: 'Tempe tipis dibalut adonan tepung dan goreng setengah matang, crispy di luar',
        price: 10000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 4,
        stockQuantity: 25,
        minStockAlert: 8,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Bakwan Jagung',
        description: 'Bakwan dengan jagung manis, wortel, dan daun bawang, digoreng hingga keemasan',
        price: 8000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 5,
        stockQuantity: 30,
        minStockAlert: 10,
        unit: 'porsi'
      }
    }),
    prisma.menuItem.create({
      data: {
        name: 'Es Krim Goreng',
        description: 'Es krim vanila dibalut roti tawar dan digoreng cepat, dingin di dalam hangat di luar',
        price: 20000,
        categoryId: categories[2].id,
        restaurantId: restaurant.id,
        sortOrder: 6,
        stockQuantity: 12,
        minStockAlert: 5,
        unit: 'porsi'
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

  // Create sample cashflow entries
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(dayBefore.getDate() - 2);

  const cashFlows = await Promise.all([
    // Income entries
    prisma.cashFlow.create({
      data: {
        type: 'INCOME',
        amount: 450000,
        description: 'Penjualan hari ini - cash',
        category: 'Sales',
        restaurantId: restaurant.id,
        createdAt: today
      }
    }),
    prisma.cashFlow.create({
      data: {
        type: 'INCOME',
        amount: 320000,
        description: 'Penjualan kemarin - cash',
        category: 'Sales',
        restaurantId: restaurant.id,
        createdAt: yesterday
      }
    }),
    prisma.cashFlow.create({
      data: {
        type: 'INCOME',
        amount: 280000,
        description: 'Penjualan lusa - cash',
        category: 'Sales',
        restaurantId: restaurant.id,
        createdAt: dayBefore
      }
    }),

    // Expense entries
    prisma.cashFlow.create({
      data: {
        type: 'EXPENSE',
        amount: 150000,
        description: 'Belanja bahan makanan',
        category: 'Ingredients',
        restaurantId: restaurant.id,
        createdAt: yesterday
      }
    }),
    prisma.cashFlow.create({
      data: {
        type: 'EXPENSE',
        amount: 50000,
        description: 'Gas LPG 3kg',
        category: 'Utilities',
        restaurantId: restaurant.id,
        createdAt: yesterday
      }
    }),
    prisma.cashFlow.create({
      data: {
        type: 'EXPENSE',
        amount: 25000,
        description: 'Sabun cuci piring',
        category: 'Supplies',
        restaurantId: restaurant.id,
        createdAt: dayBefore
      }
    }),
    prisma.cashFlow.create({
      data: {
        type: 'EXPENSE',
        amount: 100000,
        description: 'Gaji harian staff',
        category: 'Salaries',
        restaurantId: restaurant.id,
        createdAt: today
      }
    })
  ]);

  console.log('✅ Seed completed successfully!');
  console.log({
    restaurant: restaurant.name,
    categories: categories.length,
    menuItems: menuItems.length,
    tables: tables.length,
    users: users.length,
    cashFlows: cashFlows.length
  });
  console.log('📋 Menu breakdown:');
  console.log('- Makanan Utama: 8 items');
  console.log('- Minuman: 6 items'); 
  console.log('- Camilan: 6 items');
  console.log('Total: 20 menu items with detailed descriptions!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });