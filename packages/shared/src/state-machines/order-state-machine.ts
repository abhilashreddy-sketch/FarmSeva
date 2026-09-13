export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'PACKING'
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type UserRole =
  | 'FARMER'
  | 'SELLER'
  | 'AGRICULTURAL_EXPERT'
  | 'DELIVERY_PARTNER'
  | 'ADMIN'
  | 'CALL_CENTER_AGENT';

export interface StateTransitionRule {
  from: OrderStatus;
  to: OrderStatus[];
  allowedRoles: UserRole[];
  description: string;
}

export const ORDER_STATE_TRANSITIONS: Record<OrderStatus, StateTransitionRule> = {
  DRAFT: {
    from: 'DRAFT',
    to: ['PENDING_ACCEPTANCE', 'CANCELLED'],
    allowedRoles: ['FARMER', 'CALL_CENTER_AGENT', 'ADMIN'],
    description: 'Farmer or Call Center Agent submits cart for checkout.',
  },
  PENDING_ACCEPTANCE: {
    from: 'PENDING_ACCEPTANCE',
    to: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    allowedRoles: ['SELLER', 'FARMER', 'CALL_CENTER_AGENT', 'ADMIN'],
    description: 'Seller accepts or rejects order. Farmer/Agent can cancel before acceptance.',
  },
  ACCEPTED: {
    from: 'ACCEPTED',
    to: ['PACKING', 'CANCELLED'],
    allowedRoles: ['SELLER', 'ADMIN'],
    description: 'Seller begins preparing order items.',
  },
  PACKING: {
    from: 'PACKING',
    to: ['DISPATCHED', 'CANCELLED'],
    allowedRoles: ['SELLER', 'ADMIN'],
    description: 'Order packed and assigned to delivery partner.',
  },
  DISPATCHED: {
    from: 'DISPATCHED',
    to: ['OUT_FOR_DELIVERY'],
    allowedRoles: ['DELIVERY_PARTNER', 'SELLER', 'ADMIN'],
    description: 'Delivery partner picks up parcel from retailer shop.',
  },
  OUT_FOR_DELIVERY: {
    from: 'OUT_FOR_DELIVERY',
    to: ['DELIVERED', 'REJECTED'],
    allowedRoles: ['DELIVERY_PARTNER', 'ADMIN'],
    description: 'Delivery partner delivers parcel to farmer and uploads proof.',
  },
  DELIVERED: {
    from: 'DELIVERED',
    to: [],
    allowedRoles: [],
    description: 'Terminal state. Order completed successfully.',
  },
  CANCELLED: {
    from: 'CANCELLED',
    to: [],
    allowedRoles: [],
    description: 'Terminal state. Order cancelled before dispatch.',
  },
  REJECTED: {
    from: 'REJECTED',
    to: [],
    allowedRoles: [],
    description: 'Terminal state. Order rejected by seller or failed delivery.',
  },
};

export function validateOrderStateTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  userRole: UserRole
): { isValid: boolean; error?: string } {
  const rule = ORDER_STATE_TRANSITIONS[currentStatus];

  if (!rule) {
    return { isValid: false, error: `Invalid current status: ${currentStatus}` };
  }

  if (!rule.to.includes(targetStatus)) {
    return {
      isValid: false,
      error: `Cannot transition order status from ${currentStatus} to ${targetStatus}. Valid target states: [${rule.to.join(
        ', '
      )}]`,
    };
  }

  if (!rule.allowedRoles.includes(userRole) && userRole !== 'ADMIN') {
    return {
      isValid: false,
      error: `Role '${userRole}' is not authorized to transition order from ${currentStatus} to ${targetStatus}.`,
    };
  }

  return { isValid: true };
}
