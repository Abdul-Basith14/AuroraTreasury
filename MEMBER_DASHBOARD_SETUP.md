# Member Dashboard Setup Guide

## 🎉 Overview

The Member Dashboard is now complete! This guide will help you set up and test the new group fund payment tracking system.

## 📋 What's Been Implemented

### Backend Components ✅
- **GroupFund Model** - Tracks monthly payments with status, proof, and verification
- **Updated ClubSettings Model** - Added QR code, payment instructions, and year-wise amounts
- **Cloudinary Integration** - Image upload for payment proofs
- **API Routes & Controllers** - Complete CRUD operations for group funds
- **Cron Jobs** - Auto-mark overdue payments as Failed

### Frontend Components ✅
- **MemberDashboard** - Main container with data fetching
- **PaymentSummaryCard** - Animated total paid display
- **MemberInfoCard** - User profile with Aurora badge
- **PaymentHistoryTable** - Responsive table with status badges
- **PayGroupFundModal** - Payment submission with image upload
- **API Utilities** - groupFundAPI with all endpoints

## 🚀 Setup Instructions

### 1. Install Dependencies

#### Backend
```bash
cd server
npm install multer-storage-cloudinary
```

#### Frontend
All required packages are already installed (axios, react-hot-toast, lucide-react)

### 2. Configure Cloudinary

**Important:** You need a Cloudinary account to upload payment proofs.

