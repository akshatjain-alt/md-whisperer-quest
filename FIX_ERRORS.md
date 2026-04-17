# Quick Fix Guide

## ✅ Backend Issue - FIXED!
Port 5000 was in use. Process killed successfully.
You can now start the backend server.

## 🔧 Frontend Issue - Need to Fix

### Problem
Axios package is missing

### Solution

**Open terminal in ui folder and run:**

```bash
cd C:\Users\Inno\Desktop\crop_clinic\ui
npm install axios
```

This will install the axios package (~30 seconds)

---

## 🚀 After Installing Axios

### Start Backend (Terminal 1)
```bash
cd C:\Users\Inno\Desktop\crop_clinic\server
npm run dev
```

### Start Frontend (Terminal 2)
```bash
cd C:\Users\Inno\Desktop\crop_clinic\ui
npm run dev
```

### Login
- Open: http://localhost:8080 (Note: Vite is using port 8080, not 5173)
- Email: admin@smartkisanbharat.com
- Password: Admin@123

---

## ✅ Success Checklist

- [x] Backend port issue fixed (killed process 60776)
- [ ] Install axios in ui folder
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Login and test

---

**Action NOW**: Run `npm install axios` in the ui folder!