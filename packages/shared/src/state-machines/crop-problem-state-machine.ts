import { UserRole } from './order-state-machine';

export type CropProblemStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'EXPERT_ASSIGNED'
  | 'IN_CONSULTATION'
  | 'GUIDANCE_PROVIDED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';



export interface CropProblemTransitionRule {
  from: CropProblemStatus;
  to: CropProblemStatus[];
  allowedRoles: UserRole[];
  description: string;
}

export const CROP_PROBLEM_STATE_TRANSITIONS: Record<CropProblemStatus, CropProblemTransitionRule> = {
  OPEN: {
    from: 'OPEN',
    to: ['UNDER_REVIEW', 'EXPERT_ASSIGNED', 'CANCELLED'],
    allowedRoles: ['FARMER', 'CALL_CENTER_AGENT', 'ADMIN'],
    description: 'Problem reported by farmer or call-center agent. Awaiting review or expert assignment.',
  },
  UNDER_REVIEW: {
    from: 'UNDER_REVIEW',
    to: ['EXPERT_ASSIGNED', 'CANCELLED', 'CLOSED'],
    allowedRoles: ['ADMIN', 'AGRICULTURAL_EXPERT', 'CALL_CENTER_AGENT'],
    description: 'Admin or staff reviewing problem details.',
  },
  EXPERT_ASSIGNED: {
    from: 'EXPERT_ASSIGNED',
    to: ['IN_CONSULTATION', 'CANCELLED'],
    allowedRoles: ['AGRICULTURAL_EXPERT', 'ADMIN', 'FARMER'],
    description: 'Agricultural expert assigned to case.',
  },
  IN_CONSULTATION: {
    from: 'IN_CONSULTATION',
    to: ['GUIDANCE_PROVIDED', 'CANCELLED'],
    allowedRoles: ['AGRICULTURAL_EXPERT', 'ADMIN'],
    description: 'Active discussion between farmer and expert.',
  },
  GUIDANCE_PROVIDED: {
    from: 'GUIDANCE_PROVIDED',
    to: ['RESOLVED', 'IN_CONSULTATION', 'CLOSED'],
    allowedRoles: ['FARMER', 'AGRICULTURAL_EXPERT', 'ADMIN', 'CALL_CENTER_AGENT'],
    description: 'Formal guidance provided by expert. Awaiting farmer confirmation or further questions.',
  },
  RESOLVED: {
    from: 'RESOLVED',
    to: ['CLOSED', 'IN_CONSULTATION'],
    allowedRoles: ['FARMER', 'ADMIN', 'CALL_CENTER_AGENT'],
    description: 'Farmer confirms problem resolved. Can re-open to IN_CONSULTATION if issue recurs.',
  },
  CLOSED: {
    from: 'CLOSED',
    to: [],
    allowedRoles: [],
    description: 'Terminal state. Case completed and archived.',
  },
  CANCELLED: {
    from: 'CANCELLED',
    to: [],
    allowedRoles: [],
    description: 'Terminal state. Case cancelled by farmer or admin.',
  },
};

export function validateCropProblemStateTransition(
  currentStatus: CropProblemStatus,
  targetStatus: CropProblemStatus,
  userRole: UserRole
): { isValid: boolean; error?: string } {
  const rule = CROP_PROBLEM_STATE_TRANSITIONS[currentStatus];

  if (!rule) {
    return { isValid: false, error: `Invalid current status: ${currentStatus}` };
  }

  if (!rule.to.includes(targetStatus)) {
    return {
      isValid: false,
      error: `Cannot transition crop problem from ${currentStatus} to ${targetStatus}. Valid target states: [${rule.to.join(', ')}]`,
    };
  }

  if (!rule.allowedRoles.includes(userRole) && userRole !== 'ADMIN') {
    return {
      isValid: false,
      error: `Role '${userRole}' is not authorized to transition crop problem from ${currentStatus} to ${targetStatus}.`,
    };
  }

  return { isValid: true };
}
