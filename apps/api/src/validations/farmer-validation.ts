import { z } from 'zod';

export const updateFarmerProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit pincode').optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  totalLandAcres: z.number().positive().optional(),
  primaryWaterSource: z.string().optional(),
  kisanCreditCardNo: z.string().optional(),
});

export const createFarmSchema = z.object({
  name: z.string().min(2, 'Farm name is required'),
  locationVillage: z.string().optional(),
  locationTaluk: z.string().optional(),
  locationDistrict: z.string().min(2, 'District is required'),
  locationState: z.string().min(2, 'State is required'),
  locationPincode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit pincode').optional(),
  totalAreaAcres: z.number().positive('Total area in acres must be greater than 0'),
  areaUnit: z.string().default('Acres'),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateFarmSchema = createFarmSchema.partial();

export const createFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  areaAcres: z.number().positive('Area in acres must be greater than 0'),
  areaUnit: z.string().default('Acres'),
  soilType: z.string().optional(),
  irrigationType: z.string().optional(),
  description: z.string().optional(),
});

export const updateFieldSchema = createFieldSchema.partial();

export const createCropSchema = z.object({
  fieldId: z.string().uuid('Valid field ID is required'),
  cropName: z.string().min(2, 'Crop name is required'),
  cropCategory: z.string().optional(),
  variety: z.string().optional(),
  sowingDate: z.string().or(z.date()).transform((val) => new Date(val)),
  expectedHarvestDate: z.string().or(z.date()).optional().transform((val) => (val ? new Date(val) : undefined)),
  areaPlantedAcres: z.number().positive('Planted area must be greater than 0'),
  areaUnit: z.string().default('Acres'),
  stage: z.string().optional(),
  status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'HARVEST_READY', 'HARVESTED', 'CANCELLED']).default('GROWING'),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.expectedHarvestDate && data.sowingDate) {
    return data.expectedHarvestDate >= data.sowingDate;
  }
  return true;
}, {
  message: 'Expected harvest date cannot be earlier than sowing date',
  path: ['expectedHarvestDate'],
});

export const updateCropSchema = z.object({
  cropName: z.string().min(2).optional(),
  cropCategory: z.string().optional(),
  variety: z.string().optional(),
  sowingDate: z.string().or(z.date()).optional().transform((val) => (val ? new Date(val) : undefined)),
  expectedHarvestDate: z.string().or(z.date()).optional().transform((val) => (val ? new Date(val) : undefined)),
  areaPlantedAcres: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  stage: z.string().optional(),
  status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'HARVEST_READY', 'HARVESTED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});
