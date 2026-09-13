import { PrismaClient } from '@prisma/client';
import { UserRole } from '@farm-seva/shared';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

// Crop Master Data array for low-literacy dropdowns/grids
export const DEMO_CROP_MASTER_DATA = [
  { name: 'Rice / Paddy', category: 'Cereals', icon: '🌾', durationDays: 120 },
  { name: 'Wheat', category: 'Cereals', icon: '🌾', durationDays: 135 },
  { name: 'Maize (Corn)', category: 'Cereals', icon: '🌽', durationDays: 100 },
  { name: 'Cotton', category: 'Commercial', icon: '☁️', durationDays: 160 },
  { name: 'Tomato', category: 'Vegetables', icon: '🍅', durationDays: 90 },
  { name: 'Chilli', category: 'Spices / Vegetables', icon: '🌶️', durationDays: 120 },
  { name: 'Potato', category: 'Vegetables', icon: '🥔', durationDays: 90 },
  { name: 'Onion', category: 'Vegetables', icon: '🧅', durationDays: 110 },
  { name: 'Groundnut (Peanut)', category: 'Oilseeds', icon: '🥜', durationDays: 105 },
  { name: 'Sugarcane', category: 'Commercial', icon: '🎋', durationDays: 360 },
];

export class FarmerService {
  /**
   * Ensure user has a FarmerProfile, creating one if necessary.
   */
  static async getOrCreateFarmerProfile(userId: string) {
    let profile = await prisma.farmerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, phone: true, email: true, fullName: true, preferredLanguage: true, role: true } },
        farms: { include: { fields: { include: { crops: true } } } },
      },
    });

    if (!profile) {
      profile = await prisma.farmerProfile.create({
        data: { userId },
        include: {
          user: { select: { id: true, phone: true, email: true, fullName: true, preferredLanguage: true, role: true } },
          farms: { include: { fields: { include: { crops: true } } } },
        },
      });
    }

    return profile;
  }

  /**
   * Update Farmer Profile.
   */
  static async updateFarmerProfile(userId: string, data: any) {
    const profile = await this.getOrCreateFarmerProfile(userId);

    // Update User level fields (fullName, preferredLanguage)
    if (data.fullName || data.preferredLanguage) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.fullName && { fullName: data.fullName }),
          ...(data.preferredLanguage && { preferredLanguage: data.preferredLanguage }),
        },
      });
    }

    // Update FarmerProfile level fields
    const updatedProfile = await prisma.farmerProfile.update({
      where: { id: profile.id },
      data: {
        ...(data.village !== undefined && { village: data.village }),
        ...(data.district !== undefined && { district: data.district }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.pincode !== undefined && { pincode: data.pincode }),
        ...(data.experienceYears !== undefined && { experienceYears: data.experienceYears }),
        ...(data.totalLandAcres !== undefined && { totalLandAcres: data.totalLandAcres }),
        ...(data.primaryWaterSource !== undefined && { primaryWaterSource: data.primaryWaterSource }),
        ...(data.kisanCreditCardNo !== undefined && { kisanCreditCardNo: data.kisanCreditCardNo }),
      },
      include: {
        user: { select: { id: true, phone: true, fullName: true, preferredLanguage: true } },
      },
    });

    await logAuditEvent({
      userId,
      action: 'UPDATE_FARMER_PROFILE',
      entityName: 'FarmerProfile',
      entityId: profile.id,
      changesJson: data,
    });

    return updatedProfile;
  }

  /**
   * Get all Farms for a Farmer (with ownership security).
   */
  static async getFarmerFarms(userId: string, targetFarmerUserId?: string, callerRole?: UserRole | string) {
    // If targetFarmerUserId provided and caller is Admin/CallCenter, allow viewing target farmer
    const effectiveUserId = (callerRole === UserRole.ADMIN || callerRole === UserRole.CALL_CENTER_AGENT) && targetFarmerUserId
      ? targetFarmerUserId
      : userId;

    const profile = await this.getOrCreateFarmerProfile(effectiveUserId);

    return prisma.farm.findMany({
      where: { farmerId: profile.id },
      include: {
        fields: {
          include: {
            crops: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get Farm by ID (with strict ownership check).
   */
  static async getFarmById(farmId: string, userId: string, callerRole?: UserRole | string) {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        farmer: { select: { id: true, userId: true } },
        fields: { include: { crops: true } },
      },
    });

    if (!farm) {
      throw { statusCode: 404, code: 'FARM_NOT_FOUND', message: 'Farm not found' };
    }

    // Ownership Enforcement
    if (farm.farmer.userId !== userId && callerRole !== UserRole.ADMIN && callerRole !== UserRole.CALL_CENTER_AGENT) {
      throw { statusCode: 403, code: 'AUTH_OWNERSHIP_DENIED', message: 'Unauthorized: Access to this farm is denied' };
    }

    return farm;
  }

  /**
   * Create Farm for Farmer.
   */
  static async createFarm(userId: string, data: any) {
    const profile = await this.getOrCreateFarmerProfile(userId);

    const farm = await prisma.farm.create({
      data: {
        farmerId: profile.id,
        name: data.name,
        locationVillage: data.locationVillage || null,
        locationTaluk: data.locationTaluk || null,
        locationDistrict: data.locationDistrict,
        locationState: data.locationState,
        locationPincode: data.locationPincode || null,
        totalAreaAcres: data.totalAreaAcres,
        areaUnit: data.areaUnit || 'Acres',
        description: data.description || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      },
      include: { fields: true },
    });

    await logAuditEvent({
      userId,
      action: 'CREATE_FARM',
      entityName: 'Farm',
      entityId: farm.id,
      changesJson: { name: farm.name, area: farm.totalAreaAcres },
    });

    return farm;
  }

  /**
   * Update Farm (with ownership check).
   */
  static async updateFarm(farmId: string, userId: string, data: any, callerRole?: UserRole | string) {
    const farm = await this.getFarmById(farmId, userId, callerRole);

    const updatedFarm = await prisma.farm.update({
      where: { id: farm.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.locationVillage !== undefined && { locationVillage: data.locationVillage }),
        ...(data.locationTaluk !== undefined && { locationTaluk: data.locationTaluk }),
        ...(data.locationDistrict && { locationDistrict: data.locationDistrict }),
        ...(data.locationState && { locationState: data.locationState }),
        ...(data.locationPincode !== undefined && { locationPincode: data.locationPincode }),
        ...(data.totalAreaAcres !== undefined && { totalAreaAcres: data.totalAreaAcres }),
        ...(data.areaUnit && { areaUnit: data.areaUnit }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    await logAuditEvent({
      userId,
      action: 'UPDATE_FARM',
      entityName: 'Farm',
      entityId: farm.id,
      changesJson: data,
    });

    return updatedFarm;
  }

  /**
   * Delete Farm (with ownership check).
   */
  static async deleteFarm(farmId: string, userId: string, callerRole?: UserRole | string) {
    const farm = await this.getFarmById(farmId, userId, callerRole);

    await prisma.farm.delete({ where: { id: farm.id } });

    await logAuditEvent({
      userId,
      action: 'DELETE_FARM',
      entityName: 'Farm',
      entityId: farm.id,
    });

    return { message: 'Farm deleted successfully' };
  }

  /**
   * Create Field under a Farm (with ownership check).
   */
  static async createField(farmId: string, userId: string, data: any, callerRole?: UserRole | string) {
    const farm = await this.getFarmById(farmId, userId, callerRole);

    const field = await prisma.farmField.create({
      data: {
        farmId: farm.id,
        name: data.name,
        areaAcres: data.areaAcres,
        areaUnit: data.areaUnit || 'Acres',
        soilType: data.soilType || null,
        irrigationType: data.irrigationType || null,
        description: data.description || null,
      },
      include: { crops: true },
    });

    await logAuditEvent({
      userId,
      action: 'CREATE_FIELD',
      entityName: 'FarmField',
      entityId: field.id,
      changesJson: { name: field.name, area: field.areaAcres, farmId: farm.id },
    });

    return field;
  }

  /**
   * Update Field (with ownership check).
   */
  static async updateField(fieldId: string, userId: string, data: any, callerRole?: UserRole | string) {
    const field = await prisma.farmField.findUnique({
      where: { id: fieldId },
      include: { farm: { include: { farmer: true } } },
    });

    if (!field) {
      throw { statusCode: 404, code: 'FIELD_NOT_FOUND', message: 'Field not found' };
    }

    if (field.farm.farmer.userId !== userId && callerRole !== UserRole.ADMIN && callerRole !== UserRole.CALL_CENTER_AGENT) {
      throw { statusCode: 403, code: 'AUTH_OWNERSHIP_DENIED', message: 'Unauthorized: Access to this field is denied' };
    }

    const updatedField = await prisma.farmField.update({
      where: { id: field.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.areaAcres !== undefined && { areaAcres: data.areaAcres }),
        ...(data.areaUnit && { areaUnit: data.areaUnit }),
        ...(data.soilType !== undefined && { soilType: data.soilType }),
        ...(data.irrigationType !== undefined && { irrigationType: data.irrigationType }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    await logAuditEvent({
      userId,
      action: 'UPDATE_FIELD',
      entityName: 'FarmField',
      entityId: field.id,
      changesJson: data,
    });

    return updatedField;
  }

  /**
   * Delete Field (with ownership check).
   */
  static async deleteField(fieldId: string, userId: string, callerRole?: UserRole | string) {
    const field = await prisma.farmField.findUnique({
      where: { id: fieldId },
      include: { farm: { include: { farmer: true } } },
    });

    if (!field) {
      throw { statusCode: 404, code: 'FIELD_NOT_FOUND', message: 'Field not found' };
    }

    if (field.farm.farmer.userId !== userId && callerRole !== UserRole.ADMIN && callerRole !== UserRole.CALL_CENTER_AGENT) {
      throw { statusCode: 403, code: 'AUTH_OWNERSHIP_DENIED', message: 'Unauthorized: Access to this field is denied' };
    }

    await prisma.farmField.delete({ where: { id: field.id } });

    await logAuditEvent({
      userId,
      action: 'DELETE_FIELD',
      entityName: 'FarmField',
      entityId: field.id,
    });

    return { message: 'Field deleted successfully' };
  }

  /**
   * Get all Crops for a Farmer.
   */
  static async getFarmerCrops(userId: string, callerRole?: UserRole | string) {
    const profile = await this.getOrCreateFarmerProfile(userId);

    return prisma.crop.findMany({
      where: {
        field: {
          farm: {
            farmerId: profile.id,
          },
        },
      },
      include: {
        field: {
          select: {
            id: true,
            name: true,
            farm: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { sowingDate: 'desc' },
    });
  }

  /**
   * Create Crop under a Field (with ownership check).
   */
  static async createCrop(userId: string, data: any, callerRole?: UserRole | string) {
    const field = await prisma.farmField.findUnique({
      where: { id: data.fieldId },
      include: { farm: { include: { farmer: true } } },
    });

    if (!field) {
      throw { statusCode: 404, code: 'FIELD_NOT_FOUND', message: 'Target field not found' };
    }

    if (field.farm.farmer.userId !== userId && callerRole !== UserRole.ADMIN && callerRole !== UserRole.CALL_CENTER_AGENT) {
      throw { statusCode: 403, code: 'AUTH_OWNERSHIP_DENIED', message: 'Unauthorized: You do not own this field' };
    }

    const crop = await prisma.crop.create({
      data: {
        fieldId: field.id,
        cropName: data.cropName,
        cropCategory: data.cropCategory || null,
        variety: data.variety || null,
        sowingDate: data.sowingDate,
        expectedHarvestDate: data.expectedHarvestDate || null,
        areaPlantedAcres: data.areaPlantedAcres,
        areaUnit: data.areaUnit || 'Acres',
        stage: data.stage || 'Vegetative',
        status: data.status || 'GROWING',
        notes: data.notes || null,
      },
      include: {
        field: { select: { id: true, name: true, farm: { select: { id: true, name: true } } } },
      },
    });

    await logAuditEvent({
      userId,
      action: 'CREATE_CROP',
      entityName: 'Crop',
      entityId: crop.id,
      changesJson: { cropName: crop.cropName, fieldId: field.id },
    });

    return crop;
  }

  /**
   * Update Crop (with ownership check).
   */
  static async updateCrop(cropId: string, userId: string, data: any, callerRole?: UserRole | string) {
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { field: { include: { farm: { include: { farmer: true } } } } },
    });

    if (!crop) {
      throw { statusCode: 404, code: 'CROP_NOT_FOUND', message: 'Crop not found' };
    }

    if (crop.field.farm.farmer.userId !== userId && callerRole !== UserRole.ADMIN && callerRole !== UserRole.CALL_CENTER_AGENT) {
      throw { statusCode: 403, code: 'AUTH_OWNERSHIP_DENIED', message: 'Unauthorized: Access to this crop is denied' };
    }

    const updatedCrop = await prisma.crop.update({
      where: { id: crop.id },
      data: {
        ...(data.cropName && { cropName: data.cropName }),
        ...(data.cropCategory !== undefined && { cropCategory: data.cropCategory }),
        ...(data.variety !== undefined && { variety: data.variety }),
        ...(data.sowingDate && { sowingDate: data.sowingDate }),
        ...(data.expectedHarvestDate !== undefined && { expectedHarvestDate: data.expectedHarvestDate }),
        ...(data.areaPlantedAcres !== undefined && { areaPlantedAcres: data.areaPlantedAcres }),
        ...(data.areaUnit && { areaUnit: data.areaUnit }),
        ...(data.stage !== undefined && { stage: data.stage }),
        ...(data.status && { status: data.status as string }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        field: { select: { id: true, name: true, farm: { select: { id: true, name: true } } } },
      },
    });

    await logAuditEvent({
      userId,
      action: 'UPDATE_CROP',
      entityName: 'Crop',
      entityId: crop.id,
      changesJson: data,
    });

    return updatedCrop;
  }

  /**
   * Delete Crop (with ownership check).
   */
  static async deleteCrop(cropId: string, userId: string, callerRole?: UserRole | string) {
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { field: { include: { farm: { include: { farmer: true } } } } },
    });

    if (!crop) {
      throw { statusCode: 404, code: 'CROP_NOT_FOUND', message: 'Crop not found' };
    }

    if (crop.field.farm.farmer.userId !== userId && callerRole !== UserRole.ADMIN && callerRole !== UserRole.CALL_CENTER_AGENT) {
      throw { statusCode: 403, code: 'AUTH_OWNERSHIP_DENIED', message: 'Unauthorized: Access to this crop is denied' };
    }

    await prisma.crop.delete({ where: { id: crop.id } });

    await logAuditEvent({
      userId,
      action: 'DELETE_CROP',
      entityName: 'Crop',
      entityId: crop.id,
    });

    return { message: 'Crop deleted successfully' };
  }
}
