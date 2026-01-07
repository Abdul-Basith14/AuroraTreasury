# AuroraTreasury Backend API

Backend server for AuroraTreasury - A theatrical club finance management system.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT signing
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)

### 3. Start MongoDB

Make sure MongoDB is running:
- **Local MongoDB**: `mongod`
- **MongoDB Atlas**: Use your Atlas connection string in `.env`

### 4. Seed Club Settings

Initialize club configuration (aurora code, academic year, etc.):

```bash
node utils/seedClubSettings.js
```

This creates default settings with aurora code: `AURORA2024`

### 5. Start Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Sign Up
```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "usn": "1CR21CS001",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "year": "2nd",
  "branch": "Computer Science",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### 2. Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "auroraCode": "AURORA2024"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      ...
    },
    "token": "jwt_token_here"
  }
}
```

#### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

#### 4. Verify Token
```
POST /api/auth/verify
Authorization: Bearer <token>
```

#### 5. Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

## Database Models

### User Model
- name (String, required)
- usn (String, unique, required)
- email (String, unique, required)
- password (String, hashed, required)
- year (String, enum: 1st-4th, required)
- branch (String, required)
- role (String, enum: member/treasurer)
- profilePhoto (String)
- totalPaid (Number, default: 0)
- isActive (Boolean, default: true)
- timestamps (createdAt, updatedAt)

### ClubSettings Model
- auroraCode (String, unique, required)
- academicYear (String, format: YYYY-YYYY)
- monthlyFundAmount (Number)
- paymentDeadline (Number, 1-31)
- clubName (String)
- clubDescription (String)
- isActive (Boolean)
- timestamps

## Authentication Flow

1. **Sign Up**: User registers with personal details
2. **Login**: User provides email, password, and aurora code
3. **Token Generation**: Server creates JWT token valid for 7 days
4. **Protected Routes**: Client sends token in Authorization header
5. **Token Verification**: Middleware validates token on each protected request

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Aurora code verification
- ✅ Input validation
- ✅ Error handling
- ✅ CORS protection
- ✅ Rate limiting (to be added)

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Testing with Postman/Thunder Client

1. Import the API endpoints
2. First, signup a new user
3. Login with credentials and aurora code
4. Copy the token from login response
5. Use token in Authorization header: `Bearer <token>`

## Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   └── auth.js            # JWT verification & authorization
├── models/
│   ├── User.js            # User schema
│   └── ClubSettings.js    # Club configuration schema
├── routes/
│   └── auth.js            # Authentication routes
├── utils/
│   └── seedClubSettings.js # Database seeding script
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment file
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies & scripts
├── README.md              # This file
└── server.js              # Main server file
```

## Development Tips

1. Use `nodemon` for auto-reload during development
2. Check MongoDB logs if connection fails
3. Ensure aurora code matches in database and login request
4. Token expires after 7 days - user needs to login again
5. Use MongoDB Compass to view/edit data visually

## Troubleshooting

**MongoDB connection error:**
- Check if MongoDB is running
- Verify MONGO_URI in .env
- Check network connectivity for Atlas

**JWT error:**
- Ensure JWT_SECRET is set in .env
- Check token format: "Bearer <token>"
- Verify token hasn't expired

**CORS error:**
- Update CLIENT_URL in .env
- Check frontend is running on correct port

## Next Steps

- [ ] Add group fund payment routes
- [ ] Add reimbursement routes
- [ ] Add file upload (Multer + Cloudinary)
- [ ] Add email notifications
- [ ] Add cron jobs for deadline checking
- [ ] Add rate limiting
- [ ] Add request logging

---

Built with ❤️ for Aurora Theatrical Club
