import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CATEGORIES_SEED = [
  {
    name: 'Seeds',
    slug: 'seeds',
    description: 'Crop seeds, hybrid seeds, and planting materials',
  },
  {
    name: 'Insecticides',
    slug: 'insecticides',
    description: 'Crop protection formulations for managing insect pests',
  },
  {
    name: 'Fungicides',
    slug: 'fungicides',
    description: 'Crop protection solutions for fungal disease management',
  },
  {
    name: 'Herbicides',
    slug: 'herbicides',
    description: 'Weed control and land preparation solutions',
  },
  {
    name: 'Bio-Pesticides',
    slug: 'bio-pesticides',
    description: 'Biological and neem-based plant protection products',
  },
  {
    name: 'Chemical Fertilizers',
    slug: 'chemical-fertilizers',
    description: 'Primary NPK, water-soluble, and complex soil nutrient fertilizers',
  },
  {
    name: 'Organic Manure',
    slug: 'organic-manure',
    description: 'Compost, vermicomposting, and organic soil health enhancers',
  },
  {
    name: 'Micronutrients',
    slug: 'micronutrients',
    description: 'Essential micronutrients and soil conditioning formulations',
  },
  {
    name: 'Farm Equipment',
    slug: 'farm-equipment',
    description: 'Sprayers, farming implements, and agricultural tools',
  },
];

export async function seedCategories() {
  console.log('🌱 Executing controlled Category catalog seeding...');
  let seededCount = 0;

  for (const cat of CATEGORIES_SEED) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true,
      },
    });
    seededCount++;
  }

  console.log(`✅ Category seed complete: ${seededCount} categories populated/updated.`);
}

if (require.main === module) {
  seedCategories()
    .catch((err) => {
      console.error('❌ Error executing category seed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
