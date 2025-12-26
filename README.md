# 📊 Sales Analyzer LITE

> **Simple & Fast** - Sales analytics for retail managers

A simplified version of Sales Analyzer PRO, designed specifically for store managers and area managers who need quick insights without complexity.

---

## 🎯 **What Makes it LITE?**

| Feature | PRO Version | LITE Version |
|---------|------------|--------------|
| **Views** | 4+ complex views | 3 simple views |
| **Ranking Modes** | 5 modes | 1 automatic mode |
| **Metrics** | 17+ columns | 8 essential columns |
| **Filters** | 15+ advanced | 3 simple filters |
| **Rating System** | Multiple scores | Single A/B/C/D rating |
| **Learning Curve** | 2+ hours | 5 minutes |

**Result:** Get insights in **seconds**, not hours!

---

## ✨ **Features**

### 📊 **Dashboard View**
- **Top 3 Performers** - See who's crushing it
- **Needs Attention** - Identify who needs help
- **Team Metrics** - Sales, trend, avg ticket, UPT
- **Quick Actions** - Export, view all employees

### 👥 **Team Ranking View**
- **Simple Table** - 8 columns, all essentials
- **A/B/C/D Ratings** - Easy to understand
- **Filters** - Search, shop, employee type
- **Click for Details** - Instant drill-down

### 🔍 **Employee Detail View**
- **Key Metrics** - Sales, ticket, UPT with vs team %
- **HR Integration** - Contract type, experience, hire date
- **Manager Actions** - Actionable suggestions based on performance
- **Export** - Individual employee report

---

## 🚀 **Quick Start**

### **1. Open the App**
```
Simply open index.html in your browser!
```

### **2. See Your Data**
- **Dashboard loads automatically** with overview
- **Top performers** and **needs attention** shown first
- **Team metrics** at a glance

### **3. Explore Team**
- Click **"Team Ranking"** tab
- Filter by shop, type, or search
- Click any employee for details

### **4. Take Action**
- Export data for payroll
- Follow suggested manager actions
- Track improvement over time

---

## 📱 **Mobile-Friendly**

Works perfectly on:
- ✅ Desktop browsers
- ✅ Tablets (iPad, Android)
- ✅ Smartphones (landscape mode recommended)

---

## 🔧 **Setup & Configuration**

### **Connecting to Real Data**

#### **Option 1: BestStore API (Automatic)**
The app is pre-configured to use BestStore API:

```javascript
// In assets/scripts/api-client.js
const API_CONFIG = {
    BESTSTORE_BASE: 'https://www.beststoreaziende.it/BSMWebService/api',
    EMPLOYEES_ENDPOINT: '/Movimenti/GetVenditeOperatore',
    DEFAULT_PARAMS: {
        gruppo: 'VBP',  // Change to your group code
        da: '01/01/2025',  // Start date
        a: '31/01/2025'    // End date
    }
};
```

#### **Option 2: HR Integration**
Add HR data for enhanced features:

1. Create `hr-data.csv` in root folder:
```csv
employee,data_assunzione,ore_settimanali,tipo_contratto
SABRINA GRANDONI,15/03/2023,40,Full-time
ANNA GRANDONI,10/05/2022,40,Full-time
MARCO ROBERTI,20/09/2024,20,Part-time
```

2. The app will automatically load it on startup

### **Customization**

#### **Change Date Range**
Edit `assets/scripts/app.js`:
```javascript
const startDate = '01/01/2025';
const endDate = '31/01/2025';
await fetchSalesData(startDate, endDate);
```

#### **Adjust Rating Thresholds**
Edit `assets/scripts/api-client.js` in `calculateRating()`:
```javascript
if (score >= 75) rating = 'A';    // Default: 75
else if (score >= 55) rating = 'B';  // Default: 55
else if (score >= 40) rating = 'C';  // Default: 40
else rating = 'D';
```

#### **Change Color Scheme**
Edit `assets/styles/main.css`:
```css
:root {
    --primary: #3498db;  /* Change to your brand color */
    --success: #27ae60;
    --warning: #f39c12;
    --danger: #e74c3c;
}
```

---

## 📖 **User Guide**

### **Understanding Ratings**

| Rating | Score | Meaning | Icon |
|--------|-------|---------|------|
| **A** | 75-100 | Top Performer | ⭐⭐⭐ |
| **B** | 55-74 | Strong | ⭐⭐ |
| **C** | 40-54 | Needs Help | ⭐ |
| **D** | 0-39 | Critical | ☆ |

**Rating Formula:**
- 40% Sales vs team average
- 30% Growth trend
- 15% Avg ticket vs team
- 15% Items per sale (UPT) vs team

### **Employee Status**

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ **Excellent** | A rating, on track | Reward, recognize |
| 📈 **Improving** | B rating, positive growth | Encourage |
| ✅ **Strong** | B rating, stable | Maintain |
| ⚠️ **Needs Help** | C rating | Coach, train |
| 🔴 **Critical** | D rating | Immediate action |

### **Experience Levels**

