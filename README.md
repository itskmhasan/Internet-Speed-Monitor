# Internet Speed Monitor Web Application

A comprehensive web application for continuous internet speed monitoring with real-time display, data logging, visualization, and reporting capabilities.

## 🚀 Live Demo

**Production URL**: [https://hutjiqmk.manus.space](https://hutjiqmk.manus.space)

## ✨ Features

### Core Features
- **Continuous Speed Testing**: Automatic testing every 5 seconds (configurable)
- **Real-time Display**: Live updates of download/upload speeds and ping
- **Data Logging**: Comprehensive table with pagination, sorting, and filtering
- **Report Generation**: Export data as CSV or PDF with date range filtering

### Advanced Features
- **Data Visualization**: Interactive charts for speed and ping over time
- **Performance Analytics**: Statistics summary with max/min/average values
- **Flexible Testing**: Manual single tests and customizable intervals
- **Data Persistence**: Browser localStorage for data retention
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technical Stack

- **Frontend**: React 18 with Vite
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icons
- **Speed Testing**: Custom XMLHttpRequest-based implementation
- **Data Storage**: Browser localStorage
- **Export**: Client-side CSV and PDF generation

## 📊 Speed Test Implementation

The application uses a custom speed test engine that:

- **Download Test**: Downloads test files and measures transfer rates
- **Upload Test**: Uploads data and calculates upload speeds
- **Ping Test**: Measures round-trip latency
- **Multiple Endpoints**: Uses fallback URLs for reliability
- **Accurate Timing**: Precise measurement using performance APIs

## 🎯 Usage Instructions

### Getting Started
1. Visit the application URL
2. Click "Run Single Test" for a one-time test
3. Click "Start Testing" for continuous monitoring
4. Use "Stop Testing" to pause continuous monitoring

### Customization
- **Test Interval**: Choose from 1, 5, 10, 30, or 60 seconds
- **Chart Type**: Switch between line charts and area charts
- **Time Range**: Filter data by hour, day, week, or month

### Data Management
- **View History**: Browse all test results in the data table
- **Search & Filter**: Find specific tests using search and date filters
- **Sort Data**: Click column headers to sort by any field
- **Clear History**: Remove all stored data with one click

### Export Options
- **CSV Export**: Raw data for analysis in Excel/Google Sheets
- **PDF Export**: Formatted report with statistics and charts
- **Date Filtering**: Export specific time ranges

## 📈 Data Visualization

### Speed Charts
- Line and area chart options
- Separate visualization for download/upload speeds
- Time-based filtering (hour, day, week, month)
- Interactive tooltips with detailed information

### Ping Charts
- Dedicated latency visualization
- Historical ping trends
- Performance correlation analysis

### Statistics Dashboard
- Real-time performance metrics
- Maximum/minimum/average calculations
- Total test count tracking
- Performance trend indicators

## 💾 Data Storage

- **Local Storage**: Data persists across browser sessions
- **JSON Format**: Structured data with timestamps
- **Automatic Cleanup**: Optional data management features
- **Export Backup**: CSV/PDF exports for data backup

## 🎨 User Interface

### Design Principles
- **Clean & Modern**: Professional dashboard design
- **Responsive Layout**: Adapts to all screen sizes
- **Intuitive Controls**: Clear labeling and logical flow
- **Real-time Feedback**: Immediate visual updates

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Semantic HTML structure
- **Color Contrast**: WCAG compliant color schemes
- **Mobile Optimized**: Touch-friendly interface

## 🔧 Development

### Local Development
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
cd speed-monitor
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

### Project Structure
```
speed-monitor/
├── src/
│   ├── components/          # React components
│   │   ├── Charts.jsx      # Data visualization
│   │   ├── DataTable.jsx   # Enhanced data table
│   │   └── ExportPanel.jsx # Export functionality
│   ├── hooks/              # Custom React hooks
│   │   └── useSpeedTest.js # Speed test logic
│   ├── utils/              # Utility functions
│   │   ├── speedTest.js    # Speed test engine
│   │   └── dataExport.js   # Export utilities
│   └── App.jsx             # Main application
├── public/                 # Static assets
└── dist/                   # Production build
```

## 📋 Performance Ratings

The application automatically categorizes speed test results:

- **Excellent**: ≥100 Mbps download speed
- **Good**: 50-99 Mbps download speed  
- **Fair**: 25-49 Mbps download speed
- **Poor**: <25 Mbps download speed

## 🔒 Privacy & Security

- **No Server Storage**: All data stored locally in browser
- **No Personal Data**: Only speed test metrics collected
- **HTTPS Deployment**: Secure connection for all requests
- **Client-side Processing**: All calculations done in browser

## 🚀 Deployment

The application is deployed using modern web hosting with:

- **CDN Distribution**: Fast global content delivery
- **HTTPS Encryption**: Secure connections
- **Automatic Updates**: Seamless deployment pipeline
- **High Availability**: Reliable uptime and performance

## 📞 Support

For questions, issues, or feature requests:

1. Check the application\'s built-in help text
2. Review this documentation
3. Test the live demo for reference behavior

## 📄 License

This project is built for demonstration and educational purposes.

---

**Built with ❤️ using React, Vite, and modern web technologies**

