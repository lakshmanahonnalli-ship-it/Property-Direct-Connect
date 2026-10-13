import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { connectDB, closeDB } from '../config/db.js';

const run = async () => {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const email = (args[0] || process.env.ADMIN_EMAIL || 'admin@propertyconnect.com').toLowerCase().trim();
    const password = args[1] || process.env.ADMIN_PASSWORD || 'Admin@12345';
    const name = args[2] || 'System Administrator';
    const phone = args[3] || '+91 98765 43210';

    console.log(`[Admin Provisioning] Creating/Updating admin user: ${email}`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let admin = await User.findOne({ email });
    if (admin) {
      admin.role = 'admin';
      admin.passwordHash = passwordHash;
      admin.accountStatus = 'active';
      admin.name = name;
      admin.phone = phone;
      await admin.save();
      console.log(`[Admin Provisioning] Existing user updated to Administrator successfully.`);
    } else {
      admin = await User.create({
        name,
        email,
        phone,
        passwordHash,
        role: 'admin',
        accountStatus: 'active',
        ownerVerificationStatus: 'verified',
        phoneDisplayConsent: true,
      });
      console.log(`[Admin Provisioning] New Administrator account created successfully.`);
    }

    console.log(`Credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: admin`);

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('[Admin Provisioning Error]:', err.message);
    process.exit(1);
  }
};

run();
