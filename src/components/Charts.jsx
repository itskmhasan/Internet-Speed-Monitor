import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useState } from 'react'

const Charts = ({ data = [] }) => {
  const [timeRange, setTimeRange] = useState('all')
  const [chartType, setChartType] = useState('line')

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all' || data.length === 0) {
      return data
    }

    const now = new Date()
    const filterDate = new Date()

    switch (timeRange) {
      case 'hour':
        filterDate.setTime(now.getTime() - 60 * 60 * 1000)
        break
      case 'day':
        filterDate.setTime(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        filterDate.setTime(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        filterDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        return data
    }

    return data.filter(item => new Date(item.timestamp) >= filterDate)
  }, [data, timeRange])

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredData
      .slice()
      .reverse() // Show oldest to newest
      .map((item, index) => ({
        index: index + 1,
        time: new Date(item.timestamp).toLocaleTimeString(),
        fullTime: new Date(item.timestamp).toLocaleString(),
        downloadSpeed: Number(item.downloadSpeed.toFixed(1)),
        uploadSpeed: Number(item.uploadSpeed.toFixed(1)),
        ping: Number(item.ping.toFixed(0))
      }))
  }, [filteredData])

  // Calculate trends
  const trends = useMemo(() => {
    if (chartData.length < 2) {
      return { download: 0, upload: 0, ping: 0 }
    }

    const recent = chartData.slice(-5) // Last 5 tests
    const older = chartData.slice(-10, -5) // Previous 5 tests

    if (older.length === 0) {
      return { download: 0, upload: 0, ping: 0 }
    }

    const recentAvg = {
      download: recent.reduce((sum, item) => sum + item.downloadSpeed, 0) / recent.length,
      upload: recent.reduce((sum, item) => sum + item.uploadSpeed, 0) / recent.length,
      ping: recent.reduce((sum, item) => sum + item.ping, 0) / recent.length
    }

    const olderAvg = {
      download: older.reduce((sum, item) => sum + item.downloadSpeed, 0) / older.length,
      upload: older.reduce((sum, item) => sum + item.uploadSpeed, 0) / older.length,
      ping: older.reduce((sum, item) => sum + item.ping, 0) / older.length
    }

    return {
      download: ((recentAvg.download - olderAvg.download) / olderAvg.download) * 100,
      upload: ((recentAvg.upload - olderAvg.upload) / olderAvg.upload) * 100,
      ping: ((recentAvg.ping - olderAvg.ping) / olderAvg.ping) * 100
    }
  }, [chartData])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.fullTime}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry, index) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {entry.value}
                {entry.dataKey === 'ping' ? ' ms' : ' Mbps'}
              </p>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  // Trend indicator component
  const TrendIndicator = ({ value, label, unit = '%' }) => {
    const isPositive = value > 0
    const isNeutral = Math.abs(value) < 1
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {isNeutral ? (
            <Activity className="h-4 w-4 text-muted-foreground" />
          ) : isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <Badge variant={isNeutral ? "outline" : isPositive ? "default" : "destructive"}>
          {isPositive ? '+' : ''}{value.toFixed(1)}{unit}
        </Badge>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Speed Charts</CardTitle>
          <CardDescription>
            Visual representation of your internet speed over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for charts. Run some speed tests to see visualizations.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Speed Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Speed Over Time</CardTitle>
              <CardDescription>
                Download and upload speeds ({filteredData.length} data points)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="hour">Last hour</SelectItem>
                  <SelectItem value="day">Last 24h</SelectItem>
                  <SelectItem value="week">Last week</SelectItem>
                  <SelectItem value="month">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Speed (Mbps)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="downloadSpeed"
                    stackId="1"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Download Speed"
                  />
                  <Area
                    type="monotone"
                    dataKey="uploadSpeed"
                    stackId="2"
                    stroke="#dc2626"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Upload Speed"
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Speed (Mbps)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="downloadSpeed"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Download Speed"
                  />
                  <Line
                    type="monotone"
                    dataKey="uploadSpeed"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Upload Speed"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ping Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ping/Latency Over Time</CardTitle>
          <CardDescription>
            Network latency measurements ({filteredData.length} data points)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Ping (ms)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="ping"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Ping"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      {chartData.length >= 10 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Comparison of recent vs previous performance (last 5 vs previous 5 tests)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TrendIndicator 
                value={trends.download} 
                label="Download Speed" 
              />
              <TrendIndicator 
                value={trends.upload} 
                label="Upload Speed" 
              />
              <TrendIndicator 
                value={-trends.ping} // Negative because lower ping is better
                label="Ping (Lower is better)" 
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Charts

