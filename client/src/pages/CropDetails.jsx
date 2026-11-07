import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, CheckCircle2, Phone, Star, ShieldCheck, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function CropDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [crop, setCrop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: cropData } = await api.get(`/crops/${id}`);
        setCrop(cropData);

        if (cropData.farmerId?._id) {
          const { data: revData } = await api.get(`/reviews/farmer/${cropData.farmerId._id}`);
          setReviews(revData || []);
        }
      } catch (err) {
        setMessage('Crop not found or listing has ended.');
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (user) {
      if (user.address && !address) setAddress(user.address);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  async function handleOrder(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await api.post('/orders', {
        cropId: id,
        quantity: Number(qty),
        deliveryAddress: address,
        contactPhone: phone
      });
      setMessage('🎉 Order placed successfully! Redirecting to your dashboard...');
      setTimeout(() => nav('/dashboard'), 1200);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to place order. Please check available stock.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!crop) {
    return (
      <main className="section loading-wrap">
        <p>{message || 'Loading crop details...'}</p>
        <Link to="/" className="text-button">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
      </main>
    );
  }

  const farmer = crop.farmerId || {};
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <main className="section detail-layout">
      <div>
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
        <div className="detail-image">
          {crop.imageUrl ? (
            <img src={crop.imageUrl} alt={crop.cropName} />
          ) : (
            <span className="big-emoji">🌽</span>
          )}
        </div>

        {/* Farmer Reviews Section */}
        <div className="panel reviews-panel">
          <div className="row-between">
            <h3>Farmer Reviews ({reviews.length})</h3>
            {avgRating && (
              <span className="rating-pill">
                <Star size={14} fill="#f59e0b" color="#f59e0b" /> {avgRating} / 5.0
              </span>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="muted">No reviews yet for this producer.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r._id} className="review-card">
                  <div className="row-between">
                    <b>{r.buyerId?.name || 'Verified Buyer'}</b>
                    <span className="star-display">
                      {'★'.repeat(r.rating)}
                      <span className="star-empty">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  <small className="muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="detail-info-col">
        <div className="row-between">
          <span className="tag">{crop.category}</span>
          <span className={`status-badge status-${crop.status.toLowerCase()}`}>
            {crop.status} Listing
          </span>
        </div>

        <h1>{crop.cropName}</h1>
        <h2 className="price">
          ₹{crop.pricePerUnit} <small>per {crop.unit}</small>
        </h2>

        <p className="crop-description">
          {crop.description || 'Harvested directly from local fields with rigorous quality selection.'}
        </p>

        <div className="farmer-profile-card">
          <div className="row-between">
            <h4>Farmer Information</h4>
            {farmer.isVerified && (
              <span className="verified-chip">
                <CheckCircle2 size={13} /> Verified Producer
              </span>
            )}
          </div>
          <p>
            <b>Farm Name:</b> {farmer.farmName || 'Independent Producer'}
          </p>
          <p>
            <b>Farmer:</b> {farmer.name}
          </p>
          <p className="meta-row">
            <MapPin size={14} /> {farmer.location || 'Location upon request'}
          </p>
          {farmer.phone && (
            <p className="meta-row">
              <Phone size={14} /> {farmer.phone}
            </p>
          )}
        </div>

        <div className="stock-info-box">
          <span>Available Stock:</span>
          <b>
            {crop.quantityAvailable} {crop.unit}
          </b>
        </div>

        {/* Order placement form */}
        {user?.role === 'Buyer' ? (
          <form className="order-form" onSubmit={handleOrder}>
            <h3>
              <ShoppingCart size={18} /> Place Order
            </h3>

            <label>
              Quantity ({crop.unit})
              <input
                type="number"
                min="0.1"
                max={crop.quantityAvailable}
                step="0.1"
                value={qty}
                onChange={e => setQty(e.target.value)}
                required
              />
            </label>

            <label>
              Delivery Address
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Where should the farmer deliver?"
                required
              />
            </label>

            <label>
              Contact Phone
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone for delivery coordination"
                required
              />
            </label>

            <div className="order-summary-box">
              <span>Total Payable to Farmer:</span>
              <b className="total-price">
                ₹{(Number(qty || 0) * crop.pricePerUnit).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </b>
            </div>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <button
              className="primary-button full"
              disabled={submitting || crop.quantityAvailable <= 0}
            >
              {submitting ? 'Confirming Order...' : crop.quantityAvailable <= 0 ? 'Out of Stock' : 'Confirm Order'}
            </button>
          </form>
        ) : !user ? (
          <div className="callout-box">
            <p>
              Please <Link to="/login"><b>sign in as a Buyer</b></Link> to order produce directly from this farmer.
            </p>
          </div>
        ) : user.role === 'Farmer' ? (
          <div className="callout-box info">
            <p>You are signed in as a <b>Farmer</b>. Switch to a Buyer account to place orders on crops.</p>
          </div>
        ) : (
          <div className="callout-box info">
            <p>Signed in as <b>Admin</b>. You can moderate this listing from your Dashboard.</p>
          </div>
        )}
      </div>
    </main>
  );
}
