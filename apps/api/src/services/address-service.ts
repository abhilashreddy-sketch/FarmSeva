import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';

const prisma = new PrismaClient();

export class AddressService {
  static async createAddress(userId: string, data: {
    recipientName: string;
    phone: string;
    houseNo: string;
    streetLandmark: string;
    villageTaluk: string;
    district: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      // Unset previous defaults
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Check if first address for user, default to true
    const existingCount = await prisma.address.count({ where: { userId } });
    const setAsDefault = data.isDefault || existingCount === 0;

    const address = await prisma.address.create({
      data: {
        userId,
        recipientName: data.recipientName,
        phone: data.phone,
        houseNo: data.houseNo,
        streetLandmark: data.streetLandmark,
        villageTaluk: data.villageTaluk,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        isDefault: setAsDefault,
      },
    });

    return address;
  }

  static async getAddresses(userId: string) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
    return addresses;
  }

  static async getAddressById(userId: string, addressId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new ApiError('ADDRESS_NOT_FOUND', 'Delivery address not found', 404);
    }

    if (address.userId !== userId) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Access to this address is denied', 403);
    }

    return address;
  }

  static async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.getAddressById(userId, addressId);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data,
    });

    return updated;
  }

  static async deleteAddress(userId: string, addressId: string) {
    await this.getAddressById(userId, addressId);
    await prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address deleted successfully' };
  }
}
