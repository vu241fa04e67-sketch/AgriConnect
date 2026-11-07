import Crop from '../models/Crop.js';
import User from '../models/User.js';

export async function listCrops(req, res) {
  try {
    const { search = '', category = '', location = '', sort = 'newest', page = 1, limit = 12 } = req.query;
    const filter = { status: 'Active' };

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { cropName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    let query = Crop.find(filter).populate('farmerId', 'name farmName location phone isVerified');

    if (location && location.trim()) {
      const farmerIds = await User.find({
        role: 'Farmer',
        $or: [
          { location: { $regex: location.trim(), $options: 'i' } },
          { farmName: { $regex: location.trim(), $options: 'i' } }
        ]
      }).distinct('_id');
      query = query.where('farmerId').in(farmerIds);
    }

    const sortMap = {
      price_low: { pricePerUnit: 1 },
      price_high: { pricePerUnit: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 }
    };

    const p = Math.max(1, Number(page));
    const n = Math.min(50, Math.max(1, Number(limit)));

    const [items, total] = await Promise.all([
      query.sort(sortMap[sort] || sortMap.newest).skip((p - 1) * n).limit(n),
      Crop.countDocuments(filter)
    ]);

    res.json({ items, total, page: p, pages: Math.ceil(total / n) });
  } catch (e) {
    res.status(500).json({ message: 'Could not load crops', error: e.message });
  }
}

export async function getCrop(req, res) {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmerId', 'name farmName location phone isVerified');
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (e) {
    res.status(404).json({ message: 'Crop not found or invalid ID' });
  }
}

export async function createCrop(req, res) {
  try {
    const { cropName, category, quantityAvailable, unit = 'kg', pricePerUnit, description = '', imageUrl = '' } = req.body;
    if (!cropName || !category || !(Number(quantityAvailable) > 0) || !(Number(pricePerUnit) >= 0)) {
      return res.status(400).json({ message: 'Enter a valid crop name, category, positive quantity, and price' });
    }

    const crop = await Crop.create({
      farmerId: req.user._id,
      cropName,
      category,
      quantityAvailable: Number(quantityAvailable),
      unit,
      pricePerUnit: Number(pricePerUnit),
      description,
      imageUrl
    });

    res.status(201).json(crop);
  } catch (e) {
    res.status(400).json({ message: 'Could not create crop listing', error: e.message });
  }
}

export async function updateCrop(req, res) {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    if (String(crop.farmerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    const fields = ['cropName', 'category', 'quantityAvailable', 'unit', 'pricePerUnit', 'description', 'imageUrl', 'status'];
    for (const f of fields) {
      if (req.body[f] !== undefined) crop[f] = req.body[f];
    }
    await crop.save();
    res.json(crop);
  } catch (e) {
    res.status(400).json({ message: 'Update failed', error: e.message });
  }
}

export async function deleteCrop(req, res) {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    if (String(crop.farmerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }
    crop.status = 'Inactive';
    await crop.save();
    res.json({ message: 'Listing deactivated successfully' });
  } catch (e) {
    res.status(400).json({ message: 'Could not deactivate listing', error: e.message });
  }
}

export async function myCrops(req, res) {
  try {
    const crops = await Crop.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (e) {
    res.status(500).json({ message: 'Could not load your crops', error: e.message });
  }
}
