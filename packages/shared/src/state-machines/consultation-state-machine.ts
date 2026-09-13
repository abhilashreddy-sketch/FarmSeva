import { UserRole } from './order-state-machine';

export type ConsultationStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ACTIVE'
  | 'WAITING_FOR_FARMER'
  | 'WAITING_FOR_EXPERT'
  | 'COMPLETED'
  | 'CANCELLED';



export interface ConsultationTransitionRule {
  from: ConsultationStatus;
  to: ConsultationStatus[];
  allowedRoles: UserRole[];
  description: string;
}

export const CONSULTATION_STATE_TRANSITIONS: Record<ConsultationStatus, ConsultationTransitionRule> = {
  REQUESTED: {
    from: 'REQUESTED',
    to: ['ASSIGNED', 'CANCELLED'],
    allowedRoles: ['FARMER', 'CALL_CENTER_AGENT', 'ADMIN', 'AGRICULTURAL_EXPERT'],
    description: 'Consultation requested by farmer or agent. Awaiting expert assignment.',
  },
  ASSIGNED: {
    from: 'ASSIGNED',
    to: ['ACTIVE', 'CANCELLED'],
    allowedRoles: ['AGRICULTURAL_EXPERT', 'ADMIN', 'FARMER'],
    description: 'Expert assigned. Ready to start discussion.',
  },
  ACTIVE: {
    from: 'ACTIVE',
    to: ['WAITING_FOR_FARMER', 'WAITING_FOR_EXPERT', 'COMPLETED', 'CANCELLED'],
    allowedRoles: ['AGRICULTURAL_EXPERT', 'FARMER', 'ADMIN', 'CALL_CENTER_AGENT'],
    description: 'Active discussion in progress.',
  },
  WAITING_FOR_FARMER: {
    from: 'WAITING_FOR_FARMER',
    to: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
    allowedRoles: ['FARMER', 'AGRICULTURAL_EXPERT', 'ADMIN', 'CALL_CENTER_AGENT'],
    description: 'Expert asked a question or requested photo; awaiting farmer reply.',
  },
  WAITING_FOR_EXPERT: {
    from: 'WAITING_FOR_EXPERT',
    to: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
    allowedRoles: ['AGRICULTURAL_EXPERT', 'ADMIN', 'FARMER'],
    description: 'Farmer asked a question; awaiting expert response.',
  },
  COMPLETED: {
    from: 'COMPLETED',
    to: [],
    allowedRoles: [],
    description: 'Terminal state. Consultation successfully completed.',
  },
  CANCELLED: {
    from: 'CANCELLED',
    to: [],
    allowedRoles: [],
    description: 'Terminal state. Consultation cancelled.',
  },
};

export function validateConsultationStateTransition(
  currentStatus: ConsultationStatus,
  targetStatus: ConsultationStatus,
  userRole: UserRole
): { isValid: boolean; error?: string } {
  const rule = CONSULTATION_STATE_TRANSITIONS[currentStatus];

  if (!rule) {
    return { isValid: false, error: `Invalid current status: ${currentStatus}` };
  }

  if (!rule.to.includes(targetStatus)) {
    return {
      isValid: false,
      error: `Cannot transition consultation status from ${currentStatus} to ${targetStatus}. Valid target states: [${rule.to.join(', ')}]`,
    };
  }

  if (!rule.allowedRoles.includes(userRole) && userRole !== 'ADMIN') {
    return {
      isValid: false,
      error: `Role '${userRole}' is not authorized to transition consultation from ${currentStatus} to ${targetStatus}.`,
    };
  }

  return { isValid: true };
}
