export interface Stage {
  id: string;
  name: string;
  description: string;
  order: number;
  isRequired: boolean;
  requiredActions: RequiredAction[];
  nextStages: string[]; // IDs of possible next stages
}

export interface RequiredAction {
  id: string;
  name: string;
  type: ActionType;
  isRequired: boolean;
  minCount?: number;
  maxCount?: number;
  daysToComplete?: number;
  assignedRoles: string[];
  approvalRequired: boolean;
}

export enum ActionType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  DOCUMENT = 'DOCUMENT',
  APPROVAL = 'APPROVAL',
  OTHER = 'OTHER'
}

export interface StageProgress {
  stageId: string;
  completedActions: number;
  totalActions: number;
  status: StageStatus;
  startDate: Date;
  completionDate?: Date;
}

export enum StageStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}