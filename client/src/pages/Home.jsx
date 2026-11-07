import { useEffect, useState } from 'react';
import { Search, Leaf, Truck, ShieldCheck, MapPin, ArrowUpDown, XCircle } from 'lucide-react';
import api from '../services/api';
import CropCard from '../components/CropCard';

export default function Home() {
  const [crops, setCrops] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/crops', {
        params: { search, category, location, sort }
      });
      setCrops(data.items || []);
      setTotal(data.total || 0);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load crops. Ensure backend API is active.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [search, category, location, sort]);

  function clearFilters() {
    setSearch('');
    setCategory('');
    setLocation('');
    setSort('newest');
  }

  const hasActiveFilters = Boolean(search || category || location || sort !== 'newest');

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">DIRECT FARMER-TO-BUYER COMMERCE</span>
          <h1>
            Good food starts<br />with <em>honest connections.</em>
          </h1>
          <p>
            Eliminate middlemen. Purchase harvest-fresh produce, organic grains, and spices directly
            from verified local farms with transparent prices and secure stock-managed ordering.
          </p>
          <div className="hero-actions">
            <a href="#market" className="primary-button">
              Explore Available Crops
            </a>
            <a href="/register" className="secondary-button">
              Join as Farmer or Buyer
            </a>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun" />
          <div className="hero-emoji">🌾🥬🍅</div>
          <div className="hero-note">🌱 100% Direct from Verified Farms</div>
        </div>
      </section>

      <section className="benefits">
        <div>
          <Leaf />
          <b>Harvest Fresh</b>
          <span>Picked and shipped direct from farms</span>
        </div>
        <div>
          <Truck />
          <b>Direct Sourcing</b>
          <span>Zero distributor markups & fair wages</span>
        </div>
        <div>
          <ShieldCheck />
          <b>Verified Producers</b>
          <span>Admin-verified farmer profiles</span>
        </div>
      </section>

      <main id="market" className="market section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE LIVE MARKETPLACE</span>
            <h2>Fresh Produce Catalog</h2>
            <p className="muted">
              Real-time available harvest from verified regional farmers. Showing {crops.length} of {total} crops.
            </p>
          </div>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by crop, e.g. Tomatoes, Basmati, Turmeric..."
            />
            {search && (
              <button className="clear-input-btn" onClick={() => setSearch('')}>
                ×
              </button>
            )}
          </div>

          <div className="search-box location-box">
            <MapPin size={18} />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Filter by state / city (e.g. Punjab, Nashik)"
            />
            {location && (
              <button className="clear-input-btn" onClick={() => setLocation('')}>
                ×
              </button>
            )}
          </div>

          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Other'].map(x => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Sort: Newly Listed</option>
            <option value="price_low">Sort: Price (Low to High)</option>
            <option value="price_high">Sort: Price (High to Low)</option>
          </select>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters} title="Reset all filters">
              <XCircle size={15} /> Reset
            </button>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading fresh harvests...</p>
          </div>
        ) : crops.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🌾</p>
            <h3>No crops matching your filters</h3>
            <p className="muted">Try adjusting your search keywords or resetting your category and location filters.</p>
            {hasActiveFilters && (
              <button className="outline-button" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="crop-grid">
            {crops.map(c => (
              <CropCard key={c._id} crop={c} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
