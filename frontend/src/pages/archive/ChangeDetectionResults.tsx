import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  FileText, 
  Hash, 
  Calendar, 
  ArrowRight, 
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Filter
} from 'lucide-react';

export function ChangeDetectionResults() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const detectionResults = [
    {
      id: 1,
      documentTitle: 'Banking Regulation Framework 2025',
      oldVersion: 'v2.1',
      newVersion: 'v2.2',
      detectionDate: '2025-08-21 10:30:00',
      status: 'changes_detected',
      severity: 'high',
      hashComparison: {
        oldHash: 'a7b8c9d0e1f2...',
        newHash: 'x1y2z3a4b5c6...',
        similarity: 87.3
      },
      changesCount: 15,
      categories: ['Section 4.2', 'Appendix B', 'Definitions']
    },
    {
      id: 2,
      documentTitle: 'Data Protection Guidelines',
      oldVersion: 'v1.8',
      newVersion: 'v1.9',
      detectionDate: '2025-08-21 08:15:00',
      status: 'no_changes',
      severity: 'none',
      hashComparison: {
        oldHash: 'f1e2d3c4b5a6...',
        newHash: 'f1e2d3c4b5a6...',
        similarity: 100.0
      },
      changesCount: 0,
      categories: []
    },
    {
      id: 3,
      documentTitle: 'Financial Reporting Standards Update',
      oldVersion: 'v3.0',
      newVersion: 'v3.1',
      detectionDate: '2025-08-20 16:45:00',
      status: 'changes_detected',
      severity: 'medium',
      hashComparison: {
        oldHash: 'm9n8o7p6q5r4...',
        newHash: 's3t2u1v0w9x8...',
        similarity: 92.1
      },
      changesCount: 8,
      categories: ['Chapter 2', 'Section 7.3']
    },
    {
      id: 4,
      documentTitle: 'Cybersecurity Framework',
      oldVersion: 'v1.5',
      newVersion: 'v1.6',
      detectionDate: '2025-08-20 14:20:00',
      status: 'processing',
      severity: 'pending',
      hashComparison: {
        oldHash: 'processing...',
        newHash: 'processing...',
        similarity: 0
      },
      changesCount: 0,
      categories: []
    }
  ];

  const filters = [
    { key: 'all', label: 'All Results', count: 4 },
    { key: 'changes_detected', label: 'Changes Detected', count: 2 },
    { key: 'no_changes', label: 'No Changes', count: 1 },
    { key: 'processing', label: 'Processing', count: 1 }
  ];

  const filteredResults = selectedFilter === 'all' 
    ? detectionResults 
    : detectionResults.filter(result => result.status === selectedFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'changes_detected':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'no_changes':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'changes_detected':
        return <Badge variant="destructive">Changes Detected</Badge>;
      case 'no_changes':
        return <Badge variant="default">No Changes</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Change Detection Results</h1>
          <p className="text-gray-600 mt-1">
            View detected differences between document versions
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button>
            <Eye className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Comparisons</CardDescription>
            <CardTitle className="text-2xl">47</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Changes Detected</CardDescription>
            <CardTitle className="text-2xl text-orange-600">23</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>No Changes</CardDescription>
            <CardTitle className="text-2xl text-green-600">20</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing</CardDescription>
            <CardTitle className="text-2xl text-blue-600">4</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{filter.label}</span>
                    <Badge variant="outline">{filter.count}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
              <CardDescription>
                Document comparison results with hash analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div key={result.id} className={`border rounded-lg p-4 ${getSeverityColor(result.severity)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-semibold">{result.documentTitle}</h4>
                          <p className="text-sm opacity-75">
                            {result.oldVersion} → {result.newVersion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(result.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>

                    {/* Hash Comparison */}
                    <div className="bg-white bg-opacity-50 rounded-md p-3 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Hash className="h-4 w-4" />
                        <span className="font-medium text-sm">Hash Comparison</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Old Hash:</span>
                          <p className="font-mono bg-white bg-opacity-75 p-1 rounded mt-1">
                            {result.hashComparison.oldHash}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">New Hash:</span>
                          <p className="font-mono bg-white bg-opacity-75 p-1 rounded mt-1">
                            {result.hashComparison.newHash}
                          </p>
                        </div>
                      </div>
                      {result.hashComparison.similarity > 0 && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-medium">Similarity Score:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-white bg-opacity-75 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-current"
                                style={{ width: `${result.hashComparison.similarity}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {result.hashComparison.similarity}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(result.detectionDate).toLocaleString()}</span>
                        </div>
                        {result.changesCount > 0 && (
                          <div className="flex items-center space-x-1">
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-medium">{result.changesCount} changes detected</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {result.categories.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium">Affected Sections:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
