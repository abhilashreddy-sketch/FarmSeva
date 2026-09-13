import { Request, Response, NextFunction } from 'express';
import { AddressService } from '../services/address-service';
import { sendSuccess } from '../utils/api-response';
import { createAddressSchema, updateAddressSchema } from '../validations/address-validation';

export class AddressController {
  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = createAddressSchema.parse(req.body);
      const address = await AddressService.createAddress(userId, payload);
      return sendSuccess(res, address, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const addresses = await AddressService.getAddresses(userId);
      return sendSuccess(res, addresses, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getAddressById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const address = await AddressService.getAddressById(userId, id);
      return sendSuccess(res, address, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const payload = updateAddressSchema.parse(req.body);
      const address = await AddressService.updateAddress(userId, id, payload);
      return sendSuccess(res, address, 200);
    } catch (err) {
      next(err);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await AddressService.deleteAddress(userId, id);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}
