# AuroraTreasury - Quick Start Guide

## ⚡ Quick Installation (Windows)

### Option 1: Automated Installation

1. **Run the installation script:**
   ```bash
   INSTALL.bat
   ```

2. **Edit server/.env** with your MongoDB URI:
   ```env
   MONGO_URI=mongodb://localhost:27017/aurora-treasury
   JWT_SECRET=your_secret_key_here
   ```

3. **Seed club settings:**
   ```bash
   cd server
   node utils/seedClubSettings.js
   ```

4. **Start both servers:**
   
   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

5. **Open browser:** http://localhost:5173

---

## 🎯 5-Minute Test

### 1. Create Accounts (2 min)

**Member Account:**
- Navigate to http://localhost:5173/signup
- Fill in details, select "Club Member"
- Signup

**Treasurer Account:**
- Signup again with different email
- Select "Treasurer/President"

### 2. Test Login (2 min)

**Login as Member:**
```
Email: your_member_email
Password: your_password
Aurora Code: AURORA2024
```
→ Should redirect to Member Dashboard

**Login as Treasurer:**
```
Email: your_treasurer_email
Password: your_password
Aurora Code: AURORA2024
```
→ Should redirect to Treasurer Dashboard

### 3. Verify Features (1 min)

- [x] Dashboard loads
- [x] User info displays
- [x] Logout works
- [x] Role-based routing works
- [x] Toast notifications appear

---

## 🔑 Default Credentials

**Aurora Code:** `AURORA2024`

⚠️ Change this in production by updating the ClubSettings in MongoDB!

---

## 📁 Project Structure Overview

```
Aurora-Treasury/
├── server/           # Backend (Port 5000)
│   ├── models/       # User, ClubSettings schemas
│   ├── controllers/  # Authentication logic
│   ├── routes/       # API endpoints
│   └── server.js     # Main server file
│
└── client/           # Frontend (Port 5173)
    ├── src/
    │   ├── pages/    # Login, Signup, Dashboards
    │   ├── context/  # AuthContext
    │   └── utils/    # API calls
    └── App.jsx       # Routing
```

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register user |
| `/api/auth/login` | POST | Login with aurora code |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/verify` | POST | Verify token |
| `/api/auth/logout` | POST | Logout |

---

## 🔍 Test API with cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"usn\":\"1CR21CS999\",\"email\":\"test@test.com\",\"password\":\"test123\",\"confirmPassword\":\"test123\",\"year\":\"2nd\",\"branch\":\"CS\",\"role\":\"member\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"auroraCode\":\"AURORA2024\"}"
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Start MongoDB service |
| Port 5000 in use | Kill process: `taskkill /F /IM node.exe` |
| CORS error | Check CLIENT_URL in server/.env |
| Styles not loading | Restart frontend: `Ctrl+C` → `npm run dev` |
| Invalid aurora code | Use `AURORA2024` (case-sensitive) |

---

## ✅ What's Working Now

- ✅ User registration (signup)
- ✅ User authentication (login with aurora code)
- ✅ JWT token-based auth
- ✅ Role-based routing (member/treasurer)
- ✅ Protected routes
- ✅ User profile display
- ✅ Responsive UI with Tailwind CSS
- ✅ Toast notifications

---

## 🚧 Coming Next

Phase 2 features (to be implemented):
- Monthly group fund payment tracking
- Payment proof upload (UPI screenshots)
- Reimbursement request system
- Treasurer payment verification
- Deadline automation
- Analytics dashboard

---

## 📞 Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
2. Check [README.md](./README.md) for project overview
3. Check server/README.md for API documentation

---

**Authentication System Complete! Ready for Phase 2! 🎉**
