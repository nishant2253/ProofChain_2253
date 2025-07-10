# Fix REACT_APP_MERKLE_PROOF in frontend/.env

## 🚨 **Current Issue**
The console shows your raw value is still:
```
["0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9"],["0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0"]
```

This means you haven't updated your `frontend/.env` file yet.

## 🔧 **Step-by-Step Fix**

### Step 1: Open frontend/.env
```bash
cd frontend
nano .env
# or
code .env
# or use any text editor
```

### Step 2: Find This Line
Look for:
```bash
REACT_APP_MERKLE_PROOF="["0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9"],["0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0"]"
```

### Step 3: Replace With This EXACT Line
```bash
REACT_APP_MERKLE_PROOF=["0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9","0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0"]
```

### Step 4: Save and Restart
1. **Save the file** (Ctrl+S)
2. **Stop frontend** (Ctrl+C in terminal)
3. **Restart frontend** (`npm start`)

## ✅ **What Should Change**

**Before (in console):**
```
Raw value: ["0xe970..."],["0x0031..."]
Failed to parse REACT_APP_MERKLE_PROOF: SyntaxError...
Using empty merkle proof as fallback
```

**After (in console):**
```
Raw REACT_APP_MERKLE_PROOF: ["0xe970...","0x0031..."]
Successfully parsed merkle proof: ["0xe970...","0x0031..."]
```

## 🎯 **Key Differences**

❌ **Wrong (what you have now):**
```bash
REACT_APP_MERKLE_PROOF="["0xe970..."],["0x0031..."]"
```

✅ **Correct (what you need):**
```bash
REACT_APP_MERKLE_PROOF=["0xe970...","0x0031..."]
```

**The fix removes:**
1. Outer quotes around the entire value
2. The `],[` between arrays (combines into one array)

**Please update your frontend/.env file and restart the frontend!**