# Quick Test for Reimbursement Route

## Method 1: Browser (GET route test)
Open browser and visit:
```
http://localhost:5000/api/reimbursement/my-requests
```

You should see either:
- Success response (if authenticated)
- 401 Unauthorized (if not authenticated) ✅ This is GOOD - it means route exists!
- NOT 404 (if you get 404, server not restarted)

## Method 2: Check Server Logs
After restarting server with `npm run dev`, you should see:
```
- POST   http://localhost:5000/api/reimbursement/request
- GET    http://localhost:5000/api/reimbursement/my-requests
- POST   http://localhost:5000/api/reimbursement/confirm-receipt/:id
- DELETE http://localhost:5000/api/reimbursement/request/:id
```

If you DON'T see these lines, there's an import error.

## Method 3: Check for Import Errors
When you restart, look for errors like:
```
Error: Cannot find module './routes/reimbursement.js'
```

If you see this, the file path is wrong or file doesn't exist.

## Method 4: Test with Console
In frontend console, after server restart:
```javascript
fetch('http://localhost:5000/api/reimbursement/my-requests', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
```

Expected: JSON response (not 404)
