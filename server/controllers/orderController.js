import mongoose from 'mongoose';
import Crop from '../models/Crop.js';
import Order from '../models/Order.js';

// Executes transaction when replica set is active; falls back to atomic document updates on standalone MongoDB
async function runWithTransactionOrFallback(fn) {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      return result;
    } catch (txErr) {
      const msg = txErr.message || '';
      if (
        msg.includes('replica set') ||
        msg.includes('Transaction numbers are only allowed') ||
        msg.includes('Transactions are not supported')
      ) {
        // Standalone MongoDB fallback
      } else {
        throw txErr;
      }
    }
  } finally {
    if (session) {
      try { await session.endSession(); } catch {}
    }
  }

  // Standalone mode: run without transaction session
  return await fn(null);
}

export async function placeOrder(req, res) {
  const { cropId, quantity, deliveryAddress, contactPhone } = req.body;
  const qty = Number(quantity);

  if (!mongoose.isValidObjectId(cropId) || !Number.isFinite(qty) || qty <= 0 || !deliveryAddress || !contactPhone) {
    return res.status(400).json({ message: 'Provide a valid crop, quantity, address and phone' });
  }

  try {
    const order = await runWithTransactionOrFallback(async (session) => {
      const sessionOpt = session ? { session } : {};

      // Atomically check availability and decrement quantity
      const crop = await Crop.findOneAndUpdate(
        { _id: cropId, status: 'Active', quantityAvailable: { $gte: qty } },
        { $inc: { quantityAvailable: -qty } },
        { new: true, ...sessionOpt }
      );

      if (!crop) {
        throw new Error('Crop is unavailable or requested quantity exceeds stock');
      }

      try {
        let created;
        if (session) {
          created = await Order.create([{
            buyerId: req.user._id,
            farmerId: crop.farmerId,
            cropId: crop._id,
            cropName: crop.cropName,
            quantity: qty,
            unit: crop.unit,
            unitPriceAtOrder: crop.pricePerUnit,
            totalAmount: Number((qty * crop.pricePerUnit).toFixed(2)),
            deliveryAddress,
            contactPhone
          }], sessionOpt);
          return created[0];
        } else {
          created = await Order.create({
            buyerId: req.user._id,
            farmerId: crop.farmerId,
            cropId: crop._id,
            cropName: crop.cropName,
            quantity: qty,
            unit: crop.unit,
            unitPriceAtOrder: crop.pricePerUnit,
            totalAmount: Number((qty * crop.pricePerUnit).toFixed(2)),
            deliveryAddress,
            contactPhone
          });
          return created;
        }
      } catch (orderErr) {
        // If standalone and order creation failed, restore the decremented stock
        if (!session) {
          await Crop.updateOne({ _id: cropId }, { $inc: { quantityAvailable: qty } });
        }
        throw orderErr;
      }
    });

    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ message: e.message || 'Could not place order' });
  }
}

export async function myOrders(req, res) {
  try {
    const filter = req.user.role === 'Farmer' ? { farmerId: req.user._id } : { buyerId: req.user._id };
    const orders = await Order.find(filter)
      .populate('buyerId', 'name phone email')
      .populate('farmerId', 'name farmName phone location')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: 'Could not fetch orders', error: e.message });
  }
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  if (!['Accepted', 'Rejected', 'Fulfilled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await runWithTransactionOrFallback(async (session) => {
      const sessionOpt = session ? { session } : {};
      const foundOrder = await Order.findOne({ _id: req.params.id, farmerId: req.user._id }, null, sessionOpt);

      if (!foundOrder) {
        throw new Error('Order not found');
      }

      if (foundOrder.orderStatus !== 'Pending' && !(foundOrder.orderStatus === 'Accepted' && status === 'Fulfilled')) {
        throw new Error('This status transition is not allowed');
      }

      if (status === 'Rejected') {
        await Crop.updateOne(
          { _id: foundOrder.cropId },
          { $inc: { quantityAvailable: foundOrder.quantity } },
          sessionOpt
        );
      }

      foundOrder.orderStatus = status;
      await foundOrder.save(sessionOpt);
      return foundOrder;
    });

    res.json(order);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function cancelOrder(req, res) {
  try {
    const order = await runWithTransactionOrFallback(async (session) => {
      const sessionOpt = session ? { session } : {};
      const foundOrder = await Order.findOne({ _id: req.params.id, buyerId: req.user._id }, null, sessionOpt);

      if (!foundOrder || foundOrder.orderStatus !== 'Pending') {
        throw new Error('Only your pending orders can be cancelled');
      }

      foundOrder.orderStatus = 'Cancelled';
      await foundOrder.save(sessionOpt);

      await Crop.updateOne(
        { _id: foundOrder.cropId },
        { $inc: { quantityAvailable: foundOrder.quantity } },
        sessionOpt
      );

      return foundOrder;
    });

    res.json(order);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
