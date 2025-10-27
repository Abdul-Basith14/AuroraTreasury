# Quick Fix: Club Settings Not Configured

## Problem
Login fails with error: "Club settings not configured. Please contact administrator."

## Solution
You need to create ClubSettings in your database. Here are **3 quick ways** to fix it:

---

## Option 1: Using MongoDB Compass (Easiest) ✅

1. Open **MongoDB Compass**
2. Connect to `mongodb://localhost:27017`
3. Select database: `aurora-treasury`
4. Create a new collection named: `clubsettings`
5. Click "Insert Document" and paste:

```json
{
  "auroraCode": "AURORA2024",
  "clubName": "Aurora Treasury",
  "isActive": true,
  "createdAt": {
    "$date": "2024-11-27T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2024-11-27T00:00:00.000Z"
  }
}
```

6. Click "Insert"
7. **Done!** Try logging in with Aurora Code: `AURORA2024`

---

## Option 2: Using MongoDB Shell

1. Open terminal and run:
```bash
mongosh
```

2. Connect to database:
```javascript
use aurora-treasury
```

3. Insert club settings:
```javascript
db.clubsettings.insertOne({
  auroraCode: "AURORA2024",
  clubName: "Aurora Treasury",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

4. Verify:
```javascript
db.clubsettings.find().pretty()
```

5. **Done!** Try logging in with Aurora Code: `AURORA2024`

---

## Option 3: Quick API Call (Using Postman/Thunder Client)

Since you need ClubSettings to login, temporarily bypass it:

1. **Temporarily comment out the Aurora Code check in login**:

Open `server/controllers/authController.js` and comment out lines 133-148:

```javascript
// TEMPORARY - Remove after adding ClubSettings
/*
// Verify Aurora Code from ClubSettings
const clubSettings = await ClubSettings.findOne({ isActive: true });

if (!clubSettings) {
  return res.status(500).json({
    success: false,
    message: 'Club settings not configured. Please contact administrator.',
  });
}

if (clubSettings.auroraCode !== auroraCode.toUpperCase().trim()) {
  return res.status(401).json({
    success: false,
    message: 'Invalid Aurora Code. Please check and try again.',
  });
}
*/
```

2. **Login as treasurer**
3. **Use any Aurora Code** (it won't be checked)
4. **Once logged in, create ClubSettings using one of the options above**
5. **Uncomment the code back**

---

## Verification

After adding ClubSettings, test login with:
- **Email**: Your treasurer email
- **Password**: Your password
- **Aurora Code**: `AURORA2024`

---

## Changing Aurora Code Later

If you want to change the Aurora Code:

**Using MongoDB Compass**:
1. Open `clubsettings` collection
2. Edit the document
3. Change `auroraCode` field
4. Save

**Using MongoDB Shell**:
```javascript
use aurora-treasury
db.clubsettings.updateOne(
  {},
  { $set: { auroraCode: "NEWCODE2024" } }
)
```

---

## What is Aurora Code?

The Aurora Code is a **club-wide password** that all members must know to login. It's an additional security layer to ensure only club members can access the system.

**Security Tip**: Change it periodically and share only with active members!

---

## Quick Reference

**Default Aurora Code**: `AURORA2024`  
**Database**: `aurora-treasury`  
**Collection**: `clubsettings`  
**Required Fields**: `auroraCode`, `isActive`

---

**Choose any option above and you'll be able to login! Option 1 (MongoDB Compass) is the easiest.** ✅
