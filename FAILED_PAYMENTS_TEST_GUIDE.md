# 🧪 Failed Payments Feature - Testing Guide

Complete guide to test the Failed Payments resubmission feature.

---

## 📋 Prerequisites

Before testing, ensure:
- ✅ MongoDB is running
- ✅ Backend server is running (`cd server && npm run dev`)
- ✅ Frontend is running (`cd client && npm run dev`)
- ✅ You have at least one member account created

---

## 🚀 Method 1: Automated Test Script (RECOMMENDED)

### Step 1: Run the Test Script

Open a terminal in the server directory and run:

```bash
cd server
npm run test:failed-payment
```

### What the script does:
1. Connects to your MongoDB database
2. Finds an existing member user
3. Creates or updates a payment record with "Failed" status
4. Displays test instructions with login credentials

### Expected Output:
```
✅ Connected to MongoDB
👤 Found member: John Doe (john@example.com)
📝 Creating new failed payment record...
✅ Failed payment created/updated successfully!

📋 Payment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID:           507f1f77bcf86cd799439011
Month:        November 2024
Amount:       ₹100
Status:       Failed
Deadline:     05/11/2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TEST INSTRUCTIONS:
...
```

### Step 2: Test in Browser

1. **Login to the application**
   - Go to `http://localhost:5173/login`
   - Use the email shown in the script output
   - Enter your password

2. **View Failed Payments Section**
   - Navigate to Member Dashboard
   - You should see a red "Failed Payments" section
   - It shows: "⚠️ 1 Failed Payment"

3. **Test Resubmission Flow**
   - Click the **"Pay Now"** button on the failed payment card
   - Modal opens with:
     - Payment details (Month, Amount, Deadline)
     - QR code for payment
     - Upload area for payment proof
   
4. **Upload Payment Proof**
   - Prepare a test image (any screenshot or photo)
   - Click upload area or drag & drop
   - See image preview
   - Optionally add a note

5. **Submit Resubmission**
   - Click **"Submit Payment"** button
   - See success toast: "Payment proof submitted!"
   - Modal closes automatically

6. **Verify Resubmission Status**
   - Failed payment card now shows:
     - 🟡 Yellow badge: "Payment resubmitted on [date]"
     - Text: "Awaiting treasurer verification"
     - Button shows: "⏱ Pending Verification" (disabled)
   
7. **View Payment History**
   - Click **"View History"** button
   - Modal shows complete status timeline:
     - Original "Failed" status entry
     - "Resubmitted" status entry with your name
     - Date and time of each change

---

## 🛠️ Method 2: Manual MongoDB Commands

If you prefer manual database manipulation:

### Option A: MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `groupfunds` collection
4. Find a payment record for a member
5. Edit document and change:
   ```json
   {
     "status": "Failed",
     "paymentProof": null,
     "paymentDate": null,
     "verifiedBy": null,
     "verifiedDate": null
   }
   ```
6. Save and test in browser

### Option B: MongoDB Shell

```javascript
// Connect to your database
use aurora-treasury

// Find a member
db.users.findOne({ role: "member" })

// Update a payment to Failed status
db.groupfunds.updateOne(
  { 
    userId: ObjectId("YOUR_MEMBER_ID"),
    month: "November 2024"
  },
  { 
    $set: { 
      status: "Failed",
      paymentProof: null,
      paymentDate: null,
      verifiedBy: null,
      verifiedDate: null
    }
  }
)
```

---

## 🎯 Test Scenarios Checklist

### Scenario 1: Basic Resubmission
- [ ] Failed payment appears in dashboard
- [ ] Can click "Pay Now"
- [ ] Modal opens with QR code
- [ ] Can upload image
- [ ] Can submit successfully
- [ ] Status changes to "Pending Verification"
- [ ] Button becomes disabled

### Scenario 2: Duplicate Prevention
- [ ] After submitting once, "Pay Now" is disabled
- [ ] Card shows "Pending Verification"
- [ ] Attempting to resubmit shows error toast

### Scenario 3: File Validation
- [ ] Try uploading non-image file → Error
- [ ] Try uploading >5MB file → Error
- [ ] Valid image uploads successfully

### Scenario 4: Payment History
- [ ] View History modal opens
- [ ] Shows current status badge
- [ ] Shows timeline of all status changes
- [ ] Each entry has: status, date, user, reason

### Scenario 5: Multiple Failed Payments
- [ ] Create 2-3 failed payments
- [ ] All appear in Failed Payments section
- [ ] Counter shows correct count
- [ ] Grid layout displays properly
- [ ] Can resubmit each independently

