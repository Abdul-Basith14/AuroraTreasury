# AuroraTreasury 🎭💰

A comprehensive finance management system for theatrical clubs built with the MERN stack.

## 🌟 Features

### For Club Members
- 📊 Track monthly group fund payments
- 💳 Submit payment proofs via UPI screenshots
- 📝 Request reimbursements for club-related expenses
- 👤 View personal payment history and status
- 📈 Dashboard with payment analytics

### For Treasurer/President
- ✅ Verify and approve member payments
- 📋 Track all members' monthly fund contributions
- 💵 Manage reimbursement requests
- 📅 Set academic year periods and fund amounts
- 📊 Generate financial reports

## 🛠 Tech Stack

**Frontend:**
- React.js 19
- React Router DOM
- Tailwind CSS
- Axios
- React Hot Toast
- Lucide React (Icons)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt.js
- Multer (File uploads)
- Cloudinary (Image storage)

## 📁 Project Structure

```
AuroraTreasury/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── utils/          # API utilities
│   │   └── App.jsx
│   └── package.json
│
└── server/                 # Express backend
    ├── config/             # Database configuration
    ├── controllers/        # Route controllers
    ├── middleware/         # Auth & other middleware
    ├── models/             # MongoDB models
    ├── routes/             # API routes
    ├── utils/              # Utility scripts
    └── server.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Aurora-Treasury
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and update values
cp .env.example .env

# Edit .env file with your MongoDB URI, JWT secret, etc.

# Seed club settings (creates default aurora code)
node utils/seedClubSettings.js

# Start the server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on http://localhost:5173

## 🔑 Default Configuration

After running the seed script, the default **Aurora Code** is: `AURORA2024`

⚠️ **Important:** Change this code before going to production!

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login with email, password & aurora code | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/verify` | Verify JWT token | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

## 🔐 Authentication Flow

1. **Signup**: User creates account with personal details
2. **Login**: User provides email, password, and **aurora code**
3. **Token**: Server generates JWT token (valid for 7 days)
4. **Protected Routes**: Client sends token in Authorization header
5. **Role-based Access**: Redirects to appropriate dashboard based on user role

## 🎨 UI Screenshots

*(Screenshots will be added after UI is built)*

## 🧪 Testing

### Test User Accounts

After signing up, you can create test accounts:

**Member Account:**
```
Name: John Doe
USN: 1CR21CS001
Email: john@example.com
Password: test123
Year: 2nd
Branch: Computer Science
Role: Member
Aurora Code: AURORA2024
```

**Treasurer Account:**
```
Name: Jane Smith
USN: 1CR21CS002
Email: jane@example.com
Password: test123
Year: 4th
Branch: Computer Science
Role: Treasurer
Aurora Code: AURORA2024
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/aurora-treasury
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🚧 Current Implementation Status

### ✅ Completed Features
- [x] Backend authentication system
- [x] User model with role-based access
- [x] Club settings configuration
- [x] JWT authentication & authorization
- [x] Frontend routing with protected routes
- [x] Login & Signup UI
- [x] Basic member dashboard
- [x] Basic treasurer dashboard
- [x] Toast notifications

### 🔄 In Progress
- [ ] Monthly group fund payment tracking
- [ ] Payment proof upload (UPI screenshots)
- [ ] Reimbursement request system
- [ ] Payment verification by treasurer
- [ ] Deadline automation
- [ ] Analytics & reporting

### 📋 Upcoming Features
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Advanced analytics with charts
- [ ] PDF/Excel export
- [ ] Member profile management
- [ ] Payment reminders
- [ ] Academic year management

## 🤝 Contributing

This is a club-specific project. For suggestions or issues:
1. Create an issue
2. Fork the repository
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Feel free to use for your club!

## 👥 Support

For support or queries:
- Open an issue on GitHub
- Contact the club treasurer
- Email: support@auroraclub.com

---

**Built with ❤️ for Aurora Theatrical Club**

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in .env
- For Atlas, check network access settings

### CORS Error
- Verify CLIENT_URL in backend .env matches frontend URL
- Check if backend is running

### JWT Token Error
- Check if JWT_SECRET is set in backend .env
- Ensure token format in request: `Bearer <token>`
- Token might be expired (default 7 days)

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

## 📖 Additional Documentation

- [Backend Documentation](./server/README.md)
- API Postman Collection (coming soon)
- Database Schema Diagram (coming soon)
