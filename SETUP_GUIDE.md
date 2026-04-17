# Frontend Setup Guide

## 🎯 What Was Added

Your UI now has:
- ✅ Complete authentication system
- ✅ Login page
- ✅ Protected routes
- ✅ User profile display
- ✅ Logout functionality
- ✅ Role-based access control
- ✅ Automatic token refresh
- ✅ API service with interceptors

---

## 📁 New Files Created

```
ui/src/
├── contexts/
│   └── AuthContext.tsx ✅ (Auth state management)
├── lib/
│   └── api.ts ✅ (API service with auth)
├── types/
│   └── auth.ts ✅ (TypeScript types)
├── components/
│   ├── ProtectedRoute.tsx ✅ (Route protection)
│   └── AppLayout.tsx ✅ (Updated with user info)
├── pages/
│   └── Login.tsx ✅ (Login page)
├── .env ✅ (API configuration)
└── .env.example ✅ (Template)
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies (2 min)

```bash
cd ui
npm install
```

**Note**: Make sure you have Node.js installed (v18 or higher)

---

### Step 2: Verify Configuration (30 sec)

Check that `.env` file exists and contains:

```env
VITE_API_URL=http://localhost:5000/api
```

✅ **Already created for you!**

---

### Step 3: Start Backend Server (if not running)

**In a separate terminal**:

```bash
cd ../server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ Database connected successfully
```

---

### Step 4: Start Frontend (1 min)

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

### Step 5: Test Login (1 min)

1. Open browser: http://localhost:5173
2. You'll be redirected to login page
3. Use default admin credentials:
   ```
   Email: admin@smartkisanbharat.com
   Password: Admin@123
   ```
4. Click Login
5. You should be redirected to Dashboard!

✅ **If you see the dashboard, authentication is working!**

---

## 🔐 How Authentication Works

### Login Flow

```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Receive access token (JWT)
    ↓
Store in memory (ApiService)
    ↓
Receive refresh token (httpOnly cookie)
    ↓
Redirect to dashboard
```

### API Request Flow

```
Component makes API call
    ↓
Axios interceptor adds access token to header
    ↓
Authorization: Bearer <token>
    ↓
API validates token
    ↓
If valid → Return data
If expired (401) → Auto-refresh token → Retry request
If refresh fails → Redirect to login
```

### Protected Routes

```
User navigates to /crops
    ↓
ProtectedRoute component checks authentication
    ↓
If authenticated → Show page
If not authenticated → Redirect to /login
If wrong role → Show "Access Denied"
```

---

## 🎨 Using the API Service

The `apiService` is available throughout your app:

### In React Components

```typescript
import apiService from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Get authenticated user
const { user, logout } = useAuth();

// Fetch crops
const crops = await apiService.getCrops();

// Create a new crop
const newCrop = await apiService.createCrop({
  name: 'Sugarcane',
  local_name: 'गन्ना',
  category: 'Cash Crop',
  growing_season: 'All Year'
});

// Update crop
const updated = await apiService.updateCrop(id, { description: 'Updated' });

// Delete crop
await apiService.deleteCrop(id);

// Diagnose symptoms
const diagnosis = await apiService.diagnose([1, 2, 3]);
```

### Generic CRUD Methods

```typescript
// Get all items
const items = await apiService.getAll('varieties');

// Get single item
const item = await apiService.getOne('varieties', 1);

// Create item
const newItem = await apiService.create('varieties', data);

// Update item
const updated = await apiService.update('varieties', 1, data);

