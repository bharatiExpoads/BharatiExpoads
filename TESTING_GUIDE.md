# Quick Start Guide - Testing Task Management & Maps

## Prerequisites
- ✅ Database migration completed
- ✅ Backend server running
- ✅ Frontend server running
- ✅ User accounts (Admin and Employee)

## Step-by-Step Testing Guide

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd demo10/backend
npm start

# Terminal 2 - Frontend  
cd demo10/frontend
npm start
```

The application should open at `http://localhost:3000`

### 2. Test Google Maps Feature

#### Setup Google Maps API Key (First Time Only)
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps JavaScript API"
3. Create `demo10/frontend/.env` file:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
4. Restart frontend server

#### Test Maps
1. Login as Admin
2. Go to "View Campaigns" from sidebar
3. Click on any campaign
4. Click **"See on Map"** button (green)
   - Should show modal with Google Maps
   - All hoarding locations marked with pins
   - Click pins to see hoarding details
   - Filter hoardings by type, size, etc.
5. Click **"Share Map"** button (orange)
   - Google Maps link copied to clipboard
   - Open link in new tab (no login required)
   - Should show all locations

### 3. Test Task Management (Admin)

#### Create a Task
1. Login as Admin
2. Click **"Task Management"** in sidebar
3. Click **"Create New Task"** button
4. Fill in form:
   - Title: "Review campaign design"
   - Description: "Check the new billboard design"
   - Priority: HIGH
   - Status: TODO
   - Assign To: Select an employee
   - Due Date: Select tomorrow's date
   - Campaign: (Optional) Select a campaign
5. Click **"Create Task"**
6. Task should appear in the list

#### View Statistics
- Top of page shows 4 statistics cards:
  - Total Tasks
  - In Progress
  - Completed
  - Overdue
- Numbers should update when you create/update tasks

#### Filter Tasks
- Use filters at top:
  - Search by title
  - Filter by status (TODO, In Progress, etc.)
  - Filter by priority (Low, Medium, High, Urgent)
  - Filter by assignee (employee name)

#### Edit a Task
1. Click edit icon (pencil) on any task card
2. Modify any field
3. Click "Save Changes"
4. Changes should reflect immediately

#### Delete a Task
1. Click delete icon (trash) on any task card
2. Confirm deletion
3. Task should be removed from list

### 4. Test Task Management (Employee)

#### View Tasks
1. Logout from Admin account
2. Login as Employee (use employee credentials)
3. Click **"My Tasks"** in sidebar
4. Should see Kanban board with 4 columns:
   - To Do
   - In Progress
   - In Review
   - Completed
5. Tasks assigned to you appear in appropriate columns

#### Update Task Status
1. Click on a task card to expand
2. Click **"Update Task"** button
3. Select new status:
   - **IN_PROGRESS** if you're starting work
   - **IN_REVIEW** if ready for review
   - **COMPLETED** if done
4. Add optional comment: "Started working on this"
5. Click **"Update Task"**
6. Task moves to new column
7. Comment appears in task history

#### View Task Details
When task is expanded, you can see:
- Full description
- Priority badge (color-coded)
- Due date
- Campaign name (if linked)
- Created by (admin name)
- All previous comments/updates

### 5. Test Notifications

#### For Overdue Tasks
1. As Admin, create a task with:
   - Due date: Yesterday
   - Assign to: Any employee
2. Look at top right corner
3. Bell icon should show red badge with "1"
4. Click bell icon
5. Dropdown shows the overdue task in red

#### For Urgent Tasks
1. Create task with Priority: URGENT
2. Bell icon should show notification
3. Task appears in notification dropdown

#### For Due Soon Tasks
1. Create task with due date: Today or tomorrow
2. Bell shows notification
3. Task appears as "Due today" or "Due in 1 day"

#### Auto Refresh
- Notifications auto-refresh every 30 seconds
- Open two browser windows (Admin and Employee)
- Create task in one window
- Other window updates automatically

### 6. Test Integration Features

#### Task with Campaign
1. Create task and link to campaign
2. Campaign name shows in task card
3. Useful for campaign-related tasks

