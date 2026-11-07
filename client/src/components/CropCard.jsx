import { MapPin, ShoppingBasket, CheckCircle2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CropCard({ crop }) {
  const isVerified = crop.farmerId?.isVerified;
  const farmName = crop.farmerId?.farmName || crop.farmerId?.name;

  return (
    <article className="crop-card">
      <div className="crop-image">
        {crop.imageUrl ? (
          <img src={crop.imageUrl} alt={crop.cropName} loading="lazy" />
        ) : (
          <span className="crop-fallback-icon">🌾</span>
        )}
      </div>
      <div className="crop-body">
        <div className="row-between">
          <span className="tag">{crop.category}</span>
          <b className="price">
            ₹{crop.pricePerUnit}
            <small>/{crop.unit}</small>
          </b>
        </div>
        <h3 title={crop.cropName}>{crop.cropName}</h3>

        <div className="farmer-meta">
          <span className="farmer-name">
            <Building2 size={13} /> {farmName}
          </span>
          {isVerified && (
            <span className="verified-chip" title="Verified Producer">
              <CheckCircle2 size={12} /> Verified
            </span>
          )}
        </div>

        <p className="location-line">
          <MapPin size={13} /> {crop.farmerId?.location || 'Location not specified'}
        </p>

        <div className="stock-line">
          <span className="stock-pill">
            Stock: <b>{crop.quantityAvailable} {crop.unit}</b>
          </span>
        </div>

        <Link className="outline-button" to={`/crops/${crop._id}`}>
          <ShoppingBasket size={15} /> Order produce
        </Link>
      </div>
    </article>
  );
}
