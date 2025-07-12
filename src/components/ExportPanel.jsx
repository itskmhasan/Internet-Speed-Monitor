import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import DataExporter from '../utils/dataExport.js'

const ExportPanel = ({ data = [] }) => {
  const [dateRange, setDateRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)
  const [exporter] = useState(new DataExporter())

  // Get export preview info
  const exportInfo = exporter.getExportSummary(data, dateRange)

  // Handle CSV export
  const handleCSVExport = async () => {
    if (data.length === 0) {
      setExportStatus({ type: 'error', message: 'No data available to export' })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const filename = `speed-test-results-${dateRange}-${new Date().toISOString().split('T')[0]}`
      exporter.downloadCSV(data, { dateRange, filename })
      
      setExportStatus({ 
        type: 'success', 
        message: `CSV exported successfully (${exportInfo.totalRecords} records)` 
      })
    } catch (error) {
      setExportStatus({ 
        type: 'error', 
        message: `Export failed: ${error.message}` 
      })
    } finally {
      setIsExporting(false)
      // Clear status after 3 seconds
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  // Handle PDF export
  const handlePDFExport = async () => {
    if (data.length === 0) {
      setExportStatus({ type: 'error', message: 'No data available to export' })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const filename = `speed-test-report-${dateRange}-${new Date().toISOString().split('T')[0]}`
      exporter.downloadPDF(data, { dateRange, filename })
      
      setExportStatus({ 
        type: 'success', 
        message: `PDF report opened for printing (${exportInfo.totalRecords} records)` 
      })
    } catch (error) {
      setExportStatus({ 
        type: 'error', 
        message: `Export failed: ${error.message}` 
      })
    } finally {
      setIsExporting(false)
      // Clear status after 3 seconds
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  // Get date range label
  const getDateRangeLabel = (range) => {
    switch (range) {
      case 'all': return 'All Time'
      case 'today': return 'Today'
      case 'hour': return 'Last Hour'
      case 'day': return 'Last 24 Hours'
      case 'week': return 'Last Week'
      case 'month': return 'Last Month'
      default: return 'All Time'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Data</span>
        </CardTitle>
        <CardDescription>
          Export your speed test results as CSV or PDF reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="hour">Last hour</SelectItem>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Preview */}
        {data.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Export Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Records:</span>
                <Badge variant="outline" className="ml-2">
                  {exportInfo.totalRecords}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Range:</span>
                <span className="ml-2">{getDateRangeLabel(dateRange)}</span>
              </div>
              {exportInfo.totalRecords > 0 && (
                <>
                  <div>
                    <span className="text-muted-foreground">Avg Download:</span>
                    <span className="ml-2 font-mono">{exportInfo.avgDownload.toFixed(1)} Mbps</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Upload:</span>
                    <span className="ml-2 font-mono">{exportInfo.avgUpload.toFixed(1)} Mbps</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={handleCSVExport}
            disabled={isExporting || data.length === 0}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>

          <Button
            onClick={handlePDFExport}
            disabled={isExporting || data.length === 0}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>

        {/* Export Status */}
        {exportStatus && (
          <Alert variant={exportStatus.type === 'error' ? 'destructive' : 'default'}>
            {exportStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{exportStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* No Data Message */}
        {data.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No test results available. Run some speed tests to enable data export.
            </AlertDescription>
          </Alert>
        )}

        {/* Export Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>CSV Export:</strong> Raw data in spreadsheet format, suitable for analysis in Excel or Google Sheets.</p>
          <p><strong>PDF Export:</strong> Formatted report with statistics and data table, suitable for sharing or printing.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExportPanel

