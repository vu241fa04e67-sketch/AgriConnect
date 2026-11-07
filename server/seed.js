import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Crop from './models/Crop.js';
import Order from './models/Order.js';
import Review from './models/Review.js';

export async function seedDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agriconnect';
  await mongoose.connect(uri);
  console.log('🌱 Connected to MongoDB for seeding...');

  // Clean existing collections
  await Promise.all([
    User.deleteMany({}),
    Crop.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({})
  ]);
  console.log('Cleared existing collections.');

  const adminHash = await bcrypt.hash('ChangeMe123!', 12);
  const farmerHash = await bcrypt.hash('Farmer123!', 12);
  const buyerHash = await bcrypt.hash('Buyer123!', 12);

  // 1. Create Users
  const admin = await User.create({
    name: 'Marketplace Admin',
    email: 'admin@agriconnect.com',
    passwordHash: adminHash,
    role: 'Admin',
    isVerified: true,
    phone: '+91 98765 43210',
    location: 'Headquarters, Mumbai',
    address: 'AgriConnect Towers, Bandra Kurla Complex, Mumbai'
  });

  const farmer1 = await User.create({
    name: 'Ramesh Patel',
    email: 'ramesh@farm.com',
    passwordHash: farmerHash,
    role: 'Farmer',
    isVerified: true,
    farmName: 'Green Valley Organic Farm',
    location: 'Nashik, Maharashtra',
    phone: '+91 98234 11223',
    address: 'Survey No. 42, Dindori Road, Nashik'
  });

  const farmer2 = await User.create({
    name: 'Gurpreet Singh',
    email: 'gurpreet@punjabfarms.com',
    passwordHash: farmerHash,
    role: 'Farmer',
    isVerified: true,
    farmName: 'Golden Fields Agro',
    location: 'Ludhiana, Punjab',
    phone: '+91 98140 33445',
    address: 'Village Raikot, Ludhiana'
  });

  const farmer3 = await User.create({
    name: 'Savitri Devi',
    email: 'savitri@hillsagro.com',
    passwordHash: farmerHash,
    role: 'Farmer',
    isVerified: false, // Pending verification for Admin demo
    farmName: 'Himalayan Terrace Gardens',
    location: 'Shimla, Himachal Pradesh',
    phone: '+91 94180 55667',
    address: 'Kotkhai Valley, Shimla'
  });

  const buyer1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@market.com',
    passwordHash: buyerHash,
    role: 'Buyer',
    isVerified: true,
    phone: '+91 99001 77889',
    location: 'Bangalore, Karnataka',
    address: 'Flat 402, Green Orchid Apts, 12th Main Indiranagar, Bangalore'
  });

  const buyer2 = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@kitchen.com',
    passwordHash: buyerHash,
    role: 'Buyer',
    isVerified: true,
    phone: '+91 98711 22334',
    location: 'New Delhi',
    address: '15 Rajendra Nagar, New Delhi'
  });

  console.log('✅ Users seeded');

  // 2. Create Crops
  const cropsData = [
    {
      farmerId: farmer1._id,
      cropName: 'Fresh Red Tomatoes',
      category: 'Vegetables',
      quantityAvailable: 450,
      unit: 'kg',
      pricePerUnit: 35,
      description: 'Vine-ripened, pesticide-free juicy red tomatoes picked fresh every morning. Ideal for sauces, curries and fresh salads.',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    },
    {
      farmerId: farmer2._id,
      cropName: 'Royal Basmati Rice (Aged 1121)',
      category: 'Grains',
      quantityAvailable: 80,
      unit: 'quintal',
      pricePerUnit: 4500,
      description: 'Authentic 2-year naturally aged 1121 extra-long slender Basmati rice from the fertile plains of Punjab. Unrivaled aroma and fluffiness.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    },
    {
      farmerId: farmer1._id,
      cropName: 'Alphonso Mangoes (Ratnagiri GI)',
      category: 'Fruits',
      quantityAvailable: 200,
      unit: 'kg',
      pricePerUnit: 350,
      description: 'Authentic GI-tagged Ratnagiri Alphonso mangoes. Naturally tree-ripened without carbide, delivering divine sweetness and golden pulp.',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    },
    {
      farmerId: farmer3._id,
      cropName: 'Himachal Crisp Royal Apples',
      category: 'Fruits',
      quantityAvailable: 600,
      unit: 'kg',
      pricePerUnit: 140,
      description: 'Hand-picked Royal Delicious apples from high-altitude Shimla orchards. Sweet, crunchy, vibrant red and 100% chemical wax-free.',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    },
    {
      farmerId: farmer1._id,
      cropName: 'Fresh Baby Spinach (Palak)',
      category: 'Vegetables',
      quantityAvailable: 120,
      unit: 'kg',
      pricePerUnit: 25,
      description: 'Tender, dark-green iron-rich spinach grown with natural compost and clean well irrigation. Harvested the day of shipment.',
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    },
    {
      farmerId: farmer3._id,
      cropName: 'Organic High-Curcumin Turmeric',
      category: 'Spices',
      quantityAvailable: 90,
      unit: 'kg',
      pricePerUnit: 280,
      description: 'Pure high-curcumin (7%+) organic turmeric roots grown in virgin mountain soil. Sun-dried and traditionally processed.',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    },
    {
      farmerId: farmer2._id,
      cropName: 'Golden Sharbati Wheat',
      category: 'Grains',
      quantityAvailable: 150,
      unit: 'quintal',
      pricePerUnit: 3200,
      description: 'Harvested from rain-fed black soil fields. Golden heavy grain producing soft, sweet rotis packed with protein and dietary fiber.',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    },
    {
      farmerId: farmer2._id,
      cropName: 'Unpolished Yellow Moong Dal',
      category: 'Pulses',
      quantityAvailable: 300,
      unit: 'kg',
      pricePerUnit: 120,
      description: 'Farm-split whole unpolished moong dal retaining natural minerals, protein, and authentic earthy taste.',
      imageUrl: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=600&q=80',
      status: 'Active'
    }
  ];

  const crops = await Crop.create(cropsData);
  console.log(`✅ ${crops.length} Crops seeded`);

  // 3. Create Sample Orders
  // Order 1: Fulfilled order from Priya to Ramesh
  const order1 = await Order.create({
    buyerId: buyer1._id,
    farmerId: farmer1._id,
    cropId: crops[0]._id,
    cropName: crops[0].cropName,
    quantity: 15,
    unit: crops[0].unit,
    unitPriceAtOrder: crops[0].pricePerUnit,
    totalAmount: Number((15 * crops[0].pricePerUnit).toFixed(2)),
    deliveryAddress: buyer1.address,
    contactPhone: buyer1.phone,
    orderStatus: 'Fulfilled'
  });

  // Order 2: Fulfilled order from Rahul to Gurpreet
  const order2 = await Order.create({
    buyerId: buyer2._id,
    farmerId: farmer2._id,
    cropId: crops[1]._id,
    cropName: crops[1].cropName,
    quantity: 2,
    unit: crops[1].unit,
    unitPriceAtOrder: crops[1].pricePerUnit,
    totalAmount: Number((2 * crops[1].pricePerUnit).toFixed(2)),
    deliveryAddress: buyer2.address,
    contactPhone: buyer2.phone,
    orderStatus: 'Fulfilled'
  });

  // Order 3: Pending order from Priya to Ramesh (ready to accept/reject)
  const order3 = await Order.create({
    buyerId: buyer1._id,
    farmerId: farmer1._id,
    cropId: crops[2]._id,
    cropName: crops[2].cropName,
    quantity: 10,
    unit: crops[2].unit,
    unitPriceAtOrder: crops[2].pricePerUnit,
    totalAmount: Number((10 * crops[2].pricePerUnit).toFixed(2)),
    deliveryAddress: buyer1.address,
    contactPhone: buyer1.phone,
    orderStatus: 'Pending'
  });

  // Order 4: Accepted order from Rahul to Savitri (ready to mark fulfilled)
  const order4 = await Order.create({
    buyerId: buyer2._id,
    farmerId: farmer3._id,
    cropId: crops[3]._id,
    cropName: crops[3].cropName,
    quantity: 25,
    unit: crops[3].unit,
    unitPriceAtOrder: crops[3].pricePerUnit,
    totalAmount: Number((25 * crops[3].pricePerUnit).toFixed(2)),
    deliveryAddress: buyer2.address,
    contactPhone: buyer2.phone,
    orderStatus: 'Accepted'
  });

  console.log('✅ Orders seeded (Fulfilled, Accepted, Pending)');

  // 4. Create Reviews for fulfilled orders
  await Review.create([
    {
      buyerId: buyer1._id,
      farmerId: farmer1._id,
      orderId: order1._id,
      rating: 5,
      comment: 'Super fresh, sweet and fragrant tomatoes! Delivered within 24 hours of harvest. Will regularly order.'
    },
    {
      buyerId: buyer2._id,
      farmerId: farmer2._id,
      orderId: order2._id,
      rating: 5,
      comment: 'Top quality 1121 Basmati grain. Fluffs up beautifully and authentic natural aroma fills the kitchen.'
    }
  ]);
  console.log('✅ Reviews seeded');

  console.log('\n🎉 Database successfully initialized with demo data!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('Admin:   admin@agriconnect.com       / ChangeMe123!');
  console.log('Farmer:  ramesh@farm.com             / Farmer123!');
  console.log('Farmer2: gurpreet@punjabfarms.com    / Farmer123!');
  console.log('Farmer3: savitri@hillsagro.com       / Farmer123! (Pending verification)');
  console.log('Buyer:   priya@market.com            / Buyer123!');
  console.log('Buyer2:  rahul@kitchen.com           / Buyer123!');
  console.log('----------------------------------------------------');
}

// Allow direct CLI execution: `node seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
