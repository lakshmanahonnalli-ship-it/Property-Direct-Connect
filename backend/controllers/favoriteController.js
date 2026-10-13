import Favorite from '../models/Favorite.js';
import Property from '../models/Property.js';
import { isDbConnected } from '../config/db.js';
import { inMemoryStore } from '../services/dbStore.js';

export const getFavorites = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const favorites = await Favorite.find({ user: req.user._id })
        .populate({
          path: 'property',
          populate: { path: 'owner', select: 'name phone phoneDisplayConsent ownerVerificationStatus' },
        })
        .sort({ createdAt: -1 });

      const validFavorites = favorites.filter((fav) => fav.property !== null);
      return res.status(200).json({ success: true, count: validFavorites.length, favorites: validFavorites });
    }

    const favorites = inMemoryStore.favorites
      .filter((fav) => (fav.user._id || fav.user).toString() === req.user._id.toString())
      .filter((fav) => fav.property !== null);

    res.status(200).json({ success: true, count: favorites.length, favorites });
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    if (isDbConnected()) {
      const property = await Property.findById(propertyId);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      const existing = await Favorite.findOne({ user: req.user._id, property: propertyId });
      if (existing) return res.status(400).json({ success: false, message: 'Property already in favorites' });

      const favorite = await Favorite.create({ user: req.user._id, property: propertyId });
      return res.status(201).json({ success: true, message: 'Property added to favorites', favorite });
    }

    const property = inMemoryStore.properties.find((p) => p._id.toString() === propertyId.toString());
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const existing = inMemoryStore.favorites.find(
      (f) =>
        (f.user._id || f.user).toString() === req.user._id.toString() &&
        (f.property._id || f.property).toString() === propertyId.toString()
    );
    if (existing) return res.status(400).json({ success: false, message: 'Property already in favorites' });

    const favorite = {
      _id: `66200000000000000000000${inMemoryStore.favorites.length + 10}`,
      user: req.user._id,
      property,
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.favorites.push(favorite);

    res.status(201).json({ success: true, message: 'Property added to favorites', favorite });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    if (isDbConnected()) {
      const favorite = await Favorite.findOneAndDelete({ user: req.user._id, property: propertyId });
      if (!favorite) return res.status(404).json({ success: false, message: 'Favorite record not found' });
      return res.status(200).json({ success: true, message: 'Property removed from favorites' });
    }

    const index = inMemoryStore.favorites.findIndex(
      (f) =>
        (f.user._id || f.user).toString() === req.user._id.toString() &&
        (f.property._id || f.property).toString() === propertyId.toString()
    );
    if (index === -1) return res.status(404).json({ success: false, message: 'Favorite not found' });

    inMemoryStore.favorites.splice(index, 1);
    res.status(200).json({ success: true, message: 'Property removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const checkFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    if (isDbConnected()) {
      const favorite = await Favorite.findOne({ user: req.user._id, property: propertyId });
      return res.status(200).json({ success: true, isFavorite: Boolean(favorite) });
    }

    const favorite = inMemoryStore.favorites.find(
      (f) =>
        (f.user._id || f.user).toString() === req.user._id.toString() &&
        (f.property._id || f.property).toString() === propertyId.toString()
    );
    res.status(200).json({ success: true, isFavorite: Boolean(favorite) });
  } catch (error) {
    next(error);
  }
};
