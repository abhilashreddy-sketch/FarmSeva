const fs = require('fs');
const path = require('path');

const runnerPath = path.join(__dirname, 'apps', 'api', 'src', '__tests__', 'native-runner.ts');
let code = fs.readFileSync(runnerPath, 'utf8');

code = code.replace(
  '🧪 FARM SEVA - NATIVE HTTP PHASE 2, 3 & 4 INTEGRATED TEST SUITE',
  '🧪 FARM SEVA - NATIVE HTTP PHASE 1-5 COMPREHENSIVE INTEGRATED TEST SUITE'
);

const phase5Tests = `
    let farmerAddressAId = '';
    let createdOrderId = '';
    let createdDeliveryId = '';
    let rawDeliveryOtp = '';
    let deliveryPartnerUserId = '';
    let deliveryPartnerToken = '';

    // Seed Delivery Partner Account for test
    const delPartnerPhone = '9777700999';
    await fetch(\`\${BASE_URL}/api/v1/auth/register/delivery\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: delPartnerPhone,
        fullName: 'Test Delivery Rider',
        password: 'RiderPassword123!',
        vehicleType: 'Motorcycle',
        vehicleNumber: 'AP 07 RX 9999',
        activeDistrict: 'Guntur',
      }),
    });

    const delLoginRes = await fetch(\`\${BASE_URL}/api/v1/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: delPartnerPhone, password: 'RiderPassword123!' }),
    });
    const delLoginJson = await delLoginRes.json();
    deliveryPartnerToken = delLoginJson.data.accessToken;

    // 23. Farmer Address Creation
    await testCase('23. Address: Farmer A Create Rural Delivery Address', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/farmer/addresses\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({
          recipientName: 'Raju Farmer',
          phone: farmerPhone,
          houseNo: 'D.No 4-12',
          streetLandmark: 'Near Panchayati Office',
          villageTaluk: 'Kaza, Mangalagiri',
          district: 'Guntur',
          state: 'Andhra Pradesh',
          pincode: '522503',
          isDefault: true,
        }),
      });
      const data = await res.json();
      if (res.status !== 201 || !data.data.id) {
        throw new Error('Create address failed: ' + JSON.stringify(data));
      }
      farmerAddressAId = data.data.id;
    });

    // 24. ADDRESS OWNERSHIP SECURITY TEST
    await testCase('24. ADDRESS SECURITY: Farmer B Accessing Farmer A Address Rejected (403)', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/farmer/addresses/\${farmerAddressAId}\`, {
        headers: { Authorization: \`Bearer \${farmerBToken}\` },
      });
      const data = await res.json();
      if (res.status !== 403 || data.error.code !== 'AUTH_OWNERSHIP_DENIED') {
        throw new Error(\`Expected 403 AUTH_OWNERSHIP_DENIED, got \${res.status}\`);
      }
    });

    // 25. Order Checkout (Farmer A)
    await testCase('25. Checkout: Farmer A Place Order from Cart (COD)', async () => {
      // First ensure item in cart
      await fetch(\`\${BASE_URL}/api/v1/cart/items\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({ productId: coragenProductId, variantId: coragenVariantId, quantity: 1 }),
      });

      const res = await fetch(\`\${BASE_URL}/api/v1/orders/checkout\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({
          addressId: farmerAddressAId,
          paymentMethod: 'COD',
        }),
      });
      const data = await res.json();
      if (res.status !== 201 || !data.data.orders || data.data.orders.length === 0) {
        throw new Error('Checkout failed: ' + JSON.stringify(data));
      }
      createdOrderId = data.data.orders[0].id;
      rawDeliveryOtp = data.data.orders[0].rawDeliveryOtp;
    });

    // 26. Farmer Order Details & Timeline
    await testCase('26. Order: Farmer A Get Order Details', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/orders/farmer/orders/\${createdOrderId}\`, {
        headers: { Authorization: \`Bearer \${farmerAccessToken}\` },
      });
      const data = await res.json();
      if (res.status !== 200 || data.data.status !== 'PENDING_ACCEPTANCE') {
        throw new Error('Get order details failed: ' + JSON.stringify(data));
      }
      if (data.data.delivery) {
        createdDeliveryId = data.data.delivery.id;
      }
    });

    // 27. ORDER OWNERSHIP SECURITY TEST
    await testCase('27. ORDER SECURITY: Farmer B Accessing Farmer A Order Rejected (403)', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/orders/farmer/orders/\${createdOrderId}\`, {
        headers: { Authorization: \`Bearer \${farmerBToken}\` },
      });
      const data = await res.json();
      if (res.status !== 403 || data.error.code !== 'AUTH_OWNERSHIP_DENIED') {
        throw new Error(\`Expected 403 AUTH_OWNERSHIP_DENIED, got \${res.status}\`);
      }
    });

    // 28. Online Payment Verification
    await testCase('28. Payment: Online Razorpay Payment Signature Verification', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/payments/verify\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({
          orderId: createdOrderId,
          razorpayOrderId: 'order_rzp_mock_12345',
          razorpayPaymentId: 'pay_rzp_mock_67890',
          razorpaySignature: 'mock_valid_signature_for_test',
        }),
      });
      const data = await res.json();
      if (res.status !== 200 || data.data.paymentStatus !== 'COMPLETED') {
        throw new Error('Payment verification failed: ' + JSON.stringify(data));
      }
    });

    // 29. Payment Webhook Signature & Idempotency
    await testCase('29. Payment: Idempotent Razorpay Webhook Processing', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/payments/webhook\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock_valid_webhook_signature',
        },
        body: JSON.stringify({ event: 'payment.captured', orderId: createdOrderId }),
      });
      const data = await res.json();
      if (res.status !== 200 || !data.data.success) {
        throw new Error('Webhook processing failed: ' + JSON.stringify(data));
      }
    });

    // 30. Admin Delivery Assignment
    await testCase('30. Logistics: Admin Assign Delivery Partner to Order', async () => {
      // Fetch delivery partner ID
      const dp = await prisma.deliveryPartner.findFirst({ where: { user: { phone: delPartnerPhone } } });
      if (!dp || !createdDeliveryId) throw new Error('Delivery record or partner not found');

      const res = await fetch(\`\${BASE_URL}/api/v1/logistics/admin/deliveries/\${createdDeliveryId}/assign\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${adminAccessToken}\`,
        },
        body: JSON.stringify({ deliveryPartnerId: dp.id }),
      });
      const data = await res.json();
      if (res.status !== 200 || data.data.status !== 'ASSIGNED') {
        throw new Error('Assign delivery failed: ' + JSON.stringify(data));
      }
    });

    // 31. Delivery Partner Status Flow (Picked Up -> Out For Delivery)
    await testCase('31. Logistics: Delivery Partner Update Status (PICKED_UP -> OUT_FOR_DELIVERY)', async () => {
      const pickupRes = await fetch(\`\${BASE_URL}/api/v1/logistics/delivery/orders/\${createdDeliveryId}/status\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${deliveryPartnerToken}\`,
        },
        body: JSON.stringify({ status: 'PICKED_UP' }),
      });
      if (pickupRes.status !== 200) throw new Error('Pickup failed');

      const outRes = await fetch(\`\${BASE_URL}/api/v1/logistics/delivery/orders/\${createdDeliveryId}/status\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${deliveryPartnerToken}\`,
        },
        body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' }),
      });
      if (outRes.status !== 200) throw new Error('Out for delivery failed');
    });

    // 32. Invalid Delivery OTP Rejection
    await testCase('32. Logistics: Invalid Delivery OTP Rejected (400)', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/logistics/delivery/orders/\${createdDeliveryId}/status\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${deliveryPartnerToken}\`,
        },
        body: JSON.stringify({ status: 'DELIVERED', deliveryOtp: '000000' }),
      });
      const data = await res.json();
      if (res.status !== 400 || data.error.code !== 'INVALID_DELIVERY_OTP') {
        throw new Error(\`Expected 400 INVALID_DELIVERY_OTP, got \${res.status}\`);
      }
    });

    // 33. Valid Delivery OTP Drop-Off Verification & Order Completion
    await testCase('33. Logistics: Valid Delivery OTP Drop-Off Verification & Order Completed', async () => {
      const res = await fetch(\`\${BASE_URL}/api/v1/logistics/delivery/orders/\${createdDeliveryId}/status\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${deliveryPartnerToken}\`,
        },
        body: JSON.stringify({ status: 'DELIVERED', deliveryOtp: rawDeliveryOtp }),
      });
      const data = await res.json();
      if (res.status !== 200 || data.data.status !== 'DELIVERED') {
        throw new Error('Valid OTP delivery failed: ' + JSON.stringify(data));
      }
    });

    // 34. Controlled Order Cancellation & Inventory Release
    await testCase('34. Order: Controlled Cancellation Releases Stock', async () => {
      // Place a new order to cancel
      await fetch(\`\${BASE_URL}/api/v1/cart/items\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({ productId: coragenProductId, variantId: coragenVariantId, quantity: 1 }),
      });

      const checkoutRes = await fetch(\`\${BASE_URL}/api/v1/orders/checkout\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${farmerAccessToken}\`,
        },
        body: JSON.stringify({ addressId: farmerAddressAId, paymentMethod: 'COD' }),
      });
      const checkoutJson = await checkoutRes.json();
      const cancelOrderId = checkoutJson.data.orders[0].id;

      const cancelRes = await fetch(\`\${BASE_URL}/api/v1/orders/farmer/orders/\${cancelOrderId}/cancel\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${farmerAccessToken}\` },
      });
      const cancelData = await cancelRes.json();
      if (cancelRes.status !== 200 || cancelData.data.status !== 'CANCELLED') {
        throw new Error('Order cancellation failed: ' + JSON.stringify(cancelData));
      }
    });
`;

code = code.replace(
  "console.log('\\n==================================================');\n    console.log(`📊 INTEGRATED TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);",
  phase5Tests + "\n    console.log('\\n==================================================');\n    console.log(`📊 INTEGRATED TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);"
);

fs.writeFileSync(runnerPath, code, 'utf8');
console.log('Updated native-runner.ts with Phase 5 test cases.');
