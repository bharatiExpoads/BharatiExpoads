# Task Management System Setup Guide

## Overview
Complete task management system for assigning and tracking tasks between admins and employees in the hoarding management application.

## Features Implemented

### ✅ Backend (Completed)
1. **Database Schema** - Task and TaskUpdate models in Prisma
2. **Task Controller** - Full CRUD operations with role-based access
3. **API Endpoints** - RESTful endpoints for task management
4. **Task Statistics** - Dashboard metrics for admins
5. **Task Updates** - Comment system for progress tracking

### ✅ Frontend (Completed)
1. **Admin Task Management** - Create, assign, edit, and delete tasks
2. **Employee Task View** - View and update assigned tasks
3. **Task Notifications** - Real-time alerts for overdue and urgent tasks
4. **Filtering System** - Filter by status, priority, assignee
5. **Kanban Board View** - Visual task organization by status
6. **Navigation Integration** - Sidebar links for both roles

## Database Structure

### Task Model
```prisma
model Task {
  id          Int           @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus    @default(TODO)
  priority    TaskPriority  @default(MEDIUM)
  dueDate     DateTime?
  
  // Relations
  createdById Int
  createdBy   User          @relation("TaskCreator", fields: [createdById], references: [id])
  
  assignedToId Int?
  assignedTo   User?         @relation("TaskAssignee", fields: [assignedToId], references: [id])
  
  campaignId  Int?
  campaign    Campaign?     @relation(fields: [campaignId], references: [id])
  
  hoardingId  Int?
  hoarding    Hoarding?     @relation(fields: [hoardingId], references: [id])
  
  updates     TaskUpdate[]
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

### Task Enums
```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## API Endpoints

### Task Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/tasks` | Get all tasks (role-based) | Admin, Employee |
| GET | `/admin/tasks/stats` | Get task statistics | Admin |
| GET | `/admin/tasks/:id` | Get single task | Admin, Employee |
| POST | `/admin/tasks` | Create new task | Admin |
| PUT | `/admin/tasks/:id` | Update task | Admin, Employee |
| DELETE | `/admin/tasks/:id` | Delete task | Admin |
| POST | `/admin/tasks/:id/updates` | Add task update/comment | Admin, Employee |

### Response Examples

**GET /admin/tasks**
```json
[
  {
    "id": 1,
    "title": "Review campaign design",
    "description": "Check and approve the design for XYZ campaign",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-11-05T00:00:00.000Z",
    "createdBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "assignedTo": {
      "id": 2,
      "name": "Employee Name",
      "email": "employee@example.com"
    },
    "campaign": {
      "id": 10,
      "name": "XYZ Campaign"
    },
    "updates": [
      {
        "id": 1,
        "comment": "Started working on this",
        "createdAt": "2025-11-02T10:00:00.000Z",
        "user": {
          "name": "Employee Name"
        }
      }
    ],
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2025-11-02T10:00:00.000Z"
  }
]
```

**GET /admin/tasks/stats**
```json
{
  "total": 15,
  "byStatus": {
    "TODO": 5,
    "IN_PROGRESS": 4,
    "IN_REVIEW": 2,
    "COMPLETED": 3,
    "CANCELLED": 1
  },
  "byPriority": {
    "LOW": 3,
    "MEDIUM": 6,
    "HIGH": 4,
    "URGENT": 2
  },
  "overdue": 2
}
```

## Frontend Components

### 1. TaskManagement Component (Admin)
**Location**: `frontend/src/pages/admin/TaskManagement.jsx`

**Features**:
- Task statistics dashboard
- Create new tasks
- Assign tasks to employees
- Edit and delete tasks
- Filter by status, priority, assignee
- Search functionality
- View task history and comments

**Route**: `/admin/tasks`

### 2. MyTasks Component (Employee)
**Location**: `frontend/src/pages/employee/MyTasks.jsx`

**Features**:
- View assigned tasks
- Kanban board layout by status
- Update task status
- Add progress comments
- Filter by status and priority
- Overdue task highlighting
- Expandable task cards

**Route**: `/employee/tasks`

### 3. TaskNotification Component
**Location**: `frontend/src/components/TaskNotification.jsx`

**Features**:
- Bell icon with unread count badge
- Dropdown notification panel
- Shows overdue tasks
- Shows tasks due in 2 days or less
- Shows tasks in review
- Auto-refreshes every 30 seconds
- Click to view all tasks

**Integration**: Added to Layout component, visible in top navigation bar

## How to Use

### For Admins

#### Creating a Task
1. Navigate to "Task Management" in sidebar
2. Click "Create New Task" button
3. Fill in the form:
   - **Title**: Brief task name (required)
   - **Description**: Detailed task information
   - **Priority**: LOW, MEDIUM, HIGH, or URGENT
   - **Status**: Initial status (usually TODO)
   - **Assign To**: Select an employee from dropdown
   - **Due Date**: Set deadline
   - **Campaign**: Link to specific campaign (optional)
   - **Hoarding**: Link to specific hoarding (optional)
4. Click "Create Task"

#### Managing Tasks
- **Edit**: Click edit icon on task card
- **Delete**: Click delete icon (confirmation required)
- **View Details**: Click on task card to expand
- **Filter**: Use filters at top to narrow down tasks
- **Search**: Type in search box to find specific tasks

#### Monitoring Progress
- View dashboard statistics at top
- Check overdue tasks (highlighted in red)
- Review task updates/comments from employees
- Track completion rates by status

### For Employees