1. Sign up at https://cloudinary.com (Free tier is sufficient)
2. Get your credentials from the Dashboard
3. Update `server/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 3. Seed Initial Club Settings

You need to create club settings in MongoDB. Use MongoDB Compass or Mongosh:

```javascript
db.clubsettings.insertOne({
  auroraCode: "AURORA2025",
  academicYear: "2025-2026",
  monthlyFundAmount: 100,
  paymentDeadline: 5,
  paymentDeadlineDay: 5,
  clubName: "Aurora Theatrical Club",
  clubDescription: "A theatrical club dedicated to promoting performing arts",
  paymentInstructions: "Please pay the monthly group fund by the 5th of every month. Upload payment proof after making the payment.",
  fundAmountByYear: {
    firstYear: 50,
    secondYear: 100,
    thirdYear: 150,
    fourthYear: 200
  },
  treasurerQRCode: null, // Upload QR code image URL here later
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 4. Upload Treasurer QR Code (Optional)

1. Generate a UPI QR code for the treasurer's account
2. Upload it to Cloudinary manually or via API
3. Update the `treasurerQRCode` field in ClubSettings with the Cloudinary URL

### 5. Start the Servers

#### Backend
```bash
cd server
npm run dev
```

#### Frontend
```bash
cd client
npm run dev
```

## 🧪 Testing Checklist

### Backend Testing (Use Postman or Thunder Client)

#### 1. Get Club Settings
```http
GET http://localhost:5000/api/groupfund/settings
Authorization: Bearer YOUR_JWT_TOKEN
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "treasurerQRCode": "https://cloudinary.com/...",
    "paymentInstructions": "Please pay the monthly group fund...",
    "fundAmountByYear": {
      "firstYear": 50,
      "secondYear": 100,
      "thirdYear": 150,
      "fourthYear": 200
    },
    "paymentDeadlineDay": 5,
    "academicYear": "2025-2026",
    "userAmount": 100
  }
}
```

#### 2. Submit Payment (with image file)
```http
POST http://localhost:5000/api/groupfund/submit-payment
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- month: "November 2025"
- year: 2025
- monthNumber: 11
- academicYear: "2025-2026"
- paymentProof: [IMAGE FILE]
- notes: "Paid via UPI"
```

Expected Response:
```json
{
  "success": true,
  "message": "Payment proof submitted successfully. Awaiting treasurer verification.",
  "data": {
    "_id": "...",
    "userId": "...",
    "month": "November 2025",
    "amount": 100,
    "status": "Pending",
    "paymentProof": "https://cloudinary.com/..."
  }
}
```

#### 3. Get My Payments
```http
GET http://localhost:5000/api/groupfund/my-payments
Authorization: Bearer YOUR_JWT_TOKEN
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "summary": {
      "totalPaid": 0,
      "totalPending": 1,
      "totalFailed": 0,
      "totalRecords": 1
    }
  }
}
```

#### 4. Download Payment Proof
```http
GET http://localhost:5000/api/groupfund/download-proof/:paymentId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Frontend Testing

#### 1. Login as Member
- Navigate to `/login`
- Login with a member account (not treasurer)
- Should redirect to `/member-dashboard`

#### 2. View Dashboard
- ✅ Check if **PaymentSummaryCard** displays (should show ₹0 initially)
- ✅ Check if **MemberInfoCard** shows user details correctly
- ✅ Check if **PaymentHistoryTable** is empty with proper message
- ✅ Check statistics cards (0 paid, 0 pending, 0 failed)

#### 3. Submit Payment
1. Click "Pay Group Fund" button
2. Modal should open with:
   - ✅ Payment instructions
   - ✅ QR code (if configured)
   - ✅ Your payment amount based on year
   - ✅ Month dropdown (November 2025 onwards)
   - ✅ Image upload area
3. Select a month (e.g., "November 2025")
4. Upload a test image (screenshot or any image)
5. Add optional notes
6. Click "Submit Payment"
7. Should show success toast
8. Modal closes and table updates with new payment

#### 4. View Payment History
- ✅ New payment appears in table
- ✅ Status shows "Pending" (yellow badge with clock icon)
- ✅ Deadline date is displayed (5th of selected month)
- ✅ Amount matches user's year amount
- ✅ "Under Review" text shows in Actions column

#### 5. Test Responsive Design
- ✅ Desktop: Cards side by side, full table
- ✅ Tablet: Cards stack, table scrollable
- ✅ Mobile: Cards stack, table converts to card view

#### 6. Test Download (After Treasurer Verifies)
Once a treasurer marks payment as "Paid":
- ✅ Download button appears in Actions column
- ✅ Clicking opens payment proof in new tab
- ✅ Total paid amount updates in summary card

## 📱 UI Components Details

### Color Scheme
- **Primary**: Blue (#3B82F6) - Club theme
- **Success**: Green (#10B981) - Paid status
- **Warning**: Yellow (#F59E0B) - Pending status
- **Danger**: Red (#EF4444) - Failed status

### Animations
- ✅ Fade-in on page load
- ✅ Animated number counter for total paid
- ✅ Hover effects on cards and table rows
- ✅ Loading spinners during API calls
- ✅ Smooth transitions on buttons

### Responsive Breakpoints
- Mobile: < 768px (Cards stack, table converts to cards)
- Tablet: 768px - 1024px (Cards stack, table scrollable)
- Desktop: > 1024px (Full layout)

## 🔧 Troubleshooting

### Issue: "Cloudinary configuration incomplete"
**Solution**: Make sure `.env` has all three Cloudinary variables set correctly.

### Issue: "Club settings not configured"
**Solution**: Seed the ClubSettings collection as shown in Step 3.

### Issue: "Failed to upload image"
**Causes**:
1. Cloudinary credentials are wrong
2. Image file is too large (> 5MB)
3. File format not supported (only jpg, png, webp)

### Issue: "Payment not appearing in table"
**Solution**: 
1. Check browser console for errors
2. Verify JWT token is valid
3. Check if backend API is returning data correctly
4. Try refreshing the page

### Issue: "Total paid not updating"
**Solution**: Total paid only counts payments with status "Paid" (verified by treasurer). Pending payments don't add to total.

## 🎯 Next Steps

### Optional Enhancements

1. **Enable Cron Job** (Auto-mark overdue payments)
   - Uncomment in `server/server.js`:
   ```javascript
   import { startCronJobs } from './utils/cronJobs.js';
   startCronJobs();
   ```

2. **Add Treasurer Dashboard** (To verify payments)
   - Create treasurer routes to list all pending payments
   - Add approve/reject functionality

3. **Email Notifications**
   - Send email when payment is submitted
   - Notify when payment is verified
   - Reminder emails before deadline

4. **Payment Analytics**
   - Monthly collection reports
   - Payment trends graph
   - Export to CSV/PDF

5. **Receipt Generation**
   - Auto-generate PDF receipt after verification
   - Include transaction details and club stamp

## 📞 Support

If you encounter any issues:
1. Check this guide thoroughly
2. Verify all environment variables
3. Ensure MongoDB is running
4. Check server logs for detailed error messages
5. Use browser DevTools to inspect network requests

## ✨ Features Summary

### Member Features
- ✅ View total amount paid with animated counter
- ✅ Track payment history by month
- ✅ Submit payment proof with image upload
- ✅ View payment status (Paid/Pending/Failed)
- ✅ Download verified payment proofs
- ✅ See payment deadlines
- ✅ Add notes to payments
- ✅ Responsive design for all devices

### Backend Features
- ✅ Secure image upload to Cloudinary
- ✅ Role-based access control
- ✅ Payment amount calculation by year
- ✅ Deadline tracking
- ✅ Payment status management
- ✅ Duplicate prevention (one payment per month)
- ✅ Cron job for overdue payments

---

## 🎊 Congratulations!

Your Member Dashboard is ready to use! Members can now easily track and submit their group fund payments with a modern, user-friendly interface.

Happy coding! 🚀
