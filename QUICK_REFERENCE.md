# 🚀 Quick Reference Card

## Start Servers
```bash
# Backend (Terminal 1)
cd demo10/backend
npm start
# → http://localhost:5000

# Frontend (Terminal 2)
cd demo10/frontend
npm start
# → http://localhost:3000
```

## First-Time Setup
```bash
# 1. Google Maps API Key
# Create demo10/frontend/.env:
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here

# 2. Restart frontend after adding .env
```

## User Accounts
```
Admin:
  - Creates and manages tasks
  - Views all campaigns on map
  - Access: /admin/tasks, /admin/campaigns

Employee:
  - Views and updates assigned tasks
  - Access: /employee/tasks
```

## Key Routes

### Admin Routes
- `/admin/tasks` - Task Management Dashboard
- `/admin/campaigns/:id` - Campaign Details (with map)
- `/admin/campaign/list` - All Campaigns

### Employee Routes
- `/employee/tasks` - My Tasks Kanban Board
- `/employee/dashboard` - Employee Dashboard

## API Endpoints

### Tasks
```
GET    /api/admin/tasks          - List tasks
GET    /api/admin/tasks/stats    - Statistics
POST   /api/admin/tasks          - Create task
PUT    /api/admin/tasks/:id      - Update task
DELETE /api/admin/tasks/:id      - Delete task
POST   /api/admin/tasks/:id/updates - Add comment
```

### Maps
```
GET /api/admin/campaigns/:id/map-data      - Get locations
GET /api/admin/campaigns/:id/share-map-link - Share link
```

## Features At a Glance

### 📍 Google Maps
✅ Interactive map with markers
✅ Filter by type, size, illumination
✅ Shareable public links
✅ Color-coded by hoarding type

### 📋 Task Management
✅ Create & assign tasks
✅ Priority: LOW → MEDIUM → HIGH → URGENT
✅ Status: TODO → IN_PROGRESS → IN_REVIEW → COMPLETED
✅ Comments & updates
✅ Real-time notifications

### 🔔 Notifications
✅ Bell icon in top navbar
✅ Shows overdue tasks
✅ Shows due soon (2 days)
✅ Shows tasks in review
✅ Auto-refresh every 30s

## Common Tasks

### Create a Task (Admin)
1. Go to "Task Management"
2. Click "Create New Task"
3. Fill form → Click "Create"

### Update Task (Employee)
1. Go to "My Tasks"
2. Click on task card
3. Click "Update Task"
4. Select new status → Add comment → Save

### View Campaign Map (Admin)
1. Go to "View Campaigns"
2. Click on campaign
3. Click "See on Map" button

### Share Map (Admin)
1. Open campaign details
2. Click "Share Map" button
3. Link copied to clipboard
4. Share with anyone!

## Color Codes

**Priority:**
🔴 Urgent | 🟠 High | 🟡 Medium | 🔵 Low

**Status:**
⚪ To Do | 🔵 In Progress | 🟣 In Review | 🟢 Done

**Overdue:**
🔴 Red "Overdue" badge

## Files Location

```
Backend:
  controllers/taskController.js
  controllers/campaignController.js
  routes/admin.js
  prisma/schema.prisma

Frontend:
  pages/admin/TaskManagement.jsx
  pages/employee/MyTasks.jsx
  components/CampaignMap.jsx
  components/TaskNotification.jsx
```

## Quick Troubleshooting

**Maps not loading?**
→ Check .env has REACT_APP_GOOGLE_MAPS_API_KEY

**Tasks not showing?**
→ Check user is logged in
→ Check role (Admin/Employee)

**API errors?**
→ Check backend is running
→ Check browser console (F12)

**Database issues?**
→ Run: npx prisma generate
→ Run: npx prisma migrate dev

## Documentation Files

📄 **GOOGLE_MAPS_SETUP.md** - Maps feature setup
📄 **TASK_MANAGEMENT_SETUP.md** - Task system guide
📄 **TESTING_GUIDE.md** - Testing procedures
📄 **IMPLEMENTATION_SUMMARY.md** - Project overview

## Support

🐛 Issues? Check:
1. Console logs (F12)
2. Backend terminal
3. Database connection
4. Documentation files

---

**Status**: 🟢 All systems operational!
**Version**: 1.0.0
**Last Updated**: November 2, 2025
