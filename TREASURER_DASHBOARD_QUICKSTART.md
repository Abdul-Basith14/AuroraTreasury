# Treasurer Dashboard - Quick Start Guide

## 🚀 Quick Setup & Testing

### Prerequisites
- Node.js installed
- MongoDB running
- Backend and frontend dependencies installed

### Step 1: Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server should start on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend should start on http://localhost:5173

### Step 2: Create Test Data

You need:
1. **Treasurer Account** - User with role 'treasurer'
2. **Member Accounts** - Users with role 'member'
3. **Group Fund Payments** - Payment records for testing

### Option A: Use Existing Data
If you already have users and payments in your database, skip to Step 3.

### Option B: Create Test Data Manually

**Create a Treasurer Account:**
1. Go to http://localhost:5173/signup
2. Fill in the form with treasurer details
3. **Important:** In MongoDB, manually change the user's role to 'treasurer'
   ```javascript
   // In MongoDB Compass or Shell
   db.users.updateOne(
     { email: "treasurer@example.com" },
     { $set: { role: "treasurer" } }
   )
   ```

**Create Member Accounts:**
1. Sign up multiple members through the signup page
2. They will have role 'member' by default

**Create Payment Records:**
Use the Member Dashboard or create directly in MongoDB with sample data.

### Step 3: Login as Treasurer

1. Navigate to http://localhost:5173/login
2. Enter treasurer credentials
3. You'll be redirected to `/treasurer-dashboard`

### Step 4: Test the Features

#### ✅ Dashboard Statistics
- View the 4 statistics cards at the top
- Check if numbers are accurate
- Click the "Failed Payments" card (should filter to failed)

#### ✅ Year Filter Tabs
- Click "All" - should show all members
- Click "1st Year" - should show only 1st year students
- Click "2nd Year", "3rd Year", "4th Year"
- Notice the count badge updates

#### ✅ Status Filter Chips
- Click "All" - shows all members
- Click "Good" - shows members with no failed/pending payments
- Click "Pending" - shows members with pending payments
- Click "Failed" - shows members with failed payments

#### ✅ Search Functionality
- Type a member's name in the search bar
- Wait 500ms (debounce delay)
- Results should filter automatically
- Try searching by USN
- Try searching by email
- Click the X icon to clear search

#### ✅ Member Cards
- View member cards in the grid
- Each card shows:
  - Profile photo (or default avatar)
  - Name and USN
  - Year and branch
  - Payment statistics (Paid, Pending, Failed)
  - Total amount paid
  - Status badge
  - Resubmission indicator (if any)
  - Failed payment alert (if any)

#### ✅ View Member Details
- Click "View Details" on any member card
- Modal should open showing:
  - Member information at the top
  - Summary statistics (4 stat boxes)
  - Complete payment history
  - Payment status badges
  - Payment proofs (clickable)
  - Resubmission information (if any)
- Click "Close" to dismiss

#### ✅ Failed Payments Quick View
- Click "View All Failed Payments" button
- Or click "Failed Payments Summary" button
- Modal should open showing:
  - Failed payments grouped by month
  - Member count and total amount per month
  - List of members with failed payments
  - Member details (name, USN, year, branch, amount)
- Click "Close" to dismiss

#### ✅ Export to CSV
- Click "Export" button in the members list header
- CSV file should download
- Open the CSV and verify:
  - Columns: Name, USN, Year, Branch, Email, Total Paid, Payment Counts, Status
  - Data matches what's shown on screen
  - Filtered data is exported (based on current filters)

#### ✅ Reset Filters
- Apply some filters (year, status, search)
- Click "Reset Filters" button
- All filters should reset to default (All)

#### ✅ Responsive Design
- Resize browser window to test responsiveness
- Mobile view: Single column layout
- Tablet view: 2 columns
- Desktop view: 3 columns
- All features should work on all screen sizes

#### ✅ Logout
- Click the logout button (top-right corner)
- Should redirect to login page
- Try accessing treasurer dashboard without login
- Should redirect to login page

## 🧪 Test Scenarios

### Scenario 1: Empty State
**Setup:** No members in database  
**Expected:** "No Members Found" message with icon

### Scenario 2: Filtered Empty State
**Setup:** Apply filters that match no members  
**Expected:** "No Members Found - Try adjusting your filters"

### Scenario 3: Member with No Payments
**Setup:** Member exists but has no payment records  
**Expected:** 
- Member card shows 0 for all payment stats
- Details modal shows "No payment records found"

### Scenario 4: Member with All Payment Types
**Setup:** Member has paid, pending, and failed payments  
**Expected:**
- Overall status shows "Failed" (highest priority)
- Correct counts in card
- All payments visible in details modal

### Scenario 5: Member with Resubmissions
**Setup:** Member has failed payment with resubmitted proof  
**Expected:**
- Orange indicator dot on profile photo
- "Has pending resubmissions" alert on card
- Resubmission info visible in details modal

### Scenario 6: Large Dataset
**Setup:** 100+ members in database  
**Expected:**
- Page loads within 1 second
- Smooth scrolling
- Filters work efficiently
- No UI lag

### Scenario 7: Search Edge Cases
**Test:**
- Empty search (shows all)
- Partial name match
- Case-insensitive search
- Special characters in USN
- No matches found

