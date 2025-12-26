# 🚀 START HERE - Sales Analyzer LITE

## ⚡ Quick Start (30 seconds)

1. **Open `index.html` in your browser**
   - Double-click the file, OR
   - Right-click → Open with → Chrome/Firefox/Edge

2. **You'll see mock data immediately!**
   - Dashboard with top/bottom performers
   - Team metrics
   - Sample employee data

3. **Explore the 3 views:**
   - 📊 **Dashboard** - Quick overview
   - 👥 **Team Ranking** - Full employee list
   - 🔍 **Employee Detail** - Click any name for details

---

## 🔌 Next Steps: Connect Real Data

### Option A: Use BestStore API (Recommended)

Edit `assets/scripts/app.js`, line ~85, replace `generateMockData()` with:

```javascript
// Replace this:
const mockData = generateMockData();

// With this:
const mockData = await fetchSalesData('01/01/2025', '31/01/2025');
```

### Option B: Add HR Data (Optional but Recommended)

Create `hr-data.csv` in this folder:

```csv
employee,data_assunzione,ore_settimanali
SABRINA GRANDONI,15/03/2023,40
ANNA GRANDONI,10/05/2022,40
MARCO ROBERTI,20/09/2024,20
CRISTINA LUCARELLI,15/01/2024,40
MARINA GABRIELLI,01/11/2024,20
```

Refresh page - HR data will auto-load!

---

## 📁 File Structure

```
sales-app-lite/
├── index.html          ← OPEN THIS FILE
├── START-HERE.md       ← You are here
├── README.md           ← Full documentation
├── assets/
│   ├── styles/
│   │   └── main.css
│   └── scripts/
│       ├── api-client.js
│       ├── utils.js
│       └── app.js
└── components/
    ├── dashboard.js
    ├── ranking-table.js
    └── employee-detail.js
```

---

## 🎯 Key Features

### ✅ **What's Included**
- 3 simple views (Dashboard, Ranking, Detail)
- A/B/C/D rating system (auto-calculated)
- Mobile-friendly design
- Export to CSV
- HR integration (tenure, contract type)
- Real-time filtering and sorting

### ❌ **What's NOT Included** (vs PRO)
- No complex ranking modes (auto mode only)
- No advanced filters (just 3 simple ones)
- No multi-period charts (single period)
- No statistical metrics (CV, percentiles, etc.)

**Trade-off:** Simplicity & Speed! ⚡

---

## 🛠️ Customization

### Change Colors
Edit `assets/styles/main.css` lines 8-15:
```css
--primary: #3498db;   /* Change to your brand color */
```

### Adjust Ratings
Edit `assets/scripts/api-client.js` line ~125:
```javascript
if (score >= 75) rating = 'A';  // Adjust thresholds
```

### Change Date Range
Edit `assets/scripts/app.js` line ~85

---

## 📖 Need More Help?

- **Quick Guide:** See `README.md` sections:
  - 🎯 What Makes it LITE?
  - 📖 User Guide
  - 💡 Tips & Best Practices

- **Troubleshooting:** See `README.md` → 🆘 Troubleshooting

- **Technical Details:** See `README.md` → 🎓 For Developers

---

## 🎓 Learning Path

**5 minutes:** Open app, explore dashboard
**15 minutes:** Read README sections 1-3
**30 minutes:** Connect real data, customize
**1 hour:** Master all features, train team

vs PRO version learning time: **2+ hours**

---

## 💡 Pro Tips

1. **Use on tablet** - Perfect for manager floor walks
2. **Export weekly** - Track progress over time
3. **Share with team** - Everyone can access (no login!)
4. **Print employee details** - For 1-on-1 reviews

---

## 🚀 You're Ready!

Open `index.html` now and start exploring! 🎯

Questions? Check `README.md` for full documentation.

**Happy Analyzing!** 📊
