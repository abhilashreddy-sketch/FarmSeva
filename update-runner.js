const fs = require('fs');
const path = require('path');

const runnerPath = path.join(__dirname, 'apps', 'api', 'src', '__tests__', 'native-runner.ts');
let code = fs.readFileSync(runnerPath, 'utf8');

// Replace header
code = code.replace(
  '🧪 FARM SEVA - NATIVE HTTP PHASE 2 & 3 BASELINE TEST SUITE',
  '🧪 FARM SEVA - NATIVE HTTP PHASE 2, 3 & 4 INTEGRATED TEST SUITE'
);

const phase4TestCases = `
    let coragenProductId = '';
    let coragenVariantId = '';
    let cartItemId = '';

    // 13. Marketplace Categories
    await testCase('13. Marketplace: Get Categories & Subcategories', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/marketplace/categories\`);
      const data = await res.json();
      if (res.status !== 200 || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error('Get categories failed: ' + JSON.stringify(data));
      }
    });

    // 14. Marketplace Product Catalog Search
    await testCase('14. Marketplace: Search & Filter Products', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/marketplace/products?search=Coragen&sortBy=price_asc\`);
      const data = await res.json();
      if (res.status !== 200 || !data.data.products || data.data.products.length === 0) {
        throw new Error('Search products failed: ' + JSON.stringify(data));
      }
      coragenProductId = data.data.products[0].id;
    });

    // 15. Marketplace Product Details by Slug
    await testCase('15. Marketplace: Get Product Details by Slug & Compliance Info', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/marketplace/products/coragen-sc-insecticide\`);
      const data = await res.json();
      if (res.status !== 200 || !data.data.compliance || data.data.compliance.toxicityClass !== 'Blue') {
        throw new Error('Get product details failed: ' + JSON.stringify(data));
      }
      if (data.data.variants.length > 0) {
        coragenVariantId = data.data.variants[0].id;
      }
    });

    // 16. Crop-Aware Product Discovery for Farmer A
    await testCase('16. Marketplace: Farmer Crop-Aware Product Discovery (Chilli Crop)', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/marketplace/products/crop-recommendations\`, {
        headers: { Authorization: \`Bearer \${farmerAccessToken}\` },
      });
      const data = await res.json();
      if (res.status !== 200 || !data.data.recommendedProducts) {
        throw new Error('Crop-aware recommendations failed: ' + JSON.stringify(data));
      }
    });

    // 17. Product Comparison
    await testCase('17. Marketplace: Product Side-by-Side Spec Comparison', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/marketplace/products/compare?productIds=\${coragenProductId}\`);
      const data = await res.json();
      if (res.status !== 200 || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error('Compare products failed: ' + JSON.stringify(data));
      }
    });

    // 18. Cart: Add Item to Cart
    await testCase('18. Cart: Farmer A Add Product to Cart', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/cart/items\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({
          productId: coragenProductId,
          variantId: coragenVariantId || undefined,
          quantity: 2,
        }),
      });
      const data = await res.json();
      if (res.status !== 201 || !data.data.id) {
        throw new Error('Add to cart failed: ' + JSON.stringify(data));
      }
      cartItemId = data.data.id;
    });

    // 19. Cart: Get Cart Summary & Subtotal
    await testCase('19. Cart: Get Farmer A Cart & Calculate Subtotal', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/cart\`, {
        headers: { Authorization: \`Bearer \${farmerAccessToken}\` },
      });
      const data = await res.json();
      if (res.status !== 200 || data.data.summary.totalItemsCount !== 2 || data.data.summary.totalAmount <= 0) {
        throw new Error('Get cart failed: ' + JSON.stringify(data));
      }
    });

    // 20. Cart: Update Item Quantity
    await testCase('20. Cart: Update Item Quantity in Cart', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/cart/items/\${cartItemId}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({ quantity: 5 }),
      });
      const data = await res.json();
      if (res.status !== 200 || data.data.quantity !== 5) {
        throw new Error('Update cart item failed: ' + JSON.stringify(data));
      }
    });

    // 21. OWNERSHIP SECURITY: Farmer B Accessing Farmer A Cart Item Rejected (403)
    await testCase('21. OWNERSHIP SECURITY: Farmer B Modifying Farmer A Cart Item Rejected (403)', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/cart/items/\${cartItemId}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerBToken}\`,
        },
        body: JSON.stringify({ quantity: 100 }),
      });
      const data = await res.json();
      if (res.status !== 403 || data.error.code !== 'AUTH_OWNERSHIP_DENIED') {
        throw new Error(\`Expected 403 AUTH_OWNERSHIP_DENIED, got \${res.status}\`);
      }
    });

    // 22. Cart: Delete Cart Item & Clear Cart
    await testCase('22. Cart: Delete Cart Item & Clear Cart', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/cart/items/\${cartItemId}\`, {
        method: 'DELETE',
        headers: { Authorization: \`Bearer \${farmerAccessToken}\` },
      });
      const data = await res.json();
      if (res.status !== 200) {
        throw new Error('Delete cart item failed: ' + JSON.stringify(data));
      }
    });
`;

code = code.replace(
  "console.log('\\n==================================================');\n    console.log(`📊 BASELINE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);",
  phase4TestCases + "\n    console.log('\\n==================================================');\n    console.log(`📊 INTEGRATED TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);"
);

fs.writeFileSync(runnerPath, code, 'utf8');
console.log('Updated native-runner.ts with Phase 4 test cases.');
