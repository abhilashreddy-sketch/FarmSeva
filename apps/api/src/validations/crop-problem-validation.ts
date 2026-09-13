import { z } from 'zod';

export const createCropProblemSchema = z.object({
  farmId: z.string().uuid().optional(),
  fieldId: z.string().uuid().optional(),
  cropId: z.string().uuid({ message: 'Valid crop ID is required' }),
  title: z.string().min(3, 'Title must be at least 3 characters long').max(150),
  description: z.string().min(5, 'Description must be at least 5 characters long').max(2000),
  category: z
    .enum(['PEST', 'DISEASE', 'WEED', 'NUTRIENT', 'WATER', 'SOIL', 'WEATHER', 'GROWTH', 'OTHER'])
    .optional()
    .default('OTHER'),
  severity: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .optional()
    .default('MEDIUM'),
  affectedAreaAcres: z.number().positive().optional(),
  symptomsObserved: z.string().max(1000).optional(),
  observedDate: z.string().optional(),
  leafColor: z.string().max(50).optional(),
  leafCondition: z.string().max(50).optional(),
  plantCondition: z.string().max(50).optional(),
  affectedArea: z.string().max(50).optional(),
});

export const updateCropProblemSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().min(5).max(2000).optional(),
  category: z
    .enum(['PEST', 'DISEASE', 'WEED', 'NUTRIENT', 'WATER', 'SOIL', 'WEATHER', 'GROWTH', 'OTHER'])
    .optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z
    .enum([
      'OPEN',
      'UNDER_REVIEW',
      'EXPERT_ASSIGNED',
      'IN_CONSULTATION',
      'GUIDANCE_PROVIDED',
      'RESOLVED',
      'CLOSED',
      'CANCELLED',
    ])
    .optional(),
  resolutionNotes: z.string().max(1000).optional(),
});

export const uploadCropImageSchema = z.object({
  imageUrl: z.string().url('Valid image URL required'),
  thumbnailUrl: z.string().url().optional(),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'], {
    errorMap: () => ({ message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' }),
  }).optional().default('image/jpeg'),
  fileSize: z.number().int().positive().max(10485760, 'File size must not exceed 10MB').optional(),
  caption: z.string().max(200).optional(),
});

export const assignExpertSchema = z.object({
  expertId: z.string().uuid({ message: 'Valid expert ID is required' }),
});
