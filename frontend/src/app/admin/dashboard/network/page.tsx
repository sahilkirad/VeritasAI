"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Network, 
  Users, 
  Building, 
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Target,
  ArrowRight,
  User,
  Briefcase
} from "lucide-react"
import { useNetworkAnalyticsData } from "@/hooks/useHybridAdminData"

interface NetworkNode {
  id: string
  name: string
  type: 'founder' | 'investor' | 'angel' | 'company'
  x?: number
  y?: number
  z?: number
  size: number
  color: string
  connections: number
}

interface NetworkLink {
  source: string
  target: string
  type: 'direct' | 'co_investor' | 'syndicate' | 'referral'
  strength: number
}

interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
}

export default function NetworkGraphPage() {
  // Use hybrid data for network analytics
  const { networkMetrics, timeSeries, loading: hybridLoading } = useNetworkAnalyticsData()
  
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], links: [] })
  const [filteredData, setFilteredData] = useState<NetworkData>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>("all")
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [showLabels, setShowLabels] = useState(true)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Simulate loading network data
    const loadNetworkData = () => {
      const mockData: NetworkData = {
        nodes: [
          // Founders
          { id: 'f1', name: 'Sarah Johnson', type: 'founder', size: 8, color: '#3B82F6', connections: 3 },
          { id: 'f2', name: 'Mike Chen', type: 'founder', size: 6, color: '#3B82F6', connections: 2 },
          { id: 'f3', name: 'Lisa Wang', type: 'founder', size: 7, color: '#3B82F6', connections: 4 },
          { id: 'f4', name: 'David Park', type: 'founder', size: 5, color: '#3B82F6', connections: 2 },
          
          // Investors
          { id: 'i1', name: 'Accel Partners', type: 'investor', size: 12, color: '#8B5CF6', connections: 8 },
          { id: 'i2', name: 'Sequoia Capital', type: 'investor', size: 15, color: '#8B5CF6', connections: 10 },
          { id: 'i3', name: 'Andreessen Horowitz', type: 'investor', size: 14, color: '#8B5CF6', connections: 9 },
          { id: 'i4', name: 'Kleiner Perkins', type: 'investor', size: 11, color: '#8B5CF6', connections: 6 },
          
          // Angels
          { id: 'a1', name: 'John Smith', type: 'angel', size: 4, color: '#F59E0B', connections: 5 },
          { id: 'a2', name: 'Maria Garcia', type: 'angel', size: 5, color: '#F59E0B', connections: 4 },
          { id: 'a3', name: 'Alex Kim', type: 'angel', size: 3, color: '#F59E0B', connections: 3 },
          
          // Companies
          { id: 'c1', name: 'TechStartup Inc', type: 'company', size: 6, color: '#10B981', connections: 2 },
          { id: 'c2', name: 'AI Corp', type: 'company', size: 7, color: '#10B981', connections: 3 },
          { id: 'c3', name: 'DataFlow Solutions', type: 'company', size: 5, color: '#10B981', connections: 2 }
        ],
        links: [
          // Founder connections
          { source: 'f1', target: 'i1', type: 'direct', strength: 0.8 },
          { source: 'f1', target: 'a1', type: 'referral', strength: 0.6 },
          { source: 'f2', target: 'i2', type: 'direct', strength: 0.9 },
          { source: 'f2', target: 'a2', type: 'referral', strength: 0.7 },
          { source: 'f3', target: 'i3', type: 'direct', strength: 0.85 },
          { source: 'f3', target: 'i1', type: 'co_investor', strength: 0.7 },
          { source: 'f4', target: 'i4', type: 'direct', strength: 0.75 },
          
          // Angel connections
          { source: 'a1', target: 'i1', type: 'syndicate', strength: 0.8 },
          { source: 'a1', target: 'i2', type: 'co_investor', strength: 0.6 },
          { source: 'a2', target: 'i2', type: 'syndicate', strength: 0.7 },
          { source: 'a2', target: 'i3', type: 'co_investor', strength: 0.5 },
          { source: 'a3', target: 'i3', type: 'syndicate', strength: 0.6 },
          
          // Company connections
          { source: 'c1', target: 'f1', type: 'direct', strength: 1.0 },
          { source: 'c1', target: 'i1', type: 'direct', strength: 0.9 },
          { source: 'c2', target: 'f2', type: 'direct', strength: 1.0 },
          { source: 'c2', target: 'i2', type: 'direct', strength: 0.85 },
          { source: 'c3', target: 'f3', type: 'direct', strength: 1.0 },
          { source: 'c3', target: 'i3', type: 'direct', strength: 0.8 }
        ]
      }
      
      setNetworkData(mockData)
      setFilteredData(mockData)
    }

    setTimeout(() => {
      loadNetworkData()
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Filter data based on search and type filter
    let filtered = { ...networkData }

    if (searchTerm) {
      filtered.nodes = filtered.nodes.filter(node => 
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const nodeIds = new Set(filtered.nodes.map(n => n.id))
      filtered.links = filtered.links.filter(link => 
        nodeIds.has(link.source) && nodeIds.has(link.target)
      )
    }

    if (nodeTypeFilter !== "all") {
      filtered.nodes = filtered.nodes.filter(node => node.type === nodeTypeFilter)
      const nodeIds = new Set(filtered.nodes.map(n => n.id))
      filtered.links = filtered.links.filter(link => 
        nodeIds.has(link.source) && nodeIds.has(link.target)
      )
    }

    setFilteredData(filtered)
  }, [networkData, searchTerm, nodeTypeFilter])

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'founder': return <User className="w-4 h-4" />
      case 'investor': return <Building className="w-4 h-4" />
      case 'angel': return <Users className="w-4 h-4" />
      case 'company': return <Briefcase className="w-4 h-4" />
      default: return <Network className="w-4 h-4" />
    }
  }

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return '#3B82F6'
      case 'co_investor': return '#8B5CF6'
      case 'syndicate': return '#F59E0B'
      case 'referral': return '#10B981'
      default: return '#6B7280'
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    setSelectedNode(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Network Graph</h1>
        <p className="text-gray-600 mt-2">Visualize connections between founders, investors, and companies</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Network Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={nodeTypeFilter} onValueChange={setNodeTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="founder">Founders</SelectItem>
                <SelectItem value="investor">Investors</SelectItem>
                <SelectItem value="angel">Angels</SelectItem>
                <SelectItem value="company">Companies</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLabels(!showLabels)}
              >
                {showLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showLabels ? 'Hide Labels' : 'Show Labels'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Network Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ transform: `scale(${zoom})` }}
                />
                
                {/* Placeholder for actual graph implementation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Network className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Network Graph</h3>
                    <p className="text-gray-600 mb-4">
                      Interactive 3D force-directed graph visualization
                    </p>
                    <div className="text-sm text-gray-500">
                      {filteredData.nodes.length} nodes, {filteredData.links.length} connections
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Node Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: selectedNode.color }}
                    >
                      {getNodeIcon(selectedNode.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedNode.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {selectedNode.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Connections:</span>
                      <span className="font-medium">{selectedNode.connections}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{selectedNode.size}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click a node to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Founders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Investors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Angels</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm">Companies</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <h4 className="font-medium text-sm mb-2">Connection Types</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-500"></div>
                    <span className="text-xs">Direct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-purple-500"></div>
                    <span className="text-xs">Co-investor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-yellow-500"></div>
                    <span className="text-xs">Syndicate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500"></div>
                    <span className="text-xs">Referral</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredData.nodes.length}</div>
            <p className="text-xs text-muted-foreground">Total Nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredData.links.length}</div>
            <p className="text-xs text-muted-foreground">Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredData.nodes.filter(n => n.type === 'founder').length}
            </div>
            <p className="text-xs text-muted-foreground">Founders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredData.nodes.filter(n => n.type === 'investor').length}
            </div>
            <p className="text-xs text-muted-foreground">Investors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
