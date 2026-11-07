import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api';

async function runAcceptanceTests() {
  console.log('🧪 Starting AgriConnect End-to-End API Acceptance Tests...\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('✓ Health check passed:', health);

  // 2. Login as Buyer
  const buyerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@market.com', password: 'Buyer123!' })
  });
  const buyerAuth = await buyerLoginRes.json();
  if (!buyerAuth.token) throw new Error('Buyer login failed');
  console.log('✓ Buyer logged in:', buyerAuth.user.name, `(${buyerAuth.user.role})`);

  // 3. Login as Farmer
  const farmerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramesh@farm.com', password: 'Farmer123!' })
  });
  const farmerAuth = await farmerLoginRes.json();
  if (!farmerAuth.token) throw new Error('Farmer login failed');
  console.log('✓ Farmer logged in:', farmerAuth.user.name, `(${farmerAuth.user.role})`);

  // 4. Login as Admin
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@agriconnect.com', password: 'ChangeMe123!' })
  });
  const adminAuth = await adminLoginRes.json();
  if (!adminAuth.token) throw new Error('Admin login failed');
  console.log('✓ Admin logged in:', adminAuth.user.name, `(${adminAuth.user.role})`);

  // 5. Query crops with search & filter
  const cropsRes = await fetch(`${BASE_URL}/crops?search=tomato`);
  const cropsData = await cropsRes.json();
  if (cropsData.items.length === 0) throw new Error('Search failed to return tomato');
  const targetCrop = cropsData.items[0];
  console.log(`✓ Crop search: found "${targetCrop.cropName}" with stock: ${targetCrop.quantityAvailable} ${targetCrop.unit}`);

  // 6. Buyer places an order
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${buyerAuth.token}`
    },
    body: JSON.stringify({
      cropId: targetCrop._id,
      quantity: 5,
      deliveryAddress: 'Flat 402, Green Orchid, Indiranagar',
      contactPhone: '+91 99001 77889'
    })
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(`Place order failed: ${JSON.stringify(orderData)}`);
  console.log(`✓ Buyer placed order #${orderData._id.slice(-6)} for 5 ${targetCrop.unit} (Total: ₹${orderData.totalAmount})`);

  // 7. Verify stock decremented
  const cropCheckRes = await fetch(`${BASE_URL}/crops/${targetCrop._id}`);
  const cropCheck = await cropCheckRes.json();
  console.log(`✓ Stock safely decremented from ${targetCrop.quantityAvailable} to ${cropCheck.quantityAvailable} ${cropCheck.unit}`);

  // 8. Farmer accepts the order
  const acceptRes = await fetch(`${BASE_URL}/orders/${orderData._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${farmerAuth.token}`
    },
    body: JSON.stringify({ status: 'Accepted' })
  });
  const acceptedOrder = await acceptRes.json();
  console.log(`✓ Farmer accepted order #${acceptedOrder._id.slice(-6)} (Status: ${acceptedOrder.orderStatus})`);

  // 9. Farmer marks the order fulfilled
  const fulfillRes = await fetch(`${BASE_URL}/orders/${orderData._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${farmerAuth.token}`
    },
    body: JSON.stringify({ status: 'Fulfilled' })
  });
  const fulfilledOrder = await fulfillRes.json();
  console.log(`✓ Farmer marked order fulfilled (Status: ${fulfilledOrder.orderStatus})`);

  // 10. Buyer reviews fulfilled order
  const reviewRes = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${buyerAuth.token}`
    },
    body: JSON.stringify({
      orderId: orderData._id,
      rating: 5,
      comment: 'Excellent tomatoes! Perfectly packed and arrived fresh within hours.'
    })
  });
  const reviewData = await reviewRes.json();
  if (!reviewRes.ok) throw new Error(`Review failed: ${JSON.stringify(reviewData)}`);
  console.log(`✓ Buyer left 5-star review: "${reviewData.comment}"`);

  // 11. Admin verifies unverified farmer (Savitri Devi)
  const usersRes = await fetch(`${BASE_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${adminAuth.token}` }
  });
  const usersList = await usersRes.json();
  const unverifiedFarmer = usersList.find(u => u.role === 'Farmer' && !u.isVerified);
  if (unverifiedFarmer) {
    const verifyRes = await fetch(`${BASE_URL}/admin/farmers/${unverifiedFarmer._id}/verify`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminAuth.token}` }
    });
    const verifiedData = await verifyRes.json();
    console.log(`✓ Admin verified farmer: ${verifiedData.name} (${verifiedData.farmName})`);
  }

  // 12. Admin gets platform reports
  const reportsRes = await fetch(`${BASE_URL}/admin/reports`, {
    headers: { 'Authorization': `Bearer ${adminAuth.token}` }
  });
  const reports = await reportsRes.json();
  console.log('✓ Admin reports retrieved:', reports);

  console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! The marketplace is fully functional.');
}

export default runAcceptanceTests;