| Level | Tenure | Badge |
|-------|--------|-------|
| New Hire | 0-3 months | 🌱 |
| Junior | 3-12 months | 📚 |
| Established | 1-2 years | 💼 |
| Specialist | 2-4 years | ⭐ |
| Senior | 4-7 years | 🏆 |
| Expert | 7+ years | 👑 |

---

## 🎯 **Workflows**

### **Weekly Performance Review**
1. Open Dashboard
2. Check **Top Performers** - Recognize them!
3. Check **Needs Attention** - Schedule 1-on-1s
4. Review **Team Trend** - Is team improving?

### **Monthly Team Analysis**
1. Go to **Team Ranking**
2. Export data: **"Export for Payroll"**
3. Filter by shop to compare locations
4. Identify training needs

### **Employee Check-in**
1. Go to **Team Ranking**
2. Click employee name
3. Review **Key Metrics** vs team
4. Follow **Manager Actions** suggestions
5. Export individual report

---

## 💡 **Tips & Best Practices**

### **For Store Managers**
- ✅ **Review dashboard weekly** - Stay on top of performance
- ✅ **Act on "Needs Attention"** - Don't wait for issues to worsen
- ✅ **Recognize top performers** - Boost morale
- ✅ **Use filters** - Compare apples to apples (full-time vs full-time)

### **For Area Managers**
- ✅ **Compare shops** - Use shop filter
- ✅ **Track trends** - Are stores improving?
- ✅ **Identify best practices** - Learn from top performers
- ✅ **Export for reports** - Share with leadership

### **For HR**
- ✅ **Track new hires** - Filter by experience level
- ✅ **Monitor part-time** - Ensure fair evaluation
- ✅ **Performance data** - Export for reviews
- ✅ **Succession planning** - Identify future leaders

---

## 🆘 **Troubleshooting**

### **No data showing?**
1. Check date range in `app.js`
2. Verify API connection (check browser console F12)
3. Ensure `gruppo` parameter matches your account

### **Ratings seem wrong?**
1. Check if HR data is loaded (affects fairness adjustments)
2. Verify rating thresholds in `api-client.js`
3. Ensure sufficient data (at least 3 periods for growth)

### **Filter not working?**
1. Clear browser cache (Ctrl+F5)
2. Check console for errors (F12)
3. Verify employee names match exactly

### **Export not downloading?**
1. Check browser popup blocker
2. Try different browser (Chrome, Firefox, Edge)
3. Ensure JavaScript is enabled

---

## 📂 **File Structure**

```
sales-app-lite/
├── index.html                    # Main entry point
├── README.md                     # This file
├── assets/
│   ├── styles/
│   │   └── main.css             # All styles (mobile-first)
│   └── scripts/
│       ├── api-client.js        # API calls & calculations
│       ├── utils.js             # Helper functions
│       └── app.js               # Main controller
└── components/
    ├── dashboard.js             # Dashboard view (Vista 1)
    ├── ranking-table.js         # Ranking table (Vista 2)
    └── employee-detail.js       # Detail modal (Vista 3)
```

---

## 🔄 **Updating from PRO Version**

If you're coming from Sales Analyzer PRO:

| PRO Feature | LITE Equivalent |
|-------------|----------------|
| Multiple ranking modes | Single auto mode |
| 17+ table columns | 8 essential columns |
| Composite Score | A/B/C/D Rating |
| Advanced filters | 3 simple filters |
| Period comparison view | Single period |
| Complex charts | Simple metrics |

**Migration:** LITE uses same API, so data is compatible!

---

## 🚧 **Roadmap**

Planned features:
- [ ] Multi-period comparison (simple trend chart)
- [ ] PDF export for manager reports
- [ ] Mobile app (PWA)
- [ ] Push notifications for alerts
- [ ] Integration with payroll systems

---

## 📞 **Support**

Need help? Contact:
- **Technical Issues:** IT Department
- **Data Questions:** Sales Operations
- **Feature Requests:** Product Manager

---

## 📄 **License**

© 2025 - Internal use only

---

## 🙏 **Credits**

Built with ❤️ using:
- Vanilla JavaScript (no frameworks!)
- BestStore API
- Claude Code assistance

**Version:** 1.0.0
**Last Updated:** 2025-12-24

---

## 🎓 **For Developers**

Want to extend or modify?

### **Adding a New Metric**
1. Add calculation in `processEmployeeData()` in `app.js`
2. Add column to table in `ranking-table.js`
3. Update `renderEmployeeDetail()` in `employee-detail.js`

### **Changing API Endpoint**
1. Edit `API_CONFIG` in `assets/scripts/api-client.js`
2. Update `fetchSalesData()` function
3. Adjust data parsing in `processEmployeeData()`

### **Testing**
1. Open `index.html` in browser
2. Open DevTools (F12)
3. Check Console for logs
4. Use mock data in `generateMockData()`

### **Deployment**
1. Copy entire folder to web server
2. No build step required!
3. Works on any static host (Netlify, GitHub Pages, etc.)

---

**Happy Analyzing! 📊🚀**
