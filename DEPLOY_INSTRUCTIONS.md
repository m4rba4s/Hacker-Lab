# 🚀 RET Academy - Manual Deployment Instructions

## 🚨 TERMINAL ISSUE DETECTED
Your PowerShell has an encoding issue that adds "з" prefix to all commands.

## 💻 MANUAL DEPLOYMENT STEPS

### Step 1: Fix Terminal Issue
1. Open **Windows Command Prompt (cmd)** instead of PowerShell
2. Navigate to project: `cd C:\lowlevel_lab`
3. Or use **Git Bash** if you have it installed

### Step 2: Initialize Git Repository
```bash
# In C:\lowlevel_lab directory:
git init
git config user.name "mayhem"  
git config user.email "mayhem@retacademy.dev"
```

### Step 3: Add Files and Commit
```bash
git add .
git commit -m "Initial commit - RET Academy v2.0 Production Release"
git branch -M main
```

### Step 4: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `ret-academy` or `reverse-engineering-platform`
3. Description: "Interactive Assembly & Reverse Engineering Learning Platform"
4. Choose Public or Private
5. **DO NOT** initialize with README (we have our own)
6. Click "Create repository"

### Step 5: Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/ret-academy.git
git push -u origin main
```

### Step 6: Enable GitHub Pages (Optional)
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: "main" / root
5. Save

Your RET Academy will be live at:
`https://YOUR_USERNAME.github.io/ret-academy/`

## 🔧 ALTERNATIVE: Use Git GUI Tools
- **GitHub Desktop**: https://desktop.github.com/
- **GitKraken**: https://www.gitkraken.com/
- **Sourcetree**: https://www.sourcetreeapp.com/

## 📁 IMPORTANT FILES TO INCLUDE
```
✅ index.html              (Main app)
✅ README.md               (Documentation) 
✅ .gitignore              (Git ignore rules)
✅ fallback.js             (Fallback support)
✅ simple_app.js           (Simple version)
✅ assets/                 (All CSS, JS, data)
```

## 🗑️ FILES TO DELETE BEFORE PUSH
```
❌ All test_*.html files
❌ All *_test.html files  
❌ fix_critical.js
❌ FIX_SUMMARY.md
❌ git_push.bat
❌ push_to_github.bat
❌ DEPLOY_INSTRUCTIONS.md (this file)
❌ PRODUCTION_RELEASE.md
❌ cleanup_temp.ps1
❌ remove_one.bat
```

## 🎯 FINAL REPOSITORY STRUCTURE
```
ret-academy/
├── index.html
├── README.md
├── .gitignore
├── fallback.js
├── simple_app.js
└── assets/
    ├── css/
    ├── js/
    └── data/
```

## 🔥 READY TO LAUNCH!
Once pushed, your **RET Academy** will be a professional reverse engineering education platform ready for the world!

---
**Built by mayhem** 💀
