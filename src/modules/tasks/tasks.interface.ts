export interface Task {
  task_id: string;
  contact_id: string;
  user_id: string;
  task_title: string;
  task_description: string;
  task_due_date: Date;
}

export interface TaskData {
  taskId: string;
  contactId: string;
  userId: string;
  taskTitle: string;
  taskDescription: string;
  taskDueDate: Date;
}