#### Viewing Tasks
1. Navigate to "My Tasks" in sidebar
2. See all assigned tasks organized by status columns:
   - To Do
   - In Progress
   - In Review
   - Completed

#### Updating Tasks
1. Click on a task card to expand
2. Click "Update Task" button
3. Select new status:
   - **TODO**: Not started yet
   - **IN_PROGRESS**: Currently working on it
   - **IN_REVIEW**: Ready for review
   - **COMPLETED**: Finished
4. Add optional comment about progress
5. Click "Update Task"

#### Task Prioritization
- Red badge = URGENT priority
- Orange badge = HIGH priority
- Yellow badge = MEDIUM priority
- Blue badge = LOW priority
- Red "Overdue" badge = Past due date

### Notifications

Both admins and employees see notifications for:
- Tasks overdue (past due date)
- Tasks due today
- Tasks due within 2 days
- Tasks in review status

**Notification Bell**:
- Shows red badge with count of tasks needing attention
- Click to view dropdown with details
- Click "View All Tasks" to go to task page
- Refreshes automatically every 30 seconds

## Task Workflow

### Standard Task Lifecycle
1. **Admin creates task** → Status: TODO
2. **Admin assigns to employee** → Employee receives notification
3. **Employee starts work** → Status: IN_PROGRESS
4. **Employee completes work** → Status: IN_REVIEW
5. **Admin reviews** → Status: COMPLETED or back to IN_PROGRESS
6. **Task closed** → Status: COMPLETED

### Alternative Workflows
- **Cancelled**: Task no longer needed
- **Reassignment**: Admin can change assignee at any time
- **Priority changes**: Can be updated as needed
- **Due date extensions**: Can be modified by admin

## Integration with Other Features

### Campaign Integration
- Tasks can be linked to specific campaigns
- View campaign details from task card
- Filter tasks by campaign

### Hoarding Integration
- Tasks can be linked to specific hoardings
- Useful for maintenance, installation tasks
- Track hoarding-specific activities

### User Integration
- Tasks track creator and assignee
- User names displayed in task cards
- Role-based access control

## Testing the System

### Backend Testing
```bash
# Test get all tasks
curl http://localhost:5000/admin/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test create task
curl -X POST http://localhost:5000/admin/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "priority": "HIGH",
    "assignedToId": 2,
    "dueDate": "2025-11-10"
  }'

# Test task statistics
curl http://localhost:5000/admin/tasks/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing
1. **Login as Admin**
   - Go to `/admin/tasks`
   - Create a new task
   - Assign to an employee
   - Edit task details
   - Add comments

2. **Login as Employee**
   - Go to `/employee/tasks`
   - View assigned tasks
   - Update task status
   - Add progress comments

3. **Test Notifications**
   - Create overdue task (past due date)
   - Create urgent priority task
   - Check notification bell shows count
   - Click to view dropdown

## Troubleshooting

### Tasks not showing up
- Check user authentication
- Verify role (ADMIN or EMPLOYEE)
- Check console for API errors
- Ensure tasks are properly assigned

### Cannot update task
- Verify user has permission
- Check if task exists
- Ensure valid status transition
- Check backend logs

### Notifications not appearing
- Check browser console for errors
- Verify API endpoint is accessible
- Check if tasks meet notification criteria
- Try refreshing the page

### Database issues
- Ensure migration ran successfully: `npx prisma migrate dev`
- Check database connection
- Verify schema is in sync: `npx prisma generate`

## Future Enhancements

Possible improvements:
1. **Email Notifications** - Send emails for task assignments
2. **Push Notifications** - Browser push notifications
3. **Task Templates** - Predefined task templates
4. **Recurring Tasks** - Automatic task creation
5. **File Attachments** - Attach files to tasks
6. **Time Tracking** - Track time spent on tasks
7. **Task Dependencies** - Link tasks together
8. **Calendar View** - View tasks on calendar
9. **Mobile App** - Native mobile application
10. **Gantt Chart** - Project timeline visualization

## Files Modified/Created

### Backend
- ✅ `backend/prisma/schema.prisma` - Added Task and TaskUpdate models
- ✅ `backend/controllers/taskController.js` - Task CRUD operations
- ✅ `backend/routes/admin.js` - Added task routes
- ✅ `backend/prisma/migrations/20251102125433_add_task_management/` - Migration files

### Frontend
- ✅ `frontend/src/pages/admin/TaskManagement.jsx` - Admin task interface
- ✅ `frontend/src/pages/employee/MyTasks.jsx` - Employee task interface
- ✅ `frontend/src/components/TaskNotification.jsx` - Notification bell
- ✅ `frontend/src/components/Layout.jsx` - Added notification to layout
- ✅ `frontend/src/components/Sidebar.jsx` - Added task navigation links
- ✅ `frontend/src/App.js` - Added task routes

## Support

For issues or questions:
1. Check this documentation
2. Review API responses in browser console
3. Check backend logs for errors
4. Verify database schema is up to date
5. Ensure all dependencies are installed

## Summary

The task management system is now fully integrated and operational! 🎉

**Key Features**:
- ✅ Create and assign tasks
- ✅ Track progress with status updates
- ✅ Priority levels and due dates
- ✅ Real-time notifications
- ✅ Kanban board view
- ✅ Comment/update system
- ✅ Role-based access control
- ✅ Statistics dashboard

**Ready to Use**:
- Admin can manage all tasks at `/admin/tasks`
- Employees can view their tasks at `/employee/tasks`
- Notifications appear in top navigation bar
- Full integration with existing system
