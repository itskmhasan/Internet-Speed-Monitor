import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  Filter,
  Calendar
} from 'lucide-react'

const DataTable = ({ data = [], title = "Data Table", description = "" }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortField, setSortField] = useState('timestamp')
  const [sortDirection, setSortDirection] = useState('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  // Filter data based on search term and date filter
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase()
        return (
          new Date(item.timestamp).toLocaleString().toLowerCase().includes(searchLower) ||
          item.downloadSpeed.toString().includes(searchLower) ||
          item.uploadSpeed.toString().includes(searchLower) ||
          item.ping.toString().includes(searchLower)
        )
      })
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
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
          break
      }

      filtered = filtered.filter(item => new Date(item.timestamp) >= filterDate)
    }

    return filtered
  }, [data, searchTerm, dateFilter])

  // Sort data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle timestamp sorting
      if (sortField === 'timestamp') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredData, sortField, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, sortedData.length)

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />
  }

  // Handle page changes
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setDateFilter('all')
    setCurrentPage(1)
  }

  // Get performance badge color
  const getPerformanceBadge = (downloadSpeed) => {
    if (downloadSpeed >= 100) return { variant: "default", text: "Excellent" }
    if (downloadSpeed >= 50) return { variant: "secondary", text: "Good" }
    if (downloadSpeed >= 25) return { variant: "outline", text: "Fair" }
    return { variant: "destructive", text: "Poor" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">
            {sortedData.length} {sortedData.length === 1 ? 'result' : 'results'}
          </Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="hour">Last hour</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="day">Last 24h</SelectItem>
                <SelectItem value="week">Last week</SelectItem>
                <SelectItem value="month">Last month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Table */}
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {data.length === 0 ? 
              "No test results yet. Start testing to see data here." :
              "No results match your filters."
            }
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('timestamp')}
                        className="h-auto p-0 font-semibold"
                      >
                        Timestamp
                        {getSortIcon('timestamp')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('downloadSpeed')}
                        className="h-auto p-0 font-semibold"
                      >
                        Download (Mbps)
                        {getSortIcon('downloadSpeed')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('uploadSpeed')}
                        className="h-auto p-0 font-semibold"
                      >
                        Upload (Mbps)
                        {getSortIcon('uploadSpeed')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('ping')}
                        className="h-auto p-0 font-semibold"
                      >
                        Ping (ms)
                        {getSortIcon('ping')}
                      </Button>
                    </TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((result) => {
                    const perfBadge = getPerformanceBadge(result.downloadSpeed)
                    return (
                      <TableRow key={result.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {new Date(result.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono">
                          {result.downloadSpeed.toFixed(1)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {result.uploadSpeed.toFixed(1)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {result.ping.toFixed(0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={perfBadge.variant}>
                            {perfBadge.text}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {startItem} to {endItem} of {sortedData.length} results
                </span>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                    <SelectItem value="100">100 / page</SelectItem>
                    <SelectItem value="200">200 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default DataTable

