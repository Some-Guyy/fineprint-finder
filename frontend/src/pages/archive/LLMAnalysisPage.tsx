import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Brain, 
  Eye, 
  Download, 
  Filter,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface AnalysisResult {
  id: number;
  documentTitle: string;
  analysisDate: string;
  status: 'completed' | 'processing' | 'failed';
  confidence: number;
  summary: string;
  keyChanges: Array<{
    id: number;
    category: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    textRegion: string;
    impact: string;
    recommendations: string[];
  }>;
  topics: string[];
}

export function LLMAnalysisPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedAnalysis, setExpandedAnalysis] = useState<number | null>(null);

  const analysisResults: AnalysisResult[] = [
    {
      id: 1,
      documentTitle: 'Banking Regulation Framework 2025',
      analysisDate: '2025-08-21 11:15:00',
      status: 'completed',
      confidence: 94.2,
      summary: 'Significant changes detected in capital requirements and risk assessment procedures. New compliance deadlines introduced.',
      keyChanges: [
        {
          id: 1,
          category: 'Capital Requirements',
          severity: 'high',
          description: 'Minimum capital ratio increased from 8% to 10%',
          textRegion: 'Section 4.2, Paragraph 3',
          impact: 'Banks must adjust capital structure to meet new requirements',
          recommendations: ['Review current capital position', 'Develop compliance timeline', 'Update risk models']
        },
        {
          id: 2,
          category: 'Risk Assessment',
          severity: 'medium',
          description: 'New stress testing requirements for quarterly reporting',
          textRegion: 'Section 7.1, Subsection B',
          impact: 'Additional reporting burden and system updates required',
          recommendations: ['Implement stress testing framework', 'Train compliance team', 'Update reporting systems']
        }
      ],
      topics: ['Capital Requirements', 'Risk Management', 'Compliance', 'Stress Testing']
    },
    {
      id: 2,
      documentTitle: 'Data Protection Guidelines',
      analysisDate: '2025-08-21 09:30:00',
      status: 'completed',
      confidence: 87.8,
      summary: 'Minor updates to data retention policies and cross-border transfer requirements. Enhanced user consent mechanisms.',
      keyChanges: [
        {
          id: 3,
          category: 'Data Retention',
          severity: 'medium',
          description: 'Maximum data retention period reduced from 7 to 5 years',
          textRegion: 'Article 12, Section 2',
          impact: 'Organizations must update data retention schedules',
          recommendations: ['Audit existing data stores', 'Update retention policies', 'Implement automated deletion']
        }
      ],
      topics: ['Data Protection', 'Privacy', 'Consent Management', 'Cross-border Transfers']
    },
    {
      id: 3,
      documentTitle: 'Financial Reporting Standards Update',
      analysisDate: '2025-08-20 15:20:00',
      status: 'processing',
      confidence: 0,
      summary: 'Analysis in progress...',
      keyChanges: [],
      topics: []
    }
  ];

  const categories = [
    { key: 'all', label: 'All Categories', count: 3 },
    { key: 'Capital Requirements', label: 'Capital Requirements', count: 1 },
    { key: 'Risk Assessment', label: 'Risk Assessment', count: 1 },
    { key: 'Data Retention', label: 'Data Retention', count: 1 },
    { key: 'Compliance', label: 'Compliance', count: 2 }
  ];

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Lightbulb className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedAnalysis(expandedAnalysis === id ? null : id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LLM Analysis Results</h1>
          <p className="text-gray-600 mt-1">
            AI-powered analysis of regulatory changes by category and impact
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            Rerun Analysis
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documents Analyzed</CardDescription>
            <CardTitle className="text-2xl">24</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Impact Changes</CardDescription>
            <CardTitle className="text-2xl text-red-600">7</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Confidence</CardDescription>
            <CardTitle className="text-2xl text-blue-600">89.3%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">3</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.label}</span>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-generated insights and categorized changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysisResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{result.documentTitle}</h4>
                          <p className="text-sm text-gray-500">
                            Analyzed on {new Date(result.analysisDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.status === 'completed' && (
                          <Badge variant="default">
                            {result.confidence}% confidence
                          </Badge>
                        )}
                        {result.status === 'processing' && (
                          <Badge variant="secondary">Processing</Badge>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleExpanded(result.id)}
                          disabled={result.status !== 'completed'}
                        >
                          {expandedAnalysis === result.id ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">AI Summary</h5>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                        "{result.summary}"
                      </p>
                    </div>

                    {/* Topics */}
                    {result.topics.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Identified Topics</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.topics.map((topic, index) => (
                            <Badge key={index} variant="outline">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {expandedAnalysis === result.id && result.keyChanges.length > 0 && (
                      <div className="mt-4 space-y-4">
                        <h5 className="font-medium">Detailed Change Analysis</h5>
                        {result.keyChanges.map((change) => (
                          <div key={change.id} className={`border rounded-lg p-4 ${getSeverityColor(change.severity)}`}>
                            <div className="flex items-start space-x-3 mb-3">
                              {getSeverityIcon(change.severity)}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium">{change.category}</h6>
                                  <Badge variant="outline" className="text-xs">
                                    {change.severity} impact
                                  </Badge>
                                </div>
                                <p className="text-sm mb-2">{change.description}</p>
                                <p className="text-xs opacity-75 mb-2">
                                  Found in: {change.textRegion}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-white bg-opacity-50 rounded-md p-3 mb-3">
                              <h6 className="font-medium text-sm mb-1">Impact Assessment</h6>
                              <p className="text-sm">{change.impact}</p>
                            </div>

                            <div>
                              <h6 className="font-medium text-sm mb-2">AI Recommendations</h6>
                              <ul className="text-sm space-y-1">
                                {change.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-blue-600">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex space-x-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View Full Document
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Export Analysis
                          </Button>
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