#### Task Comments/Updates
1. As Employee, update a task
2. Add comment: "Halfway complete"
3. Update status to IN_PROGRESS
4. As Admin, go to Task Management
5. Click on the task
6. See employee's comment in updates section

#### Overdue Detection
1. Create task with due date in the past
2. Task shows red "Overdue" badge
3. Appears in notifications
4. Highlighted in both Admin and Employee views

## Common Test Scenarios

### Scenario 1: Campaign Launch Workflow
1. Admin creates campaign
2. Admin creates tasks:
   - "Design billboard" → Assign to Designer
   - "Print materials" → Assign to Printer Manager
   - "Install hoardings" → Assign to Installation Team
3. Employees update progress
4. Admin monitors via statistics and notifications

### Scenario 2: Urgent Issue
1. Admin creates task:
   - Title: "Fix broken hoarding at Location X"
   - Priority: URGENT
   - Due Date: Today
2. Employee gets notification
3. Employee updates status and adds photo/comment
4. Admin verifies completion

### Scenario 3: View Campaign Locations
1. Admin opens campaign details
2. Clicks "See on Map"
3. Reviews all hoarding locations visually
4. Shares map link with client via email
5. Client views map without login

## Verification Checklist

### Maps Feature ✓
- [ ] Google Maps loads in modal
- [ ] All hoarding markers visible
- [ ] Click markers shows info
- [ ] Filters work (type, size, illumination)
- [ ] Share link copies to clipboard
- [ ] Shared link opens in Google Maps
- [ ] No login required for shared link

### Task Management (Admin) ✓
- [ ] Create new task
- [ ] Edit existing task
- [ ] Delete task
- [ ] Assign to employee
- [ ] Set priority and due date
- [ ] View statistics
- [ ] Filter tasks
- [ ] Search tasks
- [ ] View task updates

### Task Management (Employee) ✓
- [ ] View assigned tasks
- [ ] Kanban board layout works
- [ ] Update task status
- [ ] Add progress comments
- [ ] Filter tasks
- [ ] Overdue tasks highlighted
- [ ] Task details expandable

### Notifications ✓
- [ ] Bell icon shows count
- [ ] Overdue tasks appear
- [ ] Due soon tasks appear
- [ ] Urgent tasks appear
- [ ] Tasks in review appear
- [ ] Click notification opens dropdown
- [ ] "View All Tasks" link works
- [ ] Auto-refresh works (30s)

## Troubleshooting

### Maps not loading
```bash
# Check if API key is set
cat demo10/frontend/.env
# Should show: REACT_APP_GOOGLE_MAPS_API_KEY=...

# Restart frontend if you just added it
cd demo10/frontend
npm start
```

### Tasks not appearing
```bash
# Check backend is running
curl http://localhost:5000/api/test

# Check if migration ran
cd demo10/backend
npx prisma migrate status

# Regenerate Prisma client if needed
npx prisma generate
```

### API errors
1. Open browser console (F12)
2. Check Network tab for failed requests
3. Check backend terminal for errors
4. Verify authentication token is valid

### Database issues
```bash
# Check database connection
cd demo10/backend
npx prisma studio

# Should open Prisma Studio in browser
# Verify Task and TaskUpdate tables exist
```

## Next Steps After Testing

1. **Add More Employees**
   - Go to Masters → Employee Master
   - Add team members
   - Assign them tasks

2. **Configure Google Maps API**
   - Add billing info for production
   - Set API restrictions
   - Monitor usage

3. **Customize Task Workflow**
   - Add more status options if needed
   - Create task templates
   - Set up email notifications

4. **Train Team**
   - Show admins how to create tasks
   - Show employees how to update tasks
   - Demonstrate notification system

## Support

If you encounter issues:
1. Check console logs (browser and server)
2. Verify all services are running
3. Review setup documentation
4. Check database schema is up to date

## Success Metrics

You've successfully tested the system when:
- ✅ Maps show all campaign locations
- ✅ Shared map links work without login
- ✅ Admins can create and manage tasks
- ✅ Employees can view and update tasks
- ✅ Notifications work for both roles
- ✅ Filters and search work correctly
- ✅ Statistics update in real-time
- ✅ Comments/updates are tracked

🎉 **Congratulations! Your task management and maps features are fully operational!**
