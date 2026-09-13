const fs = require('fs');
const path = require('path');

// 1. Fix Compare Page
const comparePath = path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'marketplace', 'compare', 'page.tsx');
const compareCode = `'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function CompareContent() {
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
                  {products.map((p: any) => (
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
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center font-semibold text-gray-900">
                      {p.activeIngredients || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Toxicity Label Class</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center font-bold">
                      {p.compliance?.toxicityClass || 'Green'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Pre-Harvest Interval (PHI)</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center font-bold text-amber-900">
                      {p.compliance?.waitingPeriodDays ? \`\${p.compliance.waitingPeriodDays} Days\` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Dosage Recommendation</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center text-gray-700">
                      {p.dosageInstructions || 'As per label'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">CIB Registration No.</td>
                  {products.map((p: any) => (
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

export default function CompareProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-gray-600">Loading Product Comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
`;
fs.writeFileSync(comparePath, compareCode, 'utf8');

// 2. Fix Register Page
const registerPath = path.join(__dirname, 'apps', 'web', 'src', 'app', 'register', 'page.tsx');
let regContent = fs.readFileSync(registerPath, 'utf8');
regContent = regContent.replace(/^export const dynamic = 'force-dynamic';\r?\n/m, '');
regContent = regContent.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, Suspense } from 'react';");
regContent = regContent.replace('export default function RegisterPage() {', 'function RegisterForm() {');
regContent += `\n\nexport default function RegisterPage() {\n  return (\n    <Suspense fallback={<div className="p-8 text-center font-bold text-gray-600">Loading Registration...</div>}>\n      <RegisterForm />\n    </Suspense>\n  );\n}\n`;
fs.writeFileSync(registerPath, regContent, 'utf8');

// 3. Fix Reset Password Page
const resetPath = path.join(__dirname, 'apps', 'web', 'src', 'app', 'reset-password', 'page.tsx');
let resetContent = fs.readFileSync(resetPath, 'utf8');
resetContent = resetContent.replace(/^export const dynamic = 'force-dynamic';\r?\n/m, '');
resetContent = resetContent.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, Suspense } from 'react';");
resetContent = resetContent.replace('export default function ResetPasswordPage() {', 'function ResetPasswordForm() {');
resetContent += `\n\nexport default function ResetPasswordPage() {\n  return (\n    <Suspense fallback={<div className="p-8 text-center font-bold text-gray-600">Loading Reset Password...</div>}>\n      <ResetPasswordForm />\n    </Suspense>\n  );\n}\n`;
fs.writeFileSync(resetPath, resetContent, 'utf8');

console.log('Fixed Suspense wrappers for compare, register, and reset-password pages.');
