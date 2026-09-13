const fs = require('fs');
const path = require('path');

function writeWithDir(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 3. Farmer Cart Page: /farmer/cart/page.tsx
const cartPage = `'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function FarmerCartPage() {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/cart', {
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
      } else {
        setError(data.error?.message || 'Failed to load cart');
      }
    } catch (err: any) {
      setError('Error connecting to cart service');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    try {
      const res = await fetch(\`http://localhost:4000/api/v1/cart/items/\${cartItemId}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCart();
      }
    } catch (err: any) {
      alert('Failed to update item quantity');
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      const res = await fetch(\`http://localhost:4000/api/v1/cart/items/\${cartItemId}\`, {
        method: 'DELETE',
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const data = await res.json();
      if (data.success) {
        fetchCart();
      }
    } catch (err: any) {
      alert('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl animate-spin inline-block">⏳</span>
            <p className="mt-2 font-bold text-gray-600">Loading cart details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🛒</span> Your Shopping Cart
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Items added to your farmer cart with locked prices.
            </p>
          </div>
          <Link href="/farmer/marketplace" className="text-xs font-bold text-emerald-800 hover:underline">
            ← Continue Shopping
          </Link>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <span className="text-5xl">🛍️</span>
            <h3 className="text-lg font-bold text-gray-800 mt-3">Your Cart is Currently Empty</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Explore our crop protection marketplace to discover certified pesticides, bio-products, and growth enhancers.
            </p>
            <Link
              href="/farmer/marketplace"
              className="inline-block mt-6 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow transition"
            >
              Browse Crop Protection Marketplace →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl p-2 flex items-center justify-center flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="max-h-full object-contain" />
                      ) : (
                        <span className="text-2xl">🧪</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-700">{item.brand}</div>
                      <Link href={\`/farmer/marketplace/products/\${item.productSlug}\`}>
                        <h4 className="text-sm font-extrabold text-gray-900 hover:text-emerald-700 transition">
                          {item.productName}
                        </h4>
                      </Link>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Dealer: <strong>{item.shopName}</strong>
                      </div>
                      {item.packSize && (
                        <span className="inline-block text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded mt-1">
                          Pack: {item.packSize} {item.packUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-sm font-black text-gray-700 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-extrabold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-sm font-black text-gray-700 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-400">Subtotal</div>
                      <div className="text-base font-black text-emerald-950">₹{item.subtotal}</div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-fit space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3">
                Order Total Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-bold text-gray-900">{cart.summary.totalItemsCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Price Snapshot</span>
                  <span className="font-bold text-gray-900">₹{cart.summary.totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery</span>
                  <span className="font-bold text-emerald-700">Free Local Dealer Pickup</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-black text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-emerald-950">₹{cart.summary.totalAmount}</span>
              </div>

              {/* Disabled Checkout Banner for Phase 4 */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center">
                <span className="text-xl">💳</span>
                <h4 className="text-xs font-extrabold text-amber-950 mt-1">Payment & Order Placement</h4>
                <p className="text-[11px] text-amber-900 mt-1">
                  Cart reservation complete. Online payment gateway and order dispatch will be enabled in <strong>Phase 5</strong>.
                </p>
                <button
                  disabled
                  className="w-full mt-3 bg-gray-300 text-gray-500 font-extrabold text-xs py-2.5 rounded-xl cursor-not-allowed"
                >
                  Proceed to Checkout (Disabled in Phase 4)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`;

// 4. Compare Products Page: /farmer/marketplace/compare/page.tsx
const comparePage = `'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function CompareProductsPage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ids) {
      fetchComparison(ids);
    } else {
      setLoading(false);
    }
  }, [ids]);

  const fetchComparison = async (productIds: string) => {
    setLoading(true);
    try {
      const res = await fetch(\`http://localhost:4000/api/v1/marketplace/products/compare?productIds=\${productIds}\`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error?.message || 'Failed to compare products');
      }
    } catch (err: any) {
      setError('Error fetching comparison data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/farmer/marketplace" className="text-xs font-bold text-emerald-800 hover:underline">
            ← Back to Marketplace
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <span>⚖️</span> Side-by-Side Product Comparison
        </h1>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl animate-spin inline-block">⏳</span>
            <p className="mt-2 text-sm font-semibold">Comparing product specifications...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-gray-800 mt-2">No Products Selected</h3>
            <p className="text-xs text-gray-500 mt-1">Select products from the marketplace catalog to compare.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase w-48">Specification</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 text-center">
                      <div className="text-xs font-bold text-emerald-700">{p.brand}</div>
                      <div className="text-sm font-black text-gray-900">{p.name}</div>
                      <div className="text-base font-black text-emerald-950 mt-1">₹{p.sellingPrice}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Active Ingredients</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-center font-semibold text-gray-900">
                      {p.activeIngredients || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Toxicity Label Class</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-center font-bold">
                      {p.compliance?.toxicityClass || 'Green'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Pre-Harvest Interval (PHI)</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-center font-bold text-amber-900">
                      {p.compliance?.waitingPeriodDays ? \`\${p.compliance.waitingPeriodDays} Days\` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Dosage Recommendation</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-center text-gray-700">
                      {p.dosageInstructions || 'As per label'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">CIB Registration No.</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-center font-mono text-gray-600 text-[11px]">
                      {p.compliance?.cgbRegistrationNo || 'Verified'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
`;

// 5. Seller Marketplace Page: /seller/marketplace/page.tsx
const sellerMarketplacePage = `'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function SellerMarketplacePage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token && user?.role === 'SELLER') {
      fetchSellerListings();
    }
  }, [token]);

  const fetchSellerListings = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/seller/marketplace/listings', {
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (err: any) {
      console.error('Failed to load seller listings', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>📦</span> Retailer Inventory & Shop Listings Manager
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage product pricing and stock inventory for {data?.businessName || 'your agri retail store'}.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl animate-spin inline-block">⏳</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-extrabold text-sm text-gray-800">
              Active Shop Listings ({data?.listings?.length || 0})
            </div>
            {data?.listings?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs font-semibold">
                No active listings yet. Add products to start selling to local farmers.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase border-b border-gray-200">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Shop</th>
                    <th className="p-3">Pack Variant</th>
                    <th className="p-3">Stock Available</th>
                    <th className="p-3">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.listings?.map((l: any) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{l.product?.name}</td>
                      <td className="p-3 text-gray-600">{l.shop?.shopName}</td>
                      <td className="p-3 font-semibold">{l.variant?.packSize} {l.variant?.packUnit}</td>
                      <td className="p-3 font-bold text-emerald-800">{l.quantityAvailable} units</td>
                      <td className="p-3 font-black text-emerald-950 text-sm">₹{l.sellingPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
`;

// 6. Admin Marketplace Page: /admin/marketplace/page.tsx
const adminMarketplacePage = `'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function AdminMarketplacePage() {
  const { token, user } = useAuth();
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchPendingProducts();
    }
  }, [token]);

  const fetchPendingProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/admin/marketplace/pending-products', {
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const data = await res.json();
      if (data.success) {
        setPendingProducts(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load pending products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(\`http://localhost:4000/api/v1/admin/marketplace/products/\${id}/review\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPendingProducts();
      }
    } catch (err: any) {
      alert('Review failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🏷️</span> Admin Catalog Control & Product Approval Queue
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review seller submitted crop protection listings for CIB regulatory compliance before publishing.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl animate-spin inline-block">⏳</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-extrabold text-sm text-gray-800">
              Pending Product Approvals ({pendingProducts.length})
            </div>
            {pendingProducts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs font-semibold">
                ✅ All submitted products have been reviewed. Queue is currently empty.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase border-b border-gray-200">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Seller Business</th>
                    <th className="p-3">Pesticide License</th>
                    <th className="p-3">CIB Reg No.</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{p.name}</td>
                      <td className="p-3 text-gray-600">{p.seller?.businessName}</td>
                      <td className="p-3 font-mono">{p.seller?.pesticideLicenseNo}</td>
                      <td className="p-3 font-mono">{p.compliance?.cgbRegistrationNo || 'Pending'}</td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(p.id, 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(p.id, 'REJECTED')}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
`;

writeWithDir(path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'cart', 'page.tsx'), cartPage);
writeWithDir(path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'marketplace', 'compare', 'page.tsx'), comparePage);
writeWithDir(path.join(__dirname, 'apps', 'web', 'src', 'app', 'seller', 'marketplace', 'page.tsx'), sellerMarketplacePage);
writeWithDir(path.join(__dirname, 'apps', 'web', 'src', 'app', 'admin', 'marketplace', 'page.tsx'), adminMarketplacePage);

console.log('Created remaining 4 Web UI pages successfully.');
