export interface Action {
  id: string;
  stageId: string;
  type: ActionType;
  description: string;
  dueDate: Date;
  completionDate?: Date;
  assignedTo: string;
  status: ActionStatus;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvalDate?: Date;
  emailDetails?: EmailActionDetails;
}

export enum ActionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface EmailActionDetails {
  subject: string;
  body: string;
  recipients: string[];
  attachments?: string[];
  sentDate?: Date;
  deliveryStatus?: string;
}