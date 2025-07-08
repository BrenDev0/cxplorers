export interface Task {
  task_id: string;
  business_id: string;
  contact_id: string;
  business_user_id: string;
  task_title: string;
  task_description: string;
  task_due_date: Date;
}

export interface TaskData {
  taskId: string;
  businessId: string;
  contactId: string;
  businessUserId: string;
  taskTitle: string;
  taskDescription: string;
  taskDueDate: Date;
}
