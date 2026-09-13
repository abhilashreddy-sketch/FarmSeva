const fs = require('fs');
const path = require('path');

const jsEnums = `
exports.UserRole = {
  FARMER: 'FARMER',
  SELLER: 'SELLER',
  AGRICULTURAL_EXPERT: 'AGRICULTURAL_EXPERT',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  ADMIN: 'ADMIN',
  CALL_CENTER_AGENT: 'CALL_CENTER_AGENT'
};

exports.UserStatus = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
  REJECTED: 'REJECTED',
  DEACTIVATED: 'DEACTIVATED'
};

exports.SellerStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED'
};

exports.ProductStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DISCONTINUED: 'DISCONTINUED'
};

exports.OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING_ACCEPTANCE: 'PENDING_ACCEPTANCE',
  ACCEPTED: 'ACCEPTED',
  PACKING: 'PACKING',
  DISPATCHED: 'DISPATCHED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
};

exports.PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.DeliveryStatus = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED_ATTEMPT: 'FAILED_ATTEMPT',
  RETURNED: 'RETURNED'
};

exports.ProblemStatus = {
  SUBMITTED: 'SUBMITTED',
  ASSIGNED_TO_EXPERT: 'ASSIGNED_TO_EXPERT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  DIAGNOSED: 'DIAGNOSED',
  CLOSED: 'CLOSED'
};

exports.ProblemPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

exports.CropStatus = {
  PLANNED: 'PLANNED',
  PLANTED: 'PLANTED',
  GROWING: 'GROWING',
  HARVEST_READY: 'HARVEST_READY',
  HARVESTED: 'HARVESTED',
  CANCELLED: 'CANCELLED'
};
`;

const dtsEnums = `
export declare const UserRole: {
  readonly FARMER: 'FARMER';
  readonly SELLER: 'SELLER';
  readonly AGRICULTURAL_EXPERT: 'AGRICULTURAL_EXPERT';
  readonly DELIVERY_PARTNER: 'DELIVERY_PARTNER';
  readonly ADMIN: 'ADMIN';
  readonly CALL_CENTER_AGENT: 'CALL_CENTER_AGENT';
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export declare const UserStatus: {
  readonly PENDING_VERIFICATION: 'PENDING_VERIFICATION';
  readonly ACTIVE: 'ACTIVE';
  readonly SUSPENDED: 'SUSPENDED';
  readonly INACTIVE: 'INACTIVE';
  readonly REJECTED: 'REJECTED';
  readonly DEACTIVATED: 'DEACTIVATED';
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export declare const SellerStatus: {
  readonly SUBMITTED: 'SUBMITTED';
  readonly UNDER_REVIEW: 'UNDER_REVIEW';
  readonly APPROVED: 'APPROVED';
  readonly REJECTED: 'REJECTED';
  readonly SUSPENDED: 'SUSPENDED';
};
export type SellerStatus = (typeof SellerStatus)[keyof typeof SellerStatus];

export declare const ProductStatus: {
  readonly DRAFT: 'DRAFT';
  readonly PENDING_APPROVAL: 'PENDING_APPROVAL';
  readonly APPROVED: 'APPROVED';
  readonly REJECTED: 'REJECTED';
  readonly DISCONTINUED: 'DISCONTINUED';
};
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export declare const OrderStatus: {
  readonly DRAFT: 'DRAFT';
  readonly PENDING_ACCEPTANCE: 'PENDING_ACCEPTANCE';
  readonly ACCEPTED: 'ACCEPTED';
  readonly PACKING: 'PACKING';
  readonly DISPATCHED: 'DISPATCHED';
  readonly OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY';
  readonly DELIVERED: 'DELIVERED';
  readonly CANCELLED: 'CANCELLED';
  readonly REJECTED: 'REJECTED';
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export declare const PaymentStatus: {
  readonly PENDING: 'PENDING';
  readonly AUTHORIZED: 'AUTHORIZED';
  readonly COMPLETED: 'COMPLETED';
  readonly FAILED: 'FAILED';
  readonly REFUNDED: 'REFUNDED';
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export declare const DeliveryStatus: {
  readonly UNASSIGNED: 'UNASSIGNED';
  readonly ASSIGNED: 'ASSIGNED';
  readonly PICKED_UP: 'PICKED_UP';
  readonly IN_TRANSIT: 'IN_TRANSIT';
  readonly DELIVERED: 'DELIVERED';
  readonly FAILED_ATTEMPT: 'FAILED_ATTEMPT';
  readonly RETURNED: 'RETURNED';
};
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export declare const ProblemStatus: {
  readonly SUBMITTED: 'SUBMITTED';
  readonly ASSIGNED_TO_EXPERT: 'ASSIGNED_TO_EXPERT';
  readonly UNDER_REVIEW: 'UNDER_REVIEW';
  readonly DIAGNOSED: 'DIAGNOSED';
  readonly CLOSED: 'CLOSED';
};
export type ProblemStatus = (typeof ProblemStatus)[keyof typeof ProblemStatus];

export declare const ProblemPriority: {
  readonly LOW: 'LOW';
  readonly MEDIUM: 'MEDIUM';
  readonly HIGH: 'HIGH';
  readonly URGENT: 'URGENT';
};
export type ProblemPriority = (typeof ProblemPriority)[keyof typeof ProblemPriority];

export declare const TicketStatus: {
  readonly OPEN: 'OPEN';
  readonly IN_PROGRESS: 'IN_PROGRESS';
  readonly RESOLVED: 'RESOLVED';
  readonly CLOSED: 'CLOSED';
};
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export declare const CropStatus: {
  readonly PLANNED: 'PLANNED';
  readonly PLANTED: 'PLANTED';
  readonly GROWING: 'GROWING';
  readonly HARVEST_READY: 'HARVEST_READY';
  readonly HARVESTED: 'HARVESTED';
  readonly CANCELLED: 'CANCELLED';
};
export type CropStatus = (typeof CropStatus)[keyof typeof CropStatus];
`;

const jsPath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'index.js');
const dtsPath = path.join(__dirname, 'node_modules', '.prisma', 'client', 'index.d.ts');

fs.appendFileSync(jsPath, jsEnums);
fs.appendFileSync(dtsPath, dtsEnums);
console.log('Enums injected into .prisma/client successfully.');