### Scenario 8: Network Errors
**Test:**
- Stop backend server
- Try loading dashboard
- Expected: Error toast notification
- Restart backend and refresh

## 📊 Sample Test Data

### Sample Treasurer:
```json
{
  "name": "John Treasurer",
  "usn": "TREAS001",
  "email": "treasurer@auroratreasury.com",
  "password": "treasurer123",
  "year": "4th",
  "branch": "CSE",
  "role": "treasurer"
}
```

### Sample Members:
```json
[
  {
    "name": "Alice Member",
    "usn": "1AB21CS001",
    "email": "alice@example.com",
    "password": "member123",
    "year": "1st",
    "branch": "CSE",
    "role": "member"
  },
  {
    "name": "Bob Student",
    "usn": "1AB21EC002",
    "email": "bob@example.com",
    "password": "member123",
    "year": "2nd",
    "branch": "ECE",
    "role": "member"
  },
  {
    "name": "Charlie Kumar",
    "usn": "1AB21ME003",
    "email": "charlie@example.com",
    "password": "member123",
    "year": "3rd",
    "branch": "MECH",
    "role": "member"
  }
]
```

## 🐛 Common Issues & Fixes

### Issue 1: "Failed to load members"
**Cause:** Backend not running or wrong API URL  
**Fix:** 
- Check backend is running on port 5000
- Verify `VITE_API_URL` in `client/.env`
- Check browser console for actual error

### Issue 2: Statistics show all zeros
**Cause:** No payment data in database  
**Fix:** Create payment records for members

### Issue 3: Search not filtering
**Cause:** Typing too fast (within debounce time)  
**Fix:** Wait 500ms after typing, results will appear

### Issue 4: Members not grouped correctly
**Cause:** Year field format mismatch  
**Fix:** Ensure year is stored as "1st", "2nd", "3rd", or "4th" (not "first", "1", etc.)

### Issue 5: Export button not working
**Cause:** Browser blocking downloads  
**Fix:** Check browser settings, allow downloads from localhost

### Issue 6: Modal not closing
**Cause:** JavaScript error in modal  
**Fix:** Check browser console, refresh page

### Issue 7: Images not loading
**Cause:** Cloudinary URLs expired or invalid  
**Fix:** Use default avatar (handled automatically)

## 🎯 Performance Benchmarks

Expected performance metrics:

| Action | Expected Time | Acceptable Range |
|--------|--------------|------------------|
| Initial load | < 1s | < 2s |
| Filter change | < 300ms | < 500ms |
| Search results | < 500ms | < 800ms |
| Open modal | < 200ms | < 400ms |
| Export CSV | < 500ms | < 1s |

## 📝 Testing Checklist

Print this and check off as you test:

### Backend API
- [ ] GET /api/treasurer/members (no filters)
- [ ] GET /api/treasurer/members?year=1st
- [ ] GET /api/treasurer/members?status=failed
- [ ] GET /api/treasurer/members?search=alice
- [ ] GET /api/treasurer/member/:userId/payments
- [ ] GET /api/treasurer/statistics
- [ ] GET /api/treasurer/failed-payments-summary
- [ ] Authorization: Non-treasurer gets 403
- [ ] Authorization: No token gets 401

### Frontend Features
- [ ] Dashboard loads successfully
- [ ] Statistics cards display correctly
- [ ] All year tabs work
- [ ] All status chips work
- [ ] Search bar filters results
- [ ] Member cards display data
- [ ] Click member opens modal
- [ ] Modal shows payment history
- [ ] Failed payments button works
- [ ] Failed payments modal displays
- [ ] Export downloads CSV file
- [ ] Reset filters button works
- [ ] Logout button works

### UI/UX
- [ ] Loading states show
- [ ] Empty states show
- [ ] Error toasts appear
- [ ] Smooth transitions
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] No UI glitches
- [ ] All buttons clickable
- [ ] All text readable

### Edge Cases
- [ ] No members (empty state)
- [ ] No payments for member
- [ ] Network error handling
- [ ] Invalid search query
- [ ] Large dataset (100+ members)
- [ ] Special characters in names
- [ ] Long names/USNs

## 🎉 Success Criteria

The feature is working correctly if:

1. ✅ All API endpoints return correct data
2. ✅ Dashboard loads within 2 seconds
3. ✅ All filters work as expected
4. ✅ Search returns accurate results
5. ✅ Member details modal displays complete information
6. ✅ Failed payments summary shows all failed payments
7. ✅ Export creates valid CSV file
8. ✅ No console errors
9. ✅ Responsive on all device sizes
10. ✅ Authorization works correctly

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the main README: `TREASURER_DASHBOARD_README.md`
2. Review error logs in browser console
3. Check server logs in terminal
4. Verify database connection
5. Ensure all dependencies are installed

## 🚀 Next Steps

After successful testing:

1. **Deploy to production**
   - Update environment variables
   - Set up production database
   - Configure CORS for production domain

2. **Add more features**
   - Payment verification
   - Bulk operations
   - Email notifications
   - Advanced analytics

3. **Optimize performance**
   - Add pagination for large datasets
   - Implement caching
   - Optimize database queries

4. **Enhance security**
   - Add rate limiting
   - Implement audit logs
   - Add two-factor authentication

---

**Happy Testing! 🎉**

For detailed documentation, see `TREASURER_DASHBOARD_README.md`
