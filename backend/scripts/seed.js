import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Favorite from '../models/Favorite.js';
import Enquiry from '../models/Enquiry.js';
import PropertyReport from '../models/PropertyReport.js';
import AdminAuditLog from '../models/AdminAuditLog.js';
import { connectDB, closeDB } from '../config/db.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Cleaning old records...');
    await Promise.all([
      User.deleteMany(),
      Property.deleteMany(),
      Favorite.deleteMany(),
      Enquiry.deleteMany(),
      PropertyReport.deleteMany(),
      AdminAuditLog.deleteMany(),
    ]);

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@1234', salt);
    const ownerPasswordHash = await bcrypt.hash('Owner@1234', salt);
    const buyerPasswordHash = await bcrypt.hash('Buyer@1234', salt);

    const admin = await User.create({
      name: 'Priya Sharma (Platform Admin)',
      email: 'admin@propertyconnect.com',
      phone: '+91 98450 12345',
      passwordHash: adminPasswordHash,
      role: 'admin',
      accountStatus: 'active',
      ownerVerificationStatus: 'verified',
      phoneDisplayConsent: true,
    });

    const owner1 = await User.create({
      name: 'Ramesh Gowda',
      email: 'owner@propertyconnect.com',
      phone: '+91 98801 23456',
      passwordHash: ownerPasswordHash,
      role: 'owner',
      accountStatus: 'active',
      ownerVerificationStatus: 'verified',
      phoneDisplayConsent: true,
    });

    const owner2 = await User.create({
      name: 'Anand Kumar',
      email: 'anand@propertyconnect.com',
      phone: '+91 94481 98765',
      passwordHash: ownerPasswordHash,
      role: 'owner',
      accountStatus: 'active',
      ownerVerificationStatus: 'unverified',
      phoneDisplayConsent: true,
    });

    const buyer = await User.create({
      name: 'Kavya Nair',
      email: 'buyer@propertyconnect.com',
      phone: '+91 97400 54321',
      passwordHash: buyerPasswordHash,
      role: 'buyer',
      accountStatus: 'active',
      ownerVerificationStatus: 'unverified',
      phoneDisplayConsent: true,
    });

    console.log('[Seed] Creating sample properties requested in project specification...');

    const sampleProperties = [
      // 1. Residential house in Hassan
      {
        title: 'Spacious 3 BHK Independent Villa with Private Garden in Hassan',
        description:
          'Beautifully designed east-facing independent duplex house with modular kitchen, private front garden, rainwater harvesting, and spacious terrace. Located in a tranquil, premium residential neighborhood of Hassan with seamless access to schools and markets.',
        purpose: 'sale',
        category: 'Houses',
        propertyType: 'Independent House',
        price: 8500000,
        monthlyRent: 0,
        securityDeposit: 0,
        isNegotiable: true,
        address: '#45, Sri Rama Layout, Behind New Bus Stand',
        locality: 'Sri Rama Layout',
        city: 'Hassan',
        district: 'Hassan',
        state: 'Karnataka',
        pinCode: '573201',
        bedrooms: 3,
        bathrooms: 3,
        builtUpArea: 2400,
        plotArea: 1800,
        furnishingStatus: 'Semi-Furnished',
        parking: 'Covered',
        propertyAge: '1-5 years',
        amenities: ['Private Garden', 'Borewell & Kaveri Water', 'Rainwater Harvesting', 'Solar Water Heater', 'CCTV Security'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-hassan-1',
          },
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-hassan-2',
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-hassan-3',
          },
        ],
        mapCoordinates: { lat: 13.0033, lng: 76.1004 },
        owner: owner1._id,
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        views: 142,
      },

      // 2. Apartment in Bengaluru
      {
        title: 'Luxury 3 BHK High-Rise Apartment in Indiranagar, Bengaluru',
        description:
          'Prestigious 3 BHK apartment situated on the 8th floor of a gated community. Features Italian marble flooring, 3 expansive balconies overlooking lush tree canopies, clubhouse access, swimming pool, and dedicated EV charging station. Direct deal with owner, zero brokerage.',
        purpose: 'sale',
        category: 'Apartments',
        propertyType: 'Apartment',
        price: 19500000,
        monthlyRent: 0,
        securityDeposit: 0,
        isNegotiable: false,
        address: 'Tower B - 802, Prestige Palms, 100 Feet Road, Indiranagar',
        locality: '100 Feet Road, Indiranagar',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        pinCode: '560038',
        bedrooms: 3,
        bathrooms: 3,
        builtUpArea: 1950,
        plotArea: 0,
        furnishingStatus: 'Furnished',
        parking: 'Covered',
        propertyAge: '0-1 years',
        amenities: ['Clubhouse', 'Swimming Pool', 'Gymnasium', 'Power Backup', '24/7 Security', 'Elevator', 'EV Charger'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-blr-apt-1',
          },
          {
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-blr-apt-2',
          },
          {
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-blr-apt-3',
          },
        ],
        mapCoordinates: { lat: 12.9784, lng: 77.6408 },
        owner: owner1._id,
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        views: 310,
      },

      // 3. Residential plot in Mysuru
      {
        title: 'Premium MUDA Approved 40x60 Residential Plot in Vijayanagar, Mysuru',
        description:
          'Clear titled, north-facing 2,400 sq.ft residential site situated in Vijayanagar 4th Stage, Mysuru. Wide 40-feet asphalted roads, underground drainage, street lighting, and piped water connection ready. Ideal for building your dream home or for long term capital appreciation.',
        purpose: 'sale',
        category: 'Residential Plots',
        propertyType: 'Plot',
        price: 6000000,
        monthlyRent: 0,
        securityDeposit: 0,
        isNegotiable: true,
        address: 'Site No. 842, 4th Stage, Vijayanagar',
        locality: 'Vijayanagar 4th Stage',
        city: 'Mysuru',
        district: 'Mysuru',
        state: 'Karnataka',
        pinCode: '570017',
        bedrooms: 0,
        bathrooms: 0,
        builtUpArea: 0,
        plotArea: 2400,
        furnishingStatus: 'N/A',
        parking: 'None',
        propertyAge: 'New Construction',
        amenities: ['MUDA Approved', 'Clear Title Deeds', 'Underground Drainage', '40ft Road Access', 'Water Supply'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-mys-plot-1',
          },
          {
            url: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-mys-plot-2',
          },
        ],
        mapCoordinates: { lat: 12.3375, lng: 76.5947 },
        owner: owner2._id,
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        views: 89,
      },

      // 4. Rental house in Mangaluru
      {
        title: 'Charming 2 BHK Sea-Breeze Rental Home in Kadri, Mangaluru',
        description:
          'Peaceful 2 BHK independent ground-floor house available for family rent. Well-ventilated rooms with abundant natural light, separate dining space, front sit-out with potted plants, and covered two-wheeler and four-wheeler parking. Peaceful residential street near Kadri Park.',
        purpose: 'rent',
        category: 'Houses',
        propertyType: 'Independent House',
        price: 22000,
        monthlyRent: 22000,
        securityDeposit: 150000,
        isNegotiable: true,
        address: 'Kadri Hills, Near Kadri Park & Temple Road',
        locality: 'Kadri',
        city: 'Mangaluru',
        district: 'Dakshina Kannada',
        state: 'Karnataka',
        pinCode: '575004',
        bedrooms: 2,
        bathrooms: 2,
        builtUpArea: 1350,
        plotArea: 2000,
        furnishingStatus: 'Semi-Furnished',
        parking: 'Covered',
        propertyAge: '5-10 years',
        amenities: ['24/7 Water Supply', 'Quiet Neighborhood', 'Covered Parking', 'Sit-out Veranda', 'Pet Friendly'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-mang-house-1',
          },
          {
            url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-mang-house-2',
          },
        ],
        mapCoordinates: { lat: 12.8703, lng: 74.8559 },
        owner: owner1._id,
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        views: 204,
      },

      // 5. Commercial shop in Bengaluru
      {
        title: 'High-Footfall Main Road Retail Commercial Shop in Koramangala, Bengaluru',
        description:
          'Prime corner commercial shop having high visibility and heavy footfall on 80 Feet Road, 4th Block, Koramangala. Ideal for retail showroom, specialty cafe, clinic, boutique, or corporate branch. Complete glass facade, 3-phase power, and dedicated customer parking.',
        purpose: 'rent',
        category: 'Shops and Offices',
        propertyType: 'Shop',
        price: 95000,
        monthlyRent: 95000,
        securityDeposit: 600000,
        isNegotiable: true,
        address: 'Ground Floor, #12, 80 Feet Road, 4th Block, Koramangala',
        locality: '80 Feet Road, Koramangala',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        pinCode: '560034',
        bedrooms: 0,
        bathrooms: 1,
        builtUpArea: 900,
        plotArea: 0,
        furnishingStatus: 'Unfurnished',
        parking: 'Open',
        propertyAge: '1-5 years',
        amenities: ['Main Road Facing', 'Glass Frontage', '3 Phase Commercial Power', 'Washroom', 'Fire Safety Compliant'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-blr-shop-1',
          },
          {
            url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-blr-shop-2',
          },
        ],
        mapCoordinates: { lat: 12.9352, lng: 77.6245 },
        owner: owner2._id,
        approvalStatus: 'approved',
        availabilityStatus: 'available',
        views: 450,
      },

      // 6. Agricultural Land in Mandya (Pending Approval for Admin demo)
      {
        title: '2-Acre Fertile Organic Agricultural Farmland with Canal Water in Mandya',
        description:
          'Rich red soil fertile farmland suitable for organic horticulture, coconut groves, and farming. Features continuous Kaveri irrigation canal water access and electricity connection.',
        purpose: 'sale',
        category: 'Agricultural Land',
        propertyType: 'Agricultural Land',
        price: 4800000,
        monthlyRent: 0,
        securityDeposit: 0,
        isNegotiable: true,
        address: 'Survey No. 42, Maddur Taluk, Mandya',
        locality: 'Maddur Taluk',
        city: 'Mandya',
        district: 'Mandya',
        state: 'Karnataka',
        pinCode: '571428',
        bedrooms: 0,
        bathrooms: 0,
        builtUpArea: 0,
        plotArea: 87120, // 2 acres in sq ft
        furnishingStatus: 'N/A',
        parking: 'None',
        propertyAge: 'Ready to Move',
        amenities: ['Canal Water Irrigation', 'Fenced Boundary', 'Electricity Connection', 'Tar Road Access'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed-mandya-1',
          },
        ],
        mapCoordinates: { lat: 12.5844, lng: 77.0452 },
        owner: owner1._id,
        approvalStatus: 'pending', // Pending status so Admin can test approve/reject
        availabilityStatus: 'available',
        views: 12,
      },
    ];

    const createdProps = await Property.insertMany(sampleProperties);
    console.log(`[Seed] Inserted ${createdProps.length} properties.`);

    // Add a Favorite for the demo buyer
    await Favorite.create({
      user: buyer._id,
      property: createdProps[1]._id, // Indiranagar apartment
    });

    // Add a demo Enquiry
    await Enquiry.create({
      property: createdProps[0]._id, // Hassan house
      buyer: buyer._id,
      buyerName: 'Kavya Nair',
      buyerEmail: 'buyer@propertyconnect.com',
      buyerPhone: '+91 97400 54321',
      message: 'Hello, I am interested in inspecting this Hassan villa this weekend. Is the price slightly negotiable?',
      enquiryStatus: 'pending',
    });

    // Add initial Admin Audit Log
    await AdminAuditLog.create({
      admin: admin._id,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'System',
      targetId: null,
      details: { note: 'Database initialized with demo users, properties and categories' },
    });

    console.log('\n======================================================');
    console.log(' SEED COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(' Demo Accounts:');
    console.log(' 1. Administrator:');
    console.log('    Email:    admin@propertyconnect.com');
    console.log('    Password: Admin@1234');
    console.log(' 2. Property Owner:');
    console.log('    Email:    owner@propertyconnect.com');
    console.log('    Password: Owner@1234');
    console.log(' 3. Buyer / Tenant:');
    console.log('    Email:    buyer@propertyconnect.com');
    console.log('    Password: Buyer@1234');
    console.log('======================================================\n');

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
