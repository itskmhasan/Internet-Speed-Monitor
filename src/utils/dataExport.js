// Data Export Utilities
// Handles CSV and PDF export functionality

class DataExporter {
  constructor() {
    this.dateFormatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  // Filter data by date range
  filterDataByDateRange(data, dateRange) {
    if (dateRange === 'all' || data.length === 0) {
      return data;
    }

    const now = new Date();
    const filterDate = new Date();

    switch (dateRange) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'hour':
        filterDate.setTime(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        filterDate.setTime(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        filterDate.setTime(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.timestamp) >= filterDate);
  }

  // Generate CSV content
  generateCSV(data, options = {}) {
    const {
      dateRange = 'all',
      includeHeaders = true,
      delimiter = ','
    } = options;

    const filteredData = this.filterDataByDateRange(data, dateRange);
    
    if (filteredData.length === 0) {
      return '';
    }

    let csv = '';

    // Add headers
    if (includeHeaders) {
      csv += [
        'Timestamp',
        'Download Speed (Mbps)',
        'Upload Speed (Mbps)',
        'Ping (ms)',
        'Performance Rating'
      ].join(delimiter) + '\n';
    }

    // Add data rows
    filteredData.forEach(item => {
      const performanceRating = this.getPerformanceRating(item.downloadSpeed);
      const row = [
        `"${this.dateFormatter.format(new Date(item.timestamp))}"`,
        item.downloadSpeed.toFixed(1),
        item.uploadSpeed.toFixed(1),
        item.ping.toFixed(0),
        `"${performanceRating}"`
      ].join(delimiter);
      csv += row + '\n';
    });

    return csv;
  }

  // Get performance rating based on download speed
  getPerformanceRating(downloadSpeed) {
    if (downloadSpeed >= 100) return 'Excellent';
    if (downloadSpeed >= 50) return 'Good';
    if (downloadSpeed >= 25) return 'Fair';
    return 'Poor';
  }

  // Download CSV file
  downloadCSV(data, options = {}) {
    const {
      filename = 'speed-test-results',
      dateRange = 'all'
    } = options;

    const csv = this.generateCSV(data, { dateRange });
    
    if (!csv) {
      throw new Error('No data to export');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Generate statistics summary
  generateStatistics(data) {
    if (data.length === 0) {
      return {
        totalTests: 0,
        avgDownload: 0,
        avgUpload: 0,
        avgPing: 0,
        maxDownload: 0,
        maxUpload: 0,
        minPing: 0,
        dateRange: 'No data'
      };
    }

    const downloads = data.map(t => t.downloadSpeed);
    const uploads = data.map(t => t.uploadSpeed);
    const pings = data.map(t => t.ping);

    const firstTest = new Date(data[data.length - 1].timestamp);
    const lastTest = new Date(data[0].timestamp);

    return {
      totalTests: data.length,
      avgDownload: downloads.reduce((a, b) => a + b, 0) / downloads.length,
      avgUpload: uploads.reduce((a, b) => a + b, 0) / uploads.length,
      avgPing: pings.reduce((a, b) => a + b, 0) / pings.length,
      maxDownload: Math.max(...downloads),
      maxUpload: Math.max(...uploads),
      minPing: Math.min(...pings),
      dateRange: `${this.dateFormatter.format(firstTest)} to ${this.dateFormatter.format(lastTest)}`
    };
  }

  // Generate PDF report (simplified HTML-based approach)
  generatePDFContent(data, options = {}) {
    const {
      dateRange = 'all',
      includeCharts = false
    } = options;

    const filteredData = this.filterDataByDateRange(data, dateRange);
    const stats = this.generateStatistics(filteredData);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Internet Speed Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .performance-excellent { color: #16a34a; }
        .performance-good { color: #2563eb; }
        .performance-fair { color: #d97706; }
        .performance-poor { color: #dc2626; }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Internet Speed Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Data Range: ${stats.dateRange}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${stats.totalTests}</div>
            <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgDownload.toFixed(1)} Mbps</div>
            <div class="stat-label">Avg Download Speed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgUpload.toFixed(1)} Mbps</div>
            <div class="stat-label">Avg Upload Speed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.avgPing.toFixed(0)} ms</div>
            <div class="stat-label">Avg Ping</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.maxDownload.toFixed(1)} Mbps</div>
            <div class="stat-label">Max Download Speed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.minPing.toFixed(0)} ms</div>
            <div class="stat-label">Min Ping</div>
        </div>
    </div>

    <h2>Detailed Test Results</h2>
    <table>
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Download (Mbps)</th>
                <th>Upload (Mbps)</th>
                <th>Ping (ms)</th>
                <th>Performance</th>
            </tr>
        </thead>
        <tbody>
            ${filteredData.map(item => {
              const performance = this.getPerformanceRating(item.downloadSpeed);
              const performanceClass = `performance-${performance.toLowerCase()}`;
              return `
                <tr>
                    <td>${this.dateFormatter.format(new Date(item.timestamp))}</td>
                    <td>${item.downloadSpeed.toFixed(1)}</td>
                    <td>${item.uploadSpeed.toFixed(1)}</td>
                    <td>${item.ping.toFixed(0)}</td>
                    <td class="${performanceClass}">${performance}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Report generated by Internet Speed Monitor</p>
    </div>
</body>
</html>`;

    return html;
  }

  // Download PDF report (opens in new window for printing)
  downloadPDF(data, options = {}) {
    const {
      filename = 'speed-test-report',
      dateRange = 'all'
    } = options;

    const filteredData = this.filterDataByDateRange(data, { dateRange });
    
    if (filteredData.length === 0) {
      throw new Error('No data to export');
    }

    const htmlContent = this.generatePDFContent(filteredData, options);
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  // Get export summary
  getExportSummary(data, dateRange = 'all') {
    const filteredData = this.filterDataByDateRange(data, dateRange);
    const stats = this.generateStatistics(filteredData);
    
    return {
      totalRecords: filteredData.length,
      dateRange: stats.dateRange,
      avgDownload: stats.avgDownload,
      avgUpload: stats.avgUpload,
      avgPing: stats.avgPing
    };
  }
}

export default DataExporter;

