import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar as CalendarIcon, ChevronDown, ChevronRight, Info, FileText, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';

// Import interfaces from Collaboration component
interface Regulation {
  _id: string;
  title: string;
  lastUpdated: string;
  status: 'pending' | 'validated';
  versions: RegulationVersion[];
  comments: Comment[];
}

interface RegulationVersion {
  id: string;
  version: string;
  title?: string;
  uploadDate: string;
  fileName: string;
  detailedChanges?: DetailedChange[];
}

interface DetailedChange {
  id: string;
  summary: string;
  analysis: string;
  change: string;
  before_quote: string;
  after_quote: string;
  type: string;
  confidence: number;
  status?: 'pending' | 'relevant' | 'not-relevant';
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

// Extended interface for aggregated changes
interface AggregatedChange extends DetailedChange {
  regulationId: string;
  regulationTitle: string;
  versionId: string;
  versionNumber: string;
  versionTitle?: string;
  uploadDate: string;
}

interface FilterOptions {
  searchTerm: string;
  selectedRegulations: string[];
  selectedTypes: string[];
  confidenceRange: [number, number];
  dateRange: [Date | undefined, Date | undefined];
  statusFilter: 'all' | 'relevant' | 'pending' | 'not-relevant';
  sortBy: 'date' | 'confidence' | 'regulation' | 'type';
  sortOrder: 'asc' | 'desc';
}

const RelevantChangesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [aggregatedChanges, setAggregatedChanges] = useState<AggregatedChange[]>([]);
  const [filteredChanges, setFilteredChanges] = useState<AggregatedChange[]>([]);
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    selectedRegulations: [],
    selectedTypes: [],
    confidenceRange: [0, 1],
    dateRange: [undefined, undefined],
    statusFilter: 'all', // Default to relevant changes
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Fetch regulations and aggregate changes
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:9000/regulations');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch regulations: ${response.statusText}`);
        }
        
        const data = await response.json();
        setRegulations(data);
        
        // Aggregate all changes from all regulations
        const allChanges: AggregatedChange[] = [];
        
        data.forEach((regulation: Regulation) => {
          regulation.versions.forEach((version: RegulationVersion) => {
            if (version.detailedChanges) {
              version.detailedChanges.forEach((change: DetailedChange) => {
                allChanges.push({
                  ...change,
                  regulationId: regulation._id,
                  regulationTitle: regulation.title,
                  versionId: version.id,
                  versionNumber: version.version,
                  versionTitle: version.title,
                  uploadDate: version.uploadDate
                });
              });
            }
          });
        });
        
        setAggregatedChanges(allChanges);
      } catch (err) {
        console.error('Error fetching regulations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegulations();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...aggregatedChanges];

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(change => 
        change.status === filters.statusFilter || 
        (filters.statusFilter === 'pending' && (!change.status || change.status === 'pending'))
      );
    }

    // Search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(change => 
        change.summary.toLowerCase().includes(searchLower) ||
        change.analysis.toLowerCase().includes(searchLower) ||
        change.change.toLowerCase().includes(searchLower) ||
        change.regulationTitle.toLowerCase().includes(searchLower)
      );
    }

    // Regulation filter
    if (filters.selectedRegulations.length > 0) {
      filtered = filtered.filter(change => 
        filters.selectedRegulations.includes(change.regulationId)
      );
    }

    // Type filter
    if (filters.selectedTypes.length > 0) {
      filtered = filtered.filter(change => 
        filters.selectedTypes.includes(change.type)
      );
    }

    // Confidence range
    filtered = filtered.filter(change => 
      change.confidence >= filters.confidenceRange[0] && 
      change.confidence <= filters.confidenceRange[1]
    );

    // Date range
    if (filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(change => {
        const changeDate = new Date(change.uploadDate);
        const startDate = filters.dateRange[0]!;
        const endDate = filters.dateRange[1]!;
        return changeDate >= startDate && changeDate <= endDate;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'regulation':
          comparison = a.regulationTitle.localeCompare(b.regulationTitle);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredChanges(filtered);
  }, [aggregatedChanges, filters]);

  const toggleExpand = (changeId: string) => {
    const newExpanded = new Set(expandedChanges);
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId);
    } else {
      newExpanded.add(changeId);
    }
    setExpandedChanges(newExpanded);
  };

  const getUniqueTypes = () => {
    const types = new Set(aggregatedChanges.map(change => change.type));
    return Array.from(types);
  };

  const handleExport = () => {
    const dataToExport = filteredChanges.map(change => ({
      regulation: change.regulationTitle,
      version: `${change.versionNumber}${change.versionTitle ? ` - ${change.versionTitle}` : ''}`,
      type: change.type,
      summary: change.summary,
      confidence: `${(change.confidence * 100).toFixed(0)}%`,
      status: change.status || 'pending',
      uploadDate: change.uploadDate
    }));

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changes-overview-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading changes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Changes Overview</h1>
              <p className="text-gray-600 mt-1">
                Overview of all relevant regulatory changes ({filteredChanges.length} of {aggregatedChanges.length} changes)
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Filter size={20} />
                Filters
                {showFilters ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
              <Button variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                disabled={filteredChanges.length === 0}
              >
                <Download size={20} />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                    placeholder="Search changes..."
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value as any }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="all">All Statuses</option>
                  <option value="relevant">Relevant Only</option>
                  <option value="pending">Pending Review</option>
                  <option value="not-relevant">Not Relevant</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="flex-1 p-2 border rounded-lg"
                  >
                    <option value="date">Upload Date</option>
                    <option value="confidence">Confidence</option>
                    <option value="regulation">Regulation</option>
                    <option value="type">Change Type</option>
                  </select>
                  <Button variant="outline"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                    }))}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <ArrowUpDown size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Regulations Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Regulations</label>
                <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                  {regulations.map(reg => (
                    <label key={reg._id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.selectedRegulations.includes(reg._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ 
                              ...prev, 
                              selectedRegulations: [...prev.selectedRegulations, reg._id] 
                            }));
                          } else {
                            setFilters(prev => ({ 
                              ...prev, 
                              selectedRegulations: prev.selectedRegulations.filter(id => id !== reg._id) 
                            }));
                          }
                        }}
                      />
                      {reg.title}
                    </label>
                  ))}
                </div>
              </div>

              {/* Types Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Change Types</label>
                <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                  {getUniqueTypes().map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ 
                              ...prev, 
                              selectedTypes: [...prev.selectedTypes, type] 
                            }));
                          } else {
                            setFilters(prev => ({ 
                              ...prev, 
                              selectedTypes: prev.selectedTypes.filter(t => t !== type) 
                            }));
                          }
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Confidence Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confidence: {(filters.confidenceRange[0] * 100).toFixed(0)}% - {(filters.confidenceRange[1] * 100).toFixed(0)}%
                </label>
                <div className="px-3 py-2">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      filters.confidenceRange[0] * 100,
                      filters.confidenceRange[1] * 100
                    ]}
                    onValueChange={(value) => {
                      setFilters(prev => ({
                        ...prev,
                        confidenceRange: [
                          value[0] / 100,
                          value[1] / 100
                        ]
                      }));
                    }}
                    className="w-full"
                  />
                </div>
                {/* Value indicators */}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Date Range Filter - New Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Date Range</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange[0] ? format(filters.dateRange[0], "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange[0]}
                          onSelect={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateRange: [date, prev.dateRange[1]] 
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange[1] ? format(filters.dateRange[1], "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange[1]}
                          onSelect={(date) => setFilters(prev => ({ 
                            ...prev, 
                            dateRange: [prev.dateRange[0], date] 
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline"
                onClick={() => setFilters({
                  searchTerm: '',
                  selectedRegulations: [],
                  selectedTypes: [],
                  confidenceRange: [0, 1],
                  dateRange: [undefined, undefined],
                  statusFilter: 'relevant',
                  sortBy: 'date',
                  sortOrder: 'desc'
                })}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Changes List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {filteredChanges.length === 0 ? (
            <div className="text-center py-12">
              <Info size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Found</h3>
              <p className="text-gray-500">
                {aggregatedChanges.length === 0 
                  ? "No changes available in the system." 
                  : "Try adjusting your filters to see more results."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredChanges.map((change, index) => {
                const isExpanded = expandedChanges.has(change.id);
                
                return (
                  <div key={`${change.regulationId}-${change.versionId}-${change.id}`} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Button variant={"ghost"}
                            onClick={() => toggleExpand(change.id)}
                            className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <span className="font-medium">Change {index + 1}</span>
                          </Button>
                          
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            change.type === 'modification' ? 'bg-blue-100 text-blue-800' :
                            change.type === 'procedural change' ? 'bg-green-100 text-green-800' :
                            change.type === 'penalty change' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {change.type}
                          </span>
                          
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            change.status === 'relevant' ? 'bg-green-100 text-green-800' :
                            change.status === 'not-relevant' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {change.status === 'relevant' ? 'Relevant' :
                             change.status === 'not-relevant' ? 'Not Relevant' :
                             'Pending Review'}
                          </span>
                          
                          <span className="text-xs text-gray-500">
                            Confidence: {(change.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-1">{change.summary}</h4>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <FileText size={14} />
                            {change.regulationTitle}
                          </div>
                          <span>
                            Version {change.versionNumber}
                            {change.versionTitle && ` - ${change.versionTitle}`}
                          </span>
                          <span>
                            <CalendarIcon size={14} className="inline mr-1" />
                            {change.uploadDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 ml-6">
                        <div>
                          <h5 className="font-medium mb-2">Analysis</h5>
                          <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">{change.analysis}</p>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Change Description</h5>
                          <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded">{change.change}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2 text-red-700">Before (Original Text)</h5>
                            <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                              <p className="text-sm text-gray-700 italic">{change.before_quote}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2 text-green-700">After (Updated Text)</h5>
                            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                              <p className="text-sm text-gray-700 italic">{change.after_quote}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelevantChangesPage;