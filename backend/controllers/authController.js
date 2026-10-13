import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from '../services/dbStore.js';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'propertyconnect_super_secret_jwt_key_2026_xyz987';
  return jwt.sign({ id }, secret, {
    expiresIn: '7d',
  });
};

const sanitizeUser = (user) => {
  const clone = { ...(user.toObject ? user.toObject() : user) };
  delete clone.passwordHash;
  return clone;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate
    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }
    } else {
      const existingUser = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }
    }

    const assignedRole = role === 'owner' ? 'owner' : 'buyer';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser;
    if (isDbConnected()) {
      newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        role: assignedRole,
        phoneDisplayConsent: true,
        accountStatus: 'active',
        ownerVerificationStatus: 'unverified',
      });
    } else {
      newUser = {
        _id: `66000000000000000000000${inMemoryStore.users.length + 5}`,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        role: assignedRole,
        profileImage: '',
        phoneDisplayConsent: true,
        accountStatus: 'active',
        ownerVerificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
      };
      inMemoryStore.users.push(newUser);
    }

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user;

    if (isDbConnected()) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact administrator support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, phoneDisplayConsent, profileImage } = req.body;

    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim();
      if (typeof phoneDisplayConsent === 'boolean') {
        user.phoneDisplayConsent = phoneDisplayConsent;
      }
      if (profileImage !== undefined) {
        user.profileImage = profileImage;
      }
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: sanitizeUser(user),
      });
    } else {
      const user = inMemoryStore.users.find((u) => u._id.toString() === req.user._id.toString());
      if (user) {
        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (typeof phoneDisplayConsent === 'boolean') {
          user.phoneDisplayConsent = phoneDisplayConsent;
        }
        if (profileImage !== undefined) {
          user.profileImage = profileImage;
        }
      }
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: sanitizeUser(user),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findById(req.user._id);
    } else {
      user = inMemoryStore.users.find((u) => u._id.toString() === req.user._id.toString());
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    if (isDbConnected()) {
      user.passwordHash = newHash;
      await user.save();
    } else {
      user.passwordHash = newHash;
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
