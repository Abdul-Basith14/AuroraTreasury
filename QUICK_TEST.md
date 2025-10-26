# ⚡ Quick Test Guide - Failed Payments Feature

## 🚀 5-Minute Test

### 1️⃣ Create Test Data (30 seconds)

```bash
cd server
npm run test:failed-payment
```

**Output will show:**
```
👤 Found member: john@example.com
✅ Failed payment created successfully!
```

---

### 2️⃣ Start Servers (if not running)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

### 3️⃣ Test in Browser (3 minutes)

**Open:** `http://localhost:5173`

#### Step A: Login
- Use email from script output
- Enter your password
- Click "Login"

#### Step B: View Failed Payment
- You'll see a **RED section** at top: "⚠️ Failed Payments"
- Shows: "1 Failed Payment"
- Red card displays: November 2024, ₹100

#### Step C: Resubmit Payment
1. Click **"Pay Now"** button
2. Modal opens with QR code
3. Click upload area
4. Choose any image file
5. (Optional) Add note: "Test payment"
6. Click **"Submit Payment"**

#### Step D: Verify Success
✅ Toast notification: "Payment proof submitted!"
✅ Card now shows yellow badge: "Awaiting treasurer verification"
✅ Button disabled: "⏱ Pending Verification"

#### Step E: View History
1. Click **"View History"** button
2. See timeline with 2 entries:
   - Failed (original)
   - Failed (resubmitted) with your name

---

## 🎯 What You Should See

### Before Resubmission:
```
┌────────────────────────┐
│ November 2024          │
│ ₹100                   │
│ Deadline: 05/11/2024   │
│ (Passed)               │
│                        │
│ [💰 Pay Now]           │ ← Green, clickable
│ [📄 View History]      │
└────────────────────────┘
```

### After Resubmission:
```
┌────────────────────────┐
│ November 2024          │
│ ₹100                   │
│ Deadline: 05/11/2024   │
│                        │
│ 🟡 Resubmitted on date │ ← Yellow badge
│ Awaiting verification  │
│                        │
│ [⏱ Pending...]         │ ← Gray, disabled
│ [📄 View History]      │
└────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Script created failed payment
- [ ] Red section appeared in dashboard
- [ ] Modal opened with QR code
- [ ] Image uploaded successfully
- [ ] Submission worked
- [ ] Status changed to pending
- [ ] Button became disabled
- [ ] History showed timeline

---

## 🆘 Quick Fixes

**Problem:** Section not showing
→ Run script again: `npm run test:failed-payment`

**Problem:** Can't upload image
→ Check file size < 5MB and type is JPG/PNG

**Problem:** Button still enabled
→ Refresh page (F5)

**Problem:** No member found
→ Create member account first via registration

---

## 📱 Test on Mobile

1. Open browser DevTools (F12)
2. Click mobile view icon
3. Select "iPhone 12" or similar
4. Repeat test - should work perfectly!

---

## 🎬 Video Walkthrough (Do This)

1. **Record your screen** while testing
2. Show:
   - Running the script ✅
   - Logging in ✅
   - Seeing failed section ✅
   - Clicking Pay Now ✅
   - Uploading image ✅
   - Submitting ✅
   - Seeing pending status ✅
   - Viewing history ✅

---

## 🔄 Test Again

Want to test again?

```bash
# Option 1: Clear resubmission manually
mongosh
use aurora-treasury
db.groupfunds.updateMany(
  { status: "Failed" },
  { $set: { "failedPaymentSubmission.resubmittedPhoto": null } }
)

# Option 2: Create another failed payment
# Change month in script and run again
```

---

## 🎉 Done!

If all checkboxes are ✅, the feature is working perfectly!

**Next:** Read `FAILED_PAYMENTS_TEST_GUIDE.md` for advanced testing scenarios.
