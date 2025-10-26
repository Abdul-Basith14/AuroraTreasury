# AuroraTreasury - Complete Setup Guide

This guide will walk you through setting up AuroraTreasury from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js v16+ installed ([Download](https://nodejs.org/))
- [ ] MongoDB installed locally OR MongoDB Atlas account ([Setup Atlas](https://www.mongodb.com/cloud/atlas))
- [ ] Git installed (optional)
- [ ] Code editor (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

**Expected packages installed:**
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- multer
- cloudinary
- express-validator
- node-cron
- nodemon (dev dependency)

### Step 2: Configure Backend Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/aurora-treasury
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   ```

   **Important:**
   - For **local MongoDB**: Use `mongodb://localhost:27017/aurora-treasury`
   - For **MongoDB Atlas**: Use your connection string from Atlas dashboard
   - Change `JWT_SECRET` to a strong random string

### Step 3: Start MongoDB

**Option A - Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

**Option B - MongoDB Atlas:**
- No need to start anything
- Just use your Atlas connection string in `.env`

### Step 4: Seed Club Settings

This creates the default aurora code and club configuration:

```bash
node utils/seedClubSettings.js
```

**Output should show:**
```
✅ Club settings created successfully!
📋 Club Configuration:
   Aurora Code: AURORA2024
   Academic Year: 2024-2025
   Monthly Fund Amount: ₹100
   ...
```

**⚠️ Important:** Remember the aurora code - users need it to login!

### Step 5: Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: localhost
📊 Database: aurora-treasury
🚀 Server running in development mode on port 5000
📍 API URL: http://localhost:5000
```

**If you see this, backend is ready! ✅**

Leave this terminal running and open a new terminal for frontend.

---

### Step 6: Install Frontend Dependencies

Open a **NEW terminal** and navigate to client folder:

```bash
cd client
npm install
```

**Expected packages installed:**
- react
- react-dom
- react-router-dom
- axios
- react-hot-toast
- lucide-react
- tailwindcss
- autoprefixer
- postcss

### Step 7: Configure Frontend Environment

1. The `.env` file should already exist in the client folder with:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. If not, create it with the above content.

### Step 8: Start Frontend Server

```bash
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend is ready! ✅**

---

## 🧪 Testing the Application

### 1. Open Browser

Navigate to: **http://localhost:5173**

You should see the **Login page**.

### 2. Create a Member Account

1. Click **"Sign up here"**
2. Fill in the form:
   - Name: `John Doe`
   - USN: `1CR21CS001`
   - Email: `john@test.com`
   - Password: `test123`
   - Confirm Password: `test123`
   - Year: `2nd`
   - Branch: `Computer Science`
   - Role: `Club Member`
3. Click **"Create Account"**
4. You should see success message and be redirected to login

### 3. Create a Treasurer Account

1. Click **"Sign up here"** again
2. Fill in the form:
   - Name: `Jane Smith`
   - USN: `1CR21CS002`
   - Email: `jane@test.com`
   - Password: `test123`
   - Confirm Password: `test123`
   - Year: `4th`
   - Branch: `Computer Science`
   - Role: `Treasurer/President` ⭐
3. Click **"Create Account"**

### 4. Login as Member

1. Go to login page
2. Enter:
   - Email: `john@test.com`
   - Password: `test123`
   - Aurora Code: `AURORA2024`
3. Click **"Sign In"**
4. Should redirect to **Member Dashboard** ✅

### 5. Login as Treasurer

1. Logout (click logout button)
2. Login with:
   - Email: `jane@test.com`
   - Password: `test123`
   - Aurora Code: `AURORA2024`
3. Should redirect to **Treasurer Dashboard** ✅

---

## 🎯 Verification Checklist

Confirm everything works:

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] MongoDB connected successfully
- [ ] Can access login page
- [ ] Can create new user account
- [ ] Can login with email, password, and aurora code
- [ ] Member role redirects to member dashboard
- [ ] Treasurer role redirects to treasurer dashboard
- [ ] Logout works correctly
- [ ] Toast notifications appear for errors/success

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `MongoDB Connection Error`

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services list
   ```

2. Verify MONGO_URI in `.env`

3. For Atlas, check:
   - Network access (add your IP)
   - Database user credentials
   - Connection string format

### Issue 2: Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue 3: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Check backend `.env` has correct `CLIENT_URL=http://localhost:5173`
2. Restart backend server after changing .env
3. Clear browser cache

### Issue 4: "Invalid Aurora Code"

**Error:** When logging in

**Solutions:**
1. Check you entered `AURORA2024` (case-sensitive)
2. Verify club settings exist:
   ```bash
   node utils/seedClubSettings.js
   ```

### Issue 5: JWT Token Error

**Error:** `Token verification failed`

**Solutions:**
1. Ensure `JWT_SECRET` is set in backend `.env`
2. Logout and login again
3. Clear localStorage in browser DevTools

### Issue 6: Tailwind CSS Not Working

**Error:** Styles not applied

**Solutions:**
1. Check `tailwind.config.js` exists in client folder
2. Check `postcss.config.js` exists
3. Restart frontend server: `Ctrl+C` then `npm run dev`

---

## 📱 Next Steps

Now that authentication is working, you can:

1. ✅ Test different user roles
2. ✅ Explore member and treasurer dashboards
3. ⏳ Wait for next features:
   - Monthly fund payment tracking
   - Payment proof uploads
   - Reimbursement system
   - Analytics dashboard

---

## 🛠 Development Tips

### Hot Reload

Both frontend and backend have hot reload:
- **Frontend**: Vite automatically reloads on file changes
- **Backend**: Nodemon restarts server on file changes

### Database GUI

Use **MongoDB Compass** to view/edit data:
1. Download: https://www.mongodb.com/products/compass
2. Connect: `mongodb://localhost:27017`
3. Database: `aurora-treasury`

### API Testing

Use **Thunder Client** (VS Code extension) or **Postman**:

**Example Login Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@test.com",
  "password": "test123",
  "auroraCode": "AURORA2024"
}
```

### View Logs

- **Backend logs**: Terminal where you ran `npm run dev`
- **Frontend logs**: Browser DevTools Console (F12)

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review server/client terminal for error messages
3. Check browser console (F12) for frontend errors
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Screenshots

---

**Setup Complete! 🎉**

You now have a working authentication system for AuroraTreasury. The next phase will add group fund tracking and payment management features.