// Delete item
await apiService.delete('varieties', 1);
```

---

## 👥 User Roles

The system has 4 roles with different permissions:

### Admin
- ✅ Full access to everything
- ✅ User management
- ✅ All CRUD operations
- ✅ Delete capabilities

### Agent (Field Agent)
- ✅ Read all data
- ✅ Create crops and symptoms
- ✅ Update symptoms
- ❌ Cannot delete
- ❌ Limited access to advanced features

### Expert (Agricultural Expert)
- ✅ Read all data
- ✅ Create/update crops, varieties, symptoms, diagnoses, products
- ✅ Manage mappings and prescriptions
- ❌ Cannot delete (limited)
- ❌ No user management

### Viewer
- ✅ Read-only access to all data
- ❌ Cannot create, update, or delete anything

---

## 🔧 Folder Structure Explanation

### `/src/contexts/AuthContext.tsx`
Manages authentication state:
- Current user
- Login/logout functions
- Loading state
- Auto-refresh on mount

### `/src/lib/api.ts`
Centralized API service:
- Axios instance with interceptors
- Token management
- Auto-refresh on 401
- All API methods

### `/src/components/ProtectedRoute.tsx`
Route protection:
- Checks if user is authenticated
- Shows loading while checking
- Redirects to login if not authenticated
- Checks role permissions
- Shows "Access Denied" if wrong role

### `/src/pages/Login.tsx`
Login UI:
- Email and password inputs
- Loading state
- Error handling via toast
- Redirects to dashboard on success

---

## 🐛 Troubleshooting

### Issue: "Network Error" on login
**Cause**: Backend server not running
**Fix**: Start backend server with `cd server && npm run dev`

### Issue: Redirected to login immediately after logging in
**Cause**: Token not being stored
**Fix**: Check browser console for errors. Ensure cookies are enabled.

### Issue: "CORS error"
**Cause**: Backend CORS not configured for frontend URL
**Fix**: Check server/.env has `CLIENT_URL=http://localhost:5173`

### Issue: 401 errors on all API calls
**Cause**: Token expired or invalid
**Fix**: Logout and login again. Check backend JWT secrets are configured.

### Issue: Pages show "Access Denied"
**Cause**: User role doesn't have permission
**Fix**: Login with admin account or remove role restrictions from ProtectedRoute

### Issue: TypeScript errors
**Cause**: Missing dependencies
**Fix**: Run `npm install` again

---

## 📝 Default Credentials

```
Email: admin@smartkisanbharat.com
Password: Admin@123
Role: Admin
```

⚠️ **IMPORTANT**: Change this password after first login!

To create new users, use the backend API:
```bash
POST http://localhost:5000/api/auth/register
Authorization: Bearer <admin_access_token>

{
  "email": "agent@example.com",
  "username": "agent1",
  "password": "SecurePass@123",
  "full_name": "Field Agent 1",
  "role": "agent"
}
```

---

## ✅ Testing Checklist

### Authentication
- [ ] Can login with admin credentials
- [ ] Redirected to dashboard after login
- [ ] User info shows in sidebar
- [ ] Can logout successfully
- [ ] Redirected to login after logout
- [ ] Protected routes redirect to login when not authenticated

### API Integration
- [ ] Can view crops list
- [ ] Can view symptoms list
- [ ] All pages load without errors
- [ ] No console errors

### Token Management
- [ ] Access token included in API requests
- [ ] Token auto-refreshes on 401
- [ ] Session persists on page reload (until refresh token expires)

---

## 🚀 Next Steps

### Immediate
1. Update each page to use `apiService` instead of dummy data
2. Add React Query mutations for create/update/delete
3. Test CRUD operations
4. Add loading states
5. Add error handling

### Short-term
1. Add user profile page
2. Add password change functionality
3. Add user management page (Admin only)
4. Improve error messages
5. Add confirmation dialogs for delete operations

### Long-term
1. Add image upload for crops/symptoms
2. Add bulk operations
3. Add export to CSV
4. Add advanced filtering
5. Add dark mode

---

## 📚 Resources

- **Backend API Docs**: `../server/README.md`
- **Testing Guide**: `../server/TESTING_GUIDE.md`
- **API Reference**: Check server endpoints in `server.js`
- **Type Definitions**: `src/types/auth.ts`

---

**Setup Time**: ~5 minutes
**Status**: Ready to use!
**Next**: Start the app and login!