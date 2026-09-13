import { PrismaClient, UserRole, UserStatus, SellerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FARM SEVA database seeding (DEMO / DEVELOPMENT DATA ONLY)...');

  const saltRounds = 12;
  const defaultPassword = 'DemoPassword123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // 1. ADMIN USER (System Operator)
  const adminUser = await prisma.user.upsert({
    where: { phone: '9999900000' },
    update: {},
    create: {
      phone: '9999900000',
      email: 'admin@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'System Administrator (DEMO)',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'en',
    },
  });
  console.log('✅ Created Demo Admin User:', adminUser.phone);

  // 2. FARMER USER 1 (Telugu - Low Digital Literacy Profile)
  const farmerUser1 = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      phone: '9876543210',
      email: 'farmer1@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Ramesh Reddy (DEMO)',
      role: UserRole.FARMER,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'te',
      farmerProfile: {
        create: {
          experienceYears: 15,
          totalLandAcres: 5.5,
          primaryWaterSource: 'Borewell',
        },
      },
    },
  });
  console.log('✅ Created Demo Farmer 1:', farmerUser1.phone);

  // 3. FARMER USER 2 (Kannada Profile)
  const farmerUser2 = await prisma.user.upsert({
    where: { phone: '9876543211' },
    update: {},
    create: {
      phone: '9876543211',
      email: 'farmer2@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Suresh Gowda (DEMO)',
      role: UserRole.FARMER,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'kn',
      farmerProfile: {
        create: {
          experienceYears: 20,
          totalLandAcres: 12.0,
          primaryWaterSource: 'Canal',
        },
      },
    },
  });
  console.log('✅ Created Demo Farmer 2:', farmerUser2.phone);

  // 4. SELLER USER (APPROVED Dealer)
  const sellerUserApproved = await prisma.user.upsert({
    where: { phone: '9123456780' },
    update: {},
    create: {
      phone: '9123456780',
      email: 'dealer.kisan@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Venkatesh Rao (DEMO Dealer)',
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'te',
      sellerProfile: {
        create: {
          businessName: 'Kisan Krishi Seva Kendra (DEMO)',
          pesticideLicenseNo: 'AP/GNT/PEST/2024/9876',
          fertilizerLicenseNo: 'AP/GNT/FERT/2024/5432',
          verificationStatus: SellerStatus.APPROVED,
          verifiedAt: new Date(),
          shops: {
            create: {
              shopName: 'Kisan Krishi Seva Kendra Main Shop',
              addressLine: 'Main Road, Near Bus Stand',
              villageLandmark: 'Guntur Rural',
              taluk: 'Guntur',
              district: 'Guntur',
              state: 'Andhra Pradesh',
              pincode: '522001',
              contactPhone: '9123456780',
            },
          },
        },
      },
    },
  });
  console.log('✅ Created Demo Approved Seller:', sellerUserApproved.phone);

  // 5. SELLER USER (PENDING Verification Dealer)
  const sellerUserPending = await prisma.user.upsert({
    where: { phone: '9123456781' },
    update: {},
    create: {
      phone: '9123456781',
      email: 'new.dealer@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Anand Kumar (DEMO Pending Dealer)',
      role: UserRole.SELLER,
      status: UserStatus.PENDING_VERIFICATION,
      preferredLanguage: 'hi',
      sellerProfile: {
        create: {
          businessName: 'Green Field Agri Supplies (DEMO)',
          pesticideLicenseNo: 'KA/BLR/PEST/2025/1122',
          verificationStatus: SellerStatus.SUBMITTED,
          shops: {
            create: {
              shopName: 'Green Field Agri Supplies',
              addressLine: 'APMC Yard, Shop #12',
              taluk: 'Kolar',
              district: 'Kolar',
              state: 'Karnataka',
              pincode: '563101',
              contactPhone: '9123456781',
            },
          },
        },
      },
    },
  });
  console.log('✅ Created Demo Pending Seller:', sellerUserPending.phone);

  // 6. AGRICULTURAL EXPERT USER (APPROVED)
  const expertUser = await prisma.user.upsert({
    where: { phone: '9888877770' },
    update: {},
    create: {
      phone: '9888877770',
      email: 'dr.sharma@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Dr. Rajesh Sharma (DEMO Expert)',
      role: UserRole.AGRICULTURAL_EXPERT,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'hi',
      expertProfile: {
        create: {
          specialization: 'Plant Pathology & Crop Protection',
          qualification: 'Ph.D. in Agricultural Pathology (UAS Dharwad)',
          certificationNo: 'ICAR-EXP-2022-887',
          yearsExperience: 12,
        },
      },
    },
  });
  console.log('✅ Created Demo Agricultural Expert:', expertUser.phone);

  // 7. DELIVERY PARTNER USER (ACTIVE)
  const deliveryUser = await prisma.user.upsert({
    where: { phone: '9777766660' },
    update: {},
    create: {
      phone: '9777766660',
      email: 'delivery.ravi@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Ravi Kumar (DEMO Delivery)',
      role: UserRole.DELIVERY_PARTNER,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'te',
      deliveryProfile: {
        create: {
          vehicleType: 'Motorcycle',
          vehicleNumber: 'AP 07 AB 1234',
          activeDistrict: 'Guntur',
        },
      },
    },
  });
  console.log('✅ Created Demo Delivery Partner:', deliveryUser.phone);

  // 8. CALL CENTER AGENT USER (ACTIVE)
  const agentUser = await prisma.user.upsert({
    where: { phone: '9666655550' },
    update: {},
    create: {
      phone: '9666655550',
      email: 'agent.laxmi@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Laxmi Devi (DEMO Call Center Agent)',
      role: UserRole.CALL_CENTER_AGENT,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'te',
      callCenterProfile: {
        create: {
          agentCode: 'AGT-1042',
          department: 'FARMER_ASSISTED_SUPPORT',
          deskPhone: '0863-224455',
        },
      },
    },
  });
  console.log('✅ Created Demo Call Center Agent:', agentUser.phone);

  // 9. SUSPENDED USER (Demonstration of blocked access)
  const suspendedUser = await prisma.user.upsert({
    where: { phone: '9000000000' },
    update: {},
    create: {
      phone: '9000000000',
      email: 'suspended@farmseva.demo',
      passwordHash: hashedPassword,
      fullName: 'Suspended Account (DEMO)',
      role: UserRole.FARMER,
      status: UserStatus.SUSPENDED,
      preferredLanguage: 'en',
    },
  });
  console.log('✅ Created Demo Suspended User:', suspendedUser.phone);

  // 10. MARKETPLACE CATEGORIES & SUBCATEGORIES
  const insectControlCat = await prisma.category.upsert({
    where: { slug: 'insect-control' },
    update: {},
    create: {
      name: 'Insect Control',
      slug: 'insect-control',
      description: 'Pesticides for stem borer, bollworm, aphids, thrips, and sucking pests',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a?w=400',
    },
  });

  const systemicSubcat = await prisma.category.upsert({
    where: { slug: 'systemic-insecticide' },
    update: {},
    create: {
      name: 'Systemic Insecticides',
      slug: 'systemic-insecticide',
      description: 'Absorbed by plant tissue for long-lasting internal protection',
      parentId: insectControlCat.id,
    },
  });

  const diseaseControlCat = await prisma.category.upsert({
    where: { slug: 'disease-control' },
    update: {},
    create: {
      name: 'Disease Control',
      slug: 'disease-control',
      description: 'Fungicides and bactericides for blast, sheath blight, leaf spot, rust',
      imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400',
    },
  });

  const weedControlCat = await prisma.category.upsert({
    where: { slug: 'weed-control' },
    update: {},
    create: {
      name: 'Weed Control',
      slug: 'weed-control',
      description: 'Herbicides for selective and non-selective weed management',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    },
  });

  const bioProductsCat = await prisma.category.upsert({
    where: { slug: 'bio-products' },
    update: {},
    create: {
      name: 'Bio Products',
      slug: 'bio-products',
      description: 'Botanical & biological eco-friendly crop protection solutions',
      imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400',
    },
  });

  const cropSupportCat = await prisma.category.upsert({
    where: { slug: 'crop-support' },
    update: {},
    create: {
      name: 'Crop Support & Growth',
      slug: 'crop-support',
      description: 'Plant growth regulators, bio-stimulants, and flowering boosters',
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    },
  });

  console.log('✅ Seeded 5 Top-Level Categories & Subcategories');

  // Get Approved Seller & Shop
  const seller = await prisma.seller.findUnique({
    where: { userId: sellerUserApproved.id },
    include: { shops: true },
  });

  if (seller && seller.shops.length > 0) {
    const shop = seller.shops[0];

    // PRODUCT 1: Coragen Insecticide
    const coragen = await prisma.product.upsert({
      where: { slug: 'coragen-sc-insecticide' },
      update: {},
      create: {
        sellerId: seller.id,
        categoryId: insectControlCat.id,
        name: 'Coragen SC Insecticide',
        slug: 'coragen-sc-insecticide',
        brand: 'FMC Corporation',
        manufacturer: 'FMC India Pvt Ltd',
        description: 'Coragen insecticide is an anthranilic diamide insecticide in the form of a suspension concentrate. It provides broad-spectrum control of stem borer, leaf folder, and American bollworm in crops.',
        activeIngredients: 'Chlorantraniliprole 18.5% w/w SC',
        formulationType: 'SC',
        targetPestsDiseases: 'Stem Borer, Leaf Folder, Green Leaf Hopper, Bollworm',
        targetCrops: 'Paddy, Sugarcane, Maize, Chilli, Tomato, Cotton',
        dosageInstructions: '60 ml per acre diluted in 200 Litres of clean water',
        safetyStorageInfo: 'Store in cool, dry place away from sunlight and food containers',
        packSize: 150,
        packUnit: 'ml',
        mrp: 1850,
        sellingPrice: 1650,
        status: 'APPROVED',
        isDemo: true,
        compliance: {
          create: {
            cgbRegistrationNo: 'CIR-145892/2020-Chlorantraniliprole(SC)-3451',
            toxicityClass: 'Blue',
            hazardWarning: 'Keep out of reach of children. Wear protective equipment during spraying.',
            waitingPeriodDays: 14,
            antidoteInfo: 'No specific antidote. Treat symptomatically.',
            verificationStatus: 'APPROVED',
          },
        },
        images: {
          create: [
            {
              imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a?w=600',
              altText: 'Coragen Insecticide Bottle',
              isPrimary: true,
            },
          ],
        },
      },
    });

    // Coragen Variants
    const coragenVar150 = await prisma.productVariant.upsert({
      where: { id: `coragen-var-150ml` },
      update: {},
      create: {
        id: `coragen-var-150ml`,
        productId: coragen.id,
        packSize: 150,
        packUnit: 'ml',
        sku: 'FMC-COR-150',
        mrp: 1850,
        sellingPrice: 1650,
        stockQuantity: 45,
      },
    });

    const coragenVar60 = await prisma.productVariant.upsert({
      where: { id: `coragen-var-60ml` },
      update: {},
      create: {
        id: `coragen-var-60ml`,
        productId: coragen.id,
        packSize: 60,
        packUnit: 'ml',
        sku: 'FMC-COR-60',
        mrp: 750,
        sellingPrice: 680,
        stockQuantity: 80,
      },
    });

    // Seller Listing for Coragen
    await prisma.sellerListing.upsert({
      where: { shopId_variantId: { shopId: shop.id, variantId: coragenVar150.id } },
      update: {},
      create: {
        sellerId: seller.id,
        shopId: shop.id,
        productId: coragen.id,
        variantId: coragenVar150.id,
        sellingPrice: 1650,
        quantityAvailable: 45,
      },
    });

    // PRODUCT 2: Amistar Top Fungicide
    const amistar = await prisma.product.upsert({
      where: { slug: 'amistar-top-fungicide' },
      update: {},
      create: {
        sellerId: seller.id,
        categoryId: diseaseControlCat.id,
        name: 'Amistar Top Fungicide',
        slug: 'amistar-top-fungicide',
        brand: 'Syngenta',
        manufacturer: 'Syngenta India Ltd',
        description: 'Amistar Top is a broad-spectrum systemic fungicide containing Azoxystrobin and Difenoconazole. Controls blast, sheath blight, early blight, and powdery mildew.',
        activeIngredients: 'Azoxystrobin 18.2% + Difenoconazole 11.4% w/w SC',
        formulationType: 'SC',
        targetPestsDiseases: 'Sheath Blight, Blast, Powdery Mildew, Early Blight',
        targetCrops: 'Paddy, Tomato, Chilli, Potato, Maize, Onion',
        dosageInstructions: '200 ml per acre in 200 Litres of water',
        safetyStorageInfo: 'Store under lock and key in original container',
        packSize: 200,
        packUnit: 'ml',
        mrp: 2400,
        sellingPrice: 2150,
        status: 'APPROVED',
        isDemo: true,
        compliance: {
          create: {
            cgbRegistrationNo: 'CIR-98412/2018-Azoxystrobin+Difenoconazole-1200',
            toxicityClass: 'Yellow',
            hazardWarning: 'Harmful if swallowed or inhaled. Avoid spray drift.',
            waitingPeriodDays: 21,
            antidoteInfo: 'Gastric lavage with care. Symptomatic treatment.',
            verificationStatus: 'APPROVED',
          },
        },
        images: {
          create: [
            {
              imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600',
              altText: 'Amistar Top Fungicide Bottle',
              isPrimary: true,
            },
          ],
        },
      },
    });

    const amistarVar200 = await prisma.productVariant.upsert({
      where: { id: `amistar-var-200ml` },
      update: {},
      create: {
        id: `amistar-var-200ml`,
        productId: amistar.id,
        packSize: 200,
        packUnit: 'ml',
        sku: 'SYN-AMI-200',
        mrp: 2400,
        sellingPrice: 2150,
        stockQuantity: 30,
      },
    });

    await prisma.sellerListing.upsert({
      where: { shopId_variantId: { shopId: shop.id, variantId: amistarVar200.id } },
      update: {},
      create: {
        sellerId: seller.id,
        shopId: shop.id,
        productId: amistar.id,
        variantId: amistarVar200.id,
        sellingPrice: 2150,
        quantityAvailable: 30,
      },
    });

    // PRODUCT 3: Neem Baan Bio Insecticide
    const neemBaan = await prisma.product.upsert({
      where: { slug: 'neem-baan-bio-insecticide' },
      update: {},
      create: {
        sellerId: seller.id,
        categoryId: bioProductsCat.id,
        name: 'Neem Baan 10000 PPM Bio Insecticide',
        slug: 'neem-baan-bio-insecticide',
        brand: 'Multiplex',
        manufacturer: 'Karnataka Agro Chemicals',
        description: 'Neem-based botanical eco-friendly bio-insecticide containing Azadirachtin. Effective against whiteflies, aphids, thrips, and caterpillars while safe for honeybees.',
        activeIngredients: 'Azadirachtin 1% (10000 PPM) EC',
        formulationType: 'EC',
        targetPestsDiseases: 'Sucking Pests, Whiteflies, Aphids, Thrips, Mites',
        targetCrops: 'Cotton, Paddy, Tomato, Chilli, Wheat, Groundnut, Vegetables',
        dosageInstructions: '500 ml per acre in 200 Litres water',
        safetyStorageInfo: 'Store in cool place away from direct sunlight',
        packSize: 1000,
        packUnit: 'ml',
        mrp: 650,
        sellingPrice: 550,
        status: 'APPROVED',
        isDemo: true,
        compliance: {
          create: {
            cgbRegistrationNo: 'CIR-55612/2016-Azadirachtin-901',
            toxicityClass: 'Green',
            hazardWarning: 'Eco-friendly product. Wash hands with soap after handling.',
            waitingPeriodDays: 3,
            antidoteInfo: 'Non-toxic biological formulation.',
            verificationStatus: 'APPROVED',
          },
        },
        images: {
          create: [
            {
              imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600',
              altText: 'Neem Baan Bio Insecticide Bottle',
              isPrimary: true,
            },
          ],
        },
      },
    });

    const neemVar1L = await prisma.productVariant.upsert({
      where: { id: `neem-var-1l` },
      update: {},
      create: {
        id: `neem-var-1l`,
        productId: neemBaan.id,
        packSize: 1000,
        packUnit: 'ml',
        sku: 'MPX-NEE-1000',
        mrp: 650,
        sellingPrice: 550,
        stockQuantity: 100,
      },
    });

    await prisma.sellerListing.upsert({
      where: { shopId_variantId: { shopId: shop.id, variantId: neemVar1L.id } },
      update: {},
      create: {
        sellerId: seller.id,
        shopId: shop.id,
        productId: neemBaan.id,
        variantId: neemVar1L.id,
        sellingPrice: 550,
        quantityAvailable: 100,
      },
    });

    console.log('✅ Seeded 3 Demo Crop Protection Products with Compliance, Variants & Seller Listings');
  }

  console.log('\n==================================================');
  console.log('🌱 FARM SEVA DEMO SEEDING COMPLETED');
  console.log('Default Password for ALL Seed Accounts:', defaultPassword);
  console.log('==================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
