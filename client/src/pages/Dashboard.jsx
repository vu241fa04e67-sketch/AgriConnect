import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Edit,
  Trash2,
  Star,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Farmer new crop form
  const [form, setForm] = useState({
    cropName: '',
    category: 'Vegetables',
    quantityAvailable: '',
    unit: 'kg',
    pricePerUnit: '',
    description: '',
    imageUrl: ''
  });

  // Buyer review modal state
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Edit crop modal state
  const [editingCrop, setEditingCrop] = useState(null);

  async function load() {
    setLoading(true);
    try {
      if (user.role === 'Farmer') {
        const [c, o] = await Promise.all([api.get('/crops/mine'), api.get('/orders/my')]);
        setCrops(c.data || []);
        setOrders(o.data || []);
      } else if (user.role === 'Buyer') {
        const o = await api.get('/orders/my');
        setOrders(o.data || []);
      } else if (user.role === 'Admin') {
        const [u, s] = await Promise.all([api.get('/admin/users'), api.get('/admin/reports')]);
        setUsers(u.data || []);
        setStats(s.data || null);
      }
    } catch (e) {
      setErrMsg(e.response?.data?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  function showNotification(text, isError = false) {
    if (isError) {
      setErrMsg(text);
      setTimeout(() => setErrMsg(''), 4000);
    } else {
      setMsg(text);
      setTimeout(() => setMsg(''), 4000);
    }
  }

  // Farmer: Add crop
  async function addCrop(e) {
    e.preventDefault();
    try {
      await api.post('/crops', {
        ...form,
        quantityAvailable: Number(form.quantityAvailable),
        pricePerUnit: Number(form.pricePerUnit)
      });
      setForm({
        cropName: '',
        category: 'Vegetables',
        quantityAvailable: '',
        unit: 'kg',
        pricePerUnit: '',
        description: '',
        imageUrl: ''
      });
      showNotification('✅ Crop listing published successfully!');
      load();
    } catch (e) {
      showNotification(e.response?.data?.message || 'Could not add crop listing', true);
    }
  }

  // Farmer: Update order status (Accepted, Rejected, Fulfilled)
  async function updateStatus(id, status) {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      showNotification(`Order marked as ${status}`);
      load();
    } catch (e) {
      showNotification(e.response?.data?.message || 'Status update failed', true);
    }
  }

  // Buyer: Cancel order
  async function cancelOrder(id) {
    if (!window.confirm('Are you sure you want to cancel this pending order?')) return;
    try {
      await api.patch(`/orders/${id}/cancel`);
      showNotification('Order cancelled and stock restored to farmer.');
      load();
    } catch (e) {
      showNotification(e.response?.data?.message || 'Cancel failed', true);
    }
  }

  // Admin: Verify Farmer
  async function verifyFarmer(id) {
    try {
      await api.patch(`/admin/farmers/${id}/verify`);
      showNotification('Farmer account verified successfully!');
      load();
    } catch (e) {
      showNotification(e.response?.data?.message || 'Verification failed', true);
    }
  }

  // Farmer: Deactivate crop
  async function removeCrop(id) {
    if (!window.confirm('Deactivate this crop listing?')) return;
    try {
      await api.delete(`/crops/${id}`);
      showNotification('Crop listing deactivated');
      load();
    } catch (e) {
      showNotification(e.response?.data?.message || 'Deactivation failed', true);
    }
  }

  // Farmer: Save edited crop
  async function saveCropEdit(e) {
    e.preventDefault();
    try {
      await api.patch(`/crops/${editingCrop._id}`, {
        cropName: editingCrop.cropName,
        category: editingCrop.category,
        quantityAvailable: Number(editingCrop.quantityAvailable),
        unit: editingCrop.unit,
        pricePerUnit: Number(editingCrop.pricePerUnit),
        description: editingCrop.description,
        imageUrl: editingCrop.imageUrl,
        status: editingCrop.status
      });
      setEditingCrop(null);
      showNotification('Crop details updated!');
      load();
    } catch (e) {
      showNotification(e.response?.data?.message || 'Update failed', true);
    }
  }

  // Buyer: Submit review
  async function submitReview(e) {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        orderId: reviewOrder._id,
        rating: Number(reviewRating),
        comment: reviewComment
      });
      setReviewOrder(null);
      setReviewComment('');
      showNotification('⭐ Review submitted! Thank you for supporting the farmer.');
    } catch (e) {
      showNotification(e.response?.data?.message || 'Could not submit review', true);
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <main className="section dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>Welcome, {user.name}</h1>
          <p className="muted">
            Signed in as <b>{user.role}</b> {user.farmName ? `• ${user.farmName}` : ''}{' '}
            {user.location ? `• ${user.location}` : ''}
          </p>
        </div>
      </div>

      {msg && <p className="success-banner">{msg}</p>}
      {errMsg && <p className="error-banner">{errMsg}</p>}

      {/* ================= FARMER VIEW ================= */}
      {user.role === 'Farmer' && (
        <>
          <section className="stats-grid">
            <div className="stat">
              <span>My Active Listings</span>
              <b>{crops.filter(c => c.status === 'Active').length}</b>
            </div>
            <div className="stat">
              <span>Incoming Orders</span>
              <b>{orders.length}</b>
            </div>
            <div className="stat">
              <span>Pending Action</span>
              <b>{orders.filter(o => o.orderStatus === 'Pending').length}</b>
            </div>
            <div className="stat">
              <span>Fulfilled Orders</span>
              <b>{orders.filter(o => o.orderStatus === 'Fulfilled').length}</b>
            </div>
          </section>

          {/* Add Crop Listing Panel */}
          <section className="panel">
            <div className="panel-header">
              <h2>
                <PlusCircle size={20} /> Publish a New Harvest Listing
              </h2>
              <p className="muted">Make your freshly harvested crops available to buyers nationwide.</p>
            </div>
            <form className="crop-form" onSubmit={addCrop}>
              <label>
                Crop Name
                <input
                  value={form.cropName}
                  onChange={e => setForm({ ...form, cropName: e.target.value })}
                  placeholder="e.g. Organic Alphonso Mangoes"
                  required
                />
              </label>

              <label>
                Category
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Other'].map(x => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity Available
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.quantityAvailable}
                  onChange={e => setForm({ ...form, quantityAvailable: e.target.value })}
                  placeholder="e.g. 250"
                  required
                />
              </label>

              <label>
                Unit
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option value="kg">kg (Kilograms)</option>
                  <option value="quintal">quintal (100 kg)</option>
                </select>
              </label>

              <label>
                Price per Unit (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.pricePerUnit}
                  onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                  placeholder="e.g. 45"
                  required
                />
              </label>

              <label>
                Crop Photo URL (Unsplash or direct image link)
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </label>

              <label className="wide">
                Produce Description
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your harvesting process, organic certification, packaging, freshness..."
                />
              </label>

              <div className="crop-form-submit wide">
                <button className="primary-button">Publish Crop Listing</button>
              </div>
            </form>
          </section>

          {/* Manage My Crops */}
          <section className="panel">
            <h2>My Crop Inventory ({crops.length})</h2>
            {crops.length === 0 ? (
              <p className="empty-muted">You have not published any crops yet. Use the form above to add your first crop.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Category</th>
                      <th>Available Stock</th>
                      <th>Price / Unit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map(c => (
                      <tr key={c._id}>
                        <td>
                          <b>{c.cropName}</b>
                        </td>
                        <td>
                          <span className="tag">{c.category}</span>
                        </td>
                        <td>
                          {c.quantityAvailable} {c.unit}
                        </td>
                        <td>₹{c.pricePerUnit}</td>
                        <td>
                          <span className={`status-badge status-${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button className="text-button" onClick={() => setEditingCrop({ ...c })}>
                            <Edit size={13} /> Edit
                          </button>{' '}
                          {c.status === 'Active' && (
                            <button
                              className="text-button danger"
                              onClick={() => removeCrop(c._id)}
                            >
                              <Trash2 size={13} /> Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Incoming Orders for Farmer */}
          <section className="panel">
            <h2>Incoming Buyer Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <p className="empty-muted">No buyer orders received yet. Active crop listings will receive orders here.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer</th>
                      <th>Contact Phone</th>
                      <th>Crop</th>
                      <th>Quantity</th>
                      <th>Total (₹)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td>
                          <small className="mono">#{o._id.slice(-6)}</small>
                        </td>
                        <td>{o.buyerId?.name || 'Buyer'}</td>
                        <td>{o.contactPhone || o.buyerId?.phone || '—'}</td>
                        <td>
                          <b>{o.cropName}</b>
                        </td>
                        <td>
                          {o.quantity} {o.unit}
                        </td>
                        <td>₹{o.totalAmount}</td>
                        <td>
                          <span className={`status-badge status-${o.orderStatus.toLowerCase()}`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td>
                          {o.orderStatus === 'Pending' && (
                            <div className="action-button-group">
                              <button
                                className="action-btn accept-btn"
                                onClick={() => updateStatus(o._id, 'Accepted')}
                              >
                                Accept
                              </button>
                              <button
                                className="action-btn reject-btn"
                                onClick={() => updateStatus(o._id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {o.orderStatus === 'Accepted' && (
                            <button
                              className="action-btn fulfill-btn"
                              onClick={() => updateStatus(o._id, 'Fulfilled')}
                            >
                              Mark Fulfilled
                            </button>
                          )}
                          {o.orderStatus === 'Fulfilled' && (
                            <span className="text-muted-check">✓ Delivered</span>
                          )}
                          {o.orderStatus === 'Cancelled' && (
                            <span className="text-muted-x">Cancelled by buyer</span>
                          )}
                          {o.orderStatus === 'Rejected' && (
                            <span className="text-muted-x">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ================= BUYER VIEW ================= */}
      {user.role === 'Buyer' && (
        <>
          <section className="stats-grid">
            <div className="stat">
              <span>Total Orders Placed</span>
              <b>{orders.length}</b>
            </div>
            <div className="stat">
              <span>Pending Confirmation</span>
              <b>{orders.filter(o => o.orderStatus === 'Pending').length}</b>
            </div>
            <div className="stat">
              <span>Accepted / In Delivery</span>
              <b>{orders.filter(o => o.orderStatus === 'Accepted').length}</b>
            </div>
            <div className="stat">
              <span>Completed Purchases</span>
              <b>{orders.filter(o => o.orderStatus === 'Fulfilled').length}</b>
            </div>
          </section>

          <section className="panel">
            <div className="row-between">
              <h2>My Order History ({orders.length})</h2>
              <a href="/#market" className="text-button">
                + Browse More Crops
              </a>
            </div>
            {orders.length === 0 ? (
              <div className="empty-panel">
                <p>You have not placed any orders yet.</p>
                <a href="/#market" className="primary-button">
                  Discover Fresh Crops
                </a>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Farmer / Farm</th>
                      <th>Crop</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Amount</th>
                      <th>Delivery Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td>
                          <small className="mono">#{o._id.slice(-6)}</small>
                        </td>
                        <td>
                          <b>{o.farmerId?.farmName || o.farmerId?.name || 'Producer'}</b>
                          <br />
                          <small className="muted">{o.farmerId?.location}</small>
                        </td>
                        <td>{o.cropName}</td>
                        <td>
                          {o.quantity} {o.unit}
                        </td>
                        <td>₹{o.unitPriceAtOrder}</td>
                        <td>
                          <b>₹{o.totalAmount}</b>
                        </td>
                        <td>
                          <small>{o.deliveryAddress}</small>
                        </td>
                        <td>
                          <span className={`status-badge status-${o.orderStatus.toLowerCase()}`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td>
                          {o.orderStatus === 'Pending' && (
                            <button
                              className="action-btn cancel-btn"
                              onClick={() => cancelOrder(o._id)}
                            >
                              Cancel Order
                            </button>
                          )}
                          {o.orderStatus === 'Fulfilled' && (
                            <button
                              className="action-btn review-btn"
                              onClick={() => {
                                setReviewOrder(o);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                            >
                              <Star size={13} /> Rate Farmer
                            </button>
                          )}
                          {o.orderStatus === 'Accepted' && (
                            <span className="muted">Farmer is preparing order</span>
                          )}
                          {o.orderStatus === 'Cancelled' && <span className="muted">Cancelled</span>}
                          {o.orderStatus === 'Rejected' && <span className="muted">Rejected</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ================= ADMIN VIEW ================= */}
      {user.role === 'Admin' && (
        <>
          <section className="stats-grid">
            <div className="stat">
              <span>Total Registered Users</span>
              <b>{stats?.userCount ?? 0}</b>
            </div>
            <div className="stat">
              <span>Active Crops Listed</span>
              <b>{stats?.cropCount ?? 0}</b>
            </div>
            <div className="stat">
              <span>Total Market Orders</span>
              <b>{stats?.orderCount ?? 0}</b>
            </div>
            <div className="stat">
              <span>Fulfilled GMV Sales</span>
              <b>₹{Number(stats?.completedSales || 0).toLocaleString('en-IN')}</b>
            </div>
          </section>

          <section className="panel">
            <h2>User Management & Farmer Verification ({users.length})</h2>
            <p className="muted">
              Verify farmer credentials to grant verified badge and foster trust across the marketplace.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Farm / Business</th>
                    <th>Location</th>
                    <th>Contact Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <b>{u.name}</b>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role}</span>
                      </td>
                      <td>{u.farmName || '—'}</td>
                      <td>{u.location || '—'}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        {u.role === 'Farmer' ? (
                          u.isVerified ? (
                            <span className="verified-chip">
                              <CheckCircle2 size={13} /> Verified
                            </span>
                          ) : (
                            <span className="unverified-chip">Unverified</span>
                          )
                        ) : (
                          'Active'
                        )}
                      </td>
                      <td>
                        {u.role === 'Farmer' && !u.isVerified && (
                          <button
                            className="action-btn verify-btn"
                            onClick={() => verifyFarmer(u._id)}
                          >
                            <ShieldCheck size={14} /> Verify Farmer
                          </button>
                        )}
                        {u.role === 'Farmer' && u.isVerified && (
                          <span className="text-muted-check">Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ================= EDIT CROP MODAL ================= */}
      {editingCrop && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="row-between">
              <h3>Edit Crop Listing</h3>
              <button className="close-btn" onClick={() => setEditingCrop(null)}>
                ×
              </button>
            </div>
            <form onSubmit={saveCropEdit} className="crop-form modal-form">
              <label>
                Crop Name
                <input
                  value={editingCrop.cropName}
                  onChange={e => setEditingCrop({ ...editingCrop, cropName: e.target.value })}
                  required
                />
              </label>

              <label>
                Category
                <select
                  value={editingCrop.category}
                  onChange={e => setEditingCrop({ ...editingCrop, category: e.target.value })}
                >
                  {['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Other'].map(x => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Stock Available
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editingCrop.quantityAvailable}
                  onChange={e =>
                    setEditingCrop({ ...editingCrop, quantityAvailable: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Unit
                <select
                  value={editingCrop.unit}
                  onChange={e => setEditingCrop({ ...editingCrop, unit: e.target.value })}
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                </select>
              </label>

              <label>
                Price per Unit (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingCrop.pricePerUnit}
                  onChange={e => setEditingCrop({ ...editingCrop, pricePerUnit: e.target.value })}
                  required
                />
              </label>

              <label>
                Listing Status
                <select
                  value={editingCrop.status}
                  onChange={e => setEditingCrop({ ...editingCrop, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <label className="wide">
                Image URL
                <input
                  value={editingCrop.imageUrl || ''}
                  onChange={e => setEditingCrop({ ...editingCrop, imageUrl: e.target.value })}
                />
              </label>

              <label className="wide">
                Description
                <textarea
                  value={editingCrop.description || ''}
                  onChange={e => setEditingCrop({ ...editingCrop, description: e.target.value })}
                />
              </label>

              <div className="wide modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditingCrop(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= REVIEW BUYER MODAL ================= */}
      {reviewOrder && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="row-between">
              <h3>Rate Your Purchase</h3>
              <button className="close-btn" onClick={() => setReviewOrder(null)}>
                ×
              </button>
            </div>
            <p className="muted">
              Order #{reviewOrder._id.slice(-6)} • <b>{reviewOrder.cropName}</b> from{' '}
              <b>{reviewOrder.farmerId?.farmName || reviewOrder.farmerId?.name}</b>
            </p>
            <form onSubmit={submitReview} className="review-form">
              <label>
                Star Rating:
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      className={`star-select-btn ${reviewRating >= star ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-label">{reviewRating} of 5 Stars</span>
                </div>
              </label>

              <label>
                Feedback & Review Comment
                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share details about harvest quality, freshness, and delivery..."
                  required
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setReviewOrder(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