### Scenario 6: Responsive Design
- [ ] Test on mobile view (375px)
- [ ] Test on tablet view (768px)
- [ ] Test on desktop view (1024px+)
- [ ] Cards arrange in correct columns
- [ ] Modal is responsive

---

## 🔄 Testing Complete Workflow

### End-to-End Test:

1. **Setup (Run script)**
   ```bash
   cd server
   npm run test:failed-payment
   ```

2. **Member Side**
   - Login as member
   - See failed payments section ✅
   - Click "Pay Now" ✅
   - Upload payment proof ✅
   - Add note: "Paid via UPI, sorry for delay" ✅
   - Submit ✅
   - Verify pending status ✅
   - View history timeline ✅

3. **Treasurer Side** (via API testing or future UI)
   - Treasurer views resubmission
   - Approves the payment
   - Member's card disappears from failed section
   - Shows in regular payment table as "Paid"

---

## 🐛 Troubleshooting

### Issue: "No member user found"
**Solution:** Create a member account first
```bash
# Register via frontend or create manually in MongoDB
```

### Issue: Failed payments section not showing
**Cause:** No failed payments exist
**Solution:** Run the test script again

### Issue: Cannot upload image
**Check:**
- File size < 5MB
- File type is JPG, PNG, HEIC, or WEBP
- Cloudinary credentials are configured in `.env`

### Issue: "Payment resubmission already pending"
**Cause:** Already submitted for this payment
**Solution:** 
- Wait for treasurer verification, or
- Manually clear resubmission in MongoDB:
  ```javascript
  db.groupfunds.updateOne(
    { _id: ObjectId("PAYMENT_ID") },
    { $set: { "failedPaymentSubmission.resubmittedPhoto": null } }
  )
  ```

---

## 📸 Expected Screenshots

### 1. Failed Payments Section
```
┌─────────────────────────────────────────┐
│ ⚠️ Failed Payments                      │
│ Pay your missed monthly contributions   │
│ ┌─────┐                                 │
│ │ 1   │ Failed Payment                  │
│ └─────┘                                 │
│                                         │
│ [Red Card showing November 2024]        │
│ ₹100 | Deadline Passed                  │
│ [Pay Now] [View History]                │
└─────────────────────────────────────────┘
```

### 2. After Resubmission
```
┌─────────────────────────────────────────┐
│ November 2024                           │
│ ₹100                                    │
│ ┌────────────────────────────────────┐  │
│ │ 🟡 Payment resubmitted on date     │  │
│ │    Awaiting treasurer verification │  │
│ └────────────────────────────────────┘  │
│ [⏱ Pending Verification (disabled)]    │
│ [View History]                          │
└─────────────────────────────────────────┘
```

### 3. Payment History Modal
```
┌─────────────────────────────────────────┐
│ Payment History - November 2024    [X]  │
├─────────────────────────────────────────┤
│ Current Status: [Failed]                │
│                                         │
│ Status Timeline:                         │
│ ┌─────────────────────────────────────┐ │
│ │ ● Failed                            │ │
│ │   Changed on: 05/11/2024            │ │
│ │   By: System (Auto-marked)          │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ● Failed (Resubmitted)              │ │
│ │   Changed on: 10/11/2024            │ │
│ │   By: John Doe                      │ │
│ │   Reason: Member resubmitted...     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ✅ Success Criteria

Your test is successful when:

1. ✅ Failed payment section appears automatically
2. ✅ Red card displays payment details correctly
3. ✅ Modal opens with QR code and upload area
4. ✅ File upload works with validation
5. ✅ Submission shows success toast
6. ✅ Card updates to show "Pending Verification"
7. ✅ Pay button becomes disabled
8. ✅ History modal shows complete timeline
9. ✅ UI is responsive on all screen sizes
10. ✅ No console errors

---

## 🎓 Learning Points

This test demonstrates:
- **State Management**: Section only shows when data exists
- **Conditional Rendering**: Button states change based on resubmission
- **File Upload**: Multipart form data with Cloudinary
- **Status Tracking**: Complete audit trail of changes
- **UX Patterns**: Modal workflows, loading states, toast notifications
- **Responsive Design**: Grid layouts adapt to screen size

---

## 📞 Support

If you encounter issues:
1. Check server logs for errors
2. Check browser console for errors
3. Verify MongoDB connection
4. Ensure Cloudinary credentials are set
5. Check network tab for API responses

---

## 🎉 Next Steps

After successful testing:
1. Test treasurer verification endpoint (via Postman)
2. Implement treasurer UI for resubmission approval
3. Add email notifications
4. Test with multiple failed payments
5. Test edge cases (network errors, large files, etc.)

Happy Testing! 🚀
