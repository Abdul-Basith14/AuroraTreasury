# 🖼️ Cloudinary Setup Guide for AuroraTreasury

## Why Cloudinary?
Cloudinary is used to store:
- Payment proof screenshots (from members)
- Bill proof photos/PDFs (from reimbursement requests)
- Treasurer payment proof photos

## 🆓 Free Account (Recommended)

Cloudinary offers a **FREE tier** with:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth per month
- ✅ More than enough for a college club!

---

## 📝 Step-by-Step Setup

### Step 1: Create Account
1. Visit: https://cloudinary.com/users/register/free
2. Sign up with your email
3. Verify your email

### Step 2: Get Credentials
After login, you'll see your **Dashboard** with:

```
Account Details:
├── Cloud Name: dxxxxx123
├── API Key: 123456789012345
└── API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 3: Update .env File
Open `server/.env` and update these lines:

```env
# Cloudinary Configuration (Image Upload)
CLOUDINARY_CLOUD_NAME=dxxxxx123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 4: Restart Server
```bash
cd server
npm run dev
```

You should see:
```
✅ Cloudinary configured successfully
```

---

## 🧪 Test Upload

### Test 1: Upload Payment Proof
1. Login as member
2. Click "Pay Group Fund"
3. Upload a screenshot
4. Submit

### Test 2: Upload Reimbursement Bill
1. Go to "Reimbursement Requests"
2. Click "New Request"
3. Upload a bill photo
4. Submit

If successful, you'll see the uploaded file URL in MongoDB!

---

## 🔍 Where Files Are Stored

Your uploads will be organized in Cloudinary folders:

```
aurora-treasury/
├── payment-proofs/          (Group fund payments)
└── reimbursement-bills/     (Reimbursement bills)
```

You can view/manage them at:
https://cloudinary.com/console/media_library

---

## ❌ Common Errors

### Error 1: "Unknown API key"
**Problem**: API key is invalid or placeholder
**Solution**: Copy-paste correct API key from Cloudinary dashboard

### Error 2: "Invalid cloud name"
**Problem**: Cloud name is wrong
**Solution**: Copy exact cloud name (usually starts with 'd')

### Error 3: "API Secret mismatch"
**Problem**: API secret is wrong
**Solution**: Copy full secret from dashboard (case-sensitive!)

---

## 🔒 Security Tips

1. ✅ Never commit `.env` file to Git (it's already in .gitignore)
2. ✅ Keep API Secret private
3. ✅ Don't share credentials publicly
4. ✅ Use environment variables in production

---

## 🎯 Quick Verification

After setup, test if Cloudinary works:

```javascript
// Run this in your terminal inside server folder:
node -e "
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Config:', cloudinary.config());
"
```

Should show your actual credentials (not 'your_api_key').

---

## 📸 Screenshot of Cloudinary Dashboard

After login, you'll see a page like this:

```
┌─────────────────────────────────────────────┐
│  Cloudinary Dashboard                       │
├─────────────────────────────────────────────┤
│  Cloud Name: dxxxxx123                      │
│  API Key:    123456789012345                │
│  API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz     │
│  [Show/Hide] [Copy]                         │
└─────────────────────────────────────────────┘
```

Just click **[Copy]** next to each field and paste into `.env`!

---

## ✅ After Setup

Once configured correctly:
1. Server will start without "Unknown API key" error
2. File uploads will work
3. Images will be accessible via Cloudinary URLs
4. You can view/delete images in Cloudinary console

---

**Need Help?**
- Cloudinary Docs: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com/
