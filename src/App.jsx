import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Play, Pause, Settings, Download, Upload, Wifi, Trash2, BarChart3 } from 'lucide-react'
import useSpeedTest from './hooks/useSpeedTest.js'
import DataTable from './components/DataTable.jsx'
import Charts from './components/Charts.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import './App.css'

function App() {
  const {
    isRunning,
    currentTest,
    testHistory,
    interval,
    statistics,
    toggleTesting,
    runSingleTest,
    clearHistory,
    setInterval
  } = useSpeedTest();

  const getStatusColor = (status) => {
    switch (status) {
      case 'testing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'testing': return 'Testing...';
      case 'completed': return 'Last test';
      case 'error': return 'Test failed';
      default: return 'Ready';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wifi className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Internet Speed Monitor</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
            {currentTest.status === 'testing' && (
              <div className={`w-3 h-3 rounded-full ${getStatusColor(currentTest.status)} animate-pulse`}></div>
            )}
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>
              Start or stop continuous speed testing
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={toggleTesting}
              variant={isRunning ? "destructive" : "default"}
              className="flex items-center space-x-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isRunning ? "Stop Testing" : "Start Testing"}</span>
            </Button>
            
            <Button 
              onClick={runSingleTest}
              variant="outline"
              disabled={currentTest.status === 'testing'}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Run Single Test</span>
            </Button>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Interval:</label>
              <select 
                value={interval} 
                onChange={(e) => setInterval(Number(e.target.value))}
                className="px-3 py-1 border rounded-md bg-background"
                disabled={isRunning}
              >
                <option value={1}>1 second</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            {testHistory.length > 0 && (
              <Button 
                onClick={clearHistory}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear History</span>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Current Speed Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Download Speed</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTest.downloadSpeed.toFixed(1)} Mbps
              </div>
              <p className="text-xs text-muted-foreground">
                {getStatusText(currentTest.status)}
              </p>
              {statistics.totalTests > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {statistics.avgDownload.toFixed(1)} Mbps
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upload Speed</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTest.uploadSpeed.toFixed(1)} Mbps
              </div>
              <p className="text-xs text-muted-foreground">
                {getStatusText(currentTest.status)}
              </p>
              {statistics.totalTests > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {statistics.avgUpload.toFixed(1)} Mbps
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ping</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTest.ping.toFixed(0)} ms
              </div>
              <p className="text-xs text-muted-foreground">
                {getStatusText(currentTest.status)}
              </p>
              {statistics.totalTests > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {statistics.avgPing.toFixed(0)} ms
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Summary */}
        {statistics.totalTests > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics Summary</CardTitle>
              <CardDescription>
                Performance overview from {statistics.totalTests} tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Max Download</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.maxDownload.toFixed(1)} Mbps</p>
                </div>
                <div>
                  <p className="font-medium">Max Upload</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.maxUpload.toFixed(1)} Mbps</p>
                </div>
                <div>
                  <p className="font-medium">Min Ping</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.minPing.toFixed(0)} ms</p>
                </div>
                <div>
                  <p className="font-medium">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.totalTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <Charts data={testHistory} />

        {/* Export Panel */}
        <ExportPanel data={testHistory} />

        {/* Error Alert */}
        {currentTest.status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Speed test failed. Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Test History Table */}
        <DataTable 
          data={testHistory}
          title="Test History"
          description={`Recent speed test results (${testHistory.length} total)`}
        />
      </div>
    </div>
  )
}

export default App

