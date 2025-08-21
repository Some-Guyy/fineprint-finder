import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  Calendar,
  Download
} from 'lucide-react';

export function ScrapingManagement() {
  const [isRunning, setIsRunning] = useState(false);

  const scrapingJobs = [
    {
      id: 1,
      name: 'Banking Regulations Scraper',
      source: 'regulatory.gov',
      lastRun: '2025-08-21 09:30:00',
      status: 'completed',
      documentsFound: 15,
      changesDetected: 3,
      nextRun: '2025-08-21 21:30:00'
    },
    {
      id: 2,
      name: 'Financial Services Monitor',
      source: 'finra.org',
      lastRun: '2025-08-21 08:15:00',
      status: 'running',
      documentsFound: 0,
      changesDetected: 0,
      nextRun: '2025-08-21 20:15:00'
    },
    {
      id: 3,
      name: 'Data Protection Tracker',
      source: 'privacy-enforcement.gov',
      lastRun: '2025-08-20 23:45:00',
      status: 'failed',
      documentsFound: 0,
      changesDetected: 0,
      nextRun: '2025-08-21 23:45:00'
    },
    {
      id: 4,
      name: 'SEC Filings Monitor',
      source: 'sec.gov',
      lastRun: '2025-08-21 07:00:00',
      status: 'completed',
      documentsFound: 42,
      changesDetected: 7,
      nextRun: '2025-08-21 19:00:00'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      timestamp: '2025-08-21 09:35:00',
      action: 'Job Completed',
      job: 'Banking Regulations Scraper',
      details: 'Found 15 documents, 3 changes detected'
    },
    {
      id: 2,
      timestamp: '2025-08-21 08:15:00',
      action: 'Job Started',
      job: 'Financial Services Monitor',
      details: 'Scheduled run initiated'
    },
    {
      id: 3,
      timestamp: '2025-08-21 07:05:00',
      action: 'Job Completed',
      job: 'SEC Filings Monitor',
      details: 'Found 42 documents, 7 changes detected'
    },
    {
      id: 4,
      timestamp: '2025-08-20 23:50:00',
      action: 'Job Failed',
      job: 'Data Protection Tracker',
      details: 'Connection timeout after 3 retries'
    }
  ];

  const handleRunJob = (jobId: number) => {
    setIsRunning(true);
    // Simulate job execution
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scraping Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and control document scraping jobs
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run All Jobs
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Jobs</CardDescription>
            <CardTitle className="text-2xl">4</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Running</CardDescription>
            <CardTitle className="text-2xl text-blue-600">1</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Today</CardDescription>
            <CardTitle className="text-2xl text-green-600">2</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">1</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scraping Jobs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Jobs</CardTitle>
              <CardDescription>
                Manage and monitor your document scraping jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scrapingJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium">{job.name}</h4>
                          <p className="text-sm text-gray-500">{job.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(job.status)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRunJob(job.id)}
                          disabled={job.status === 'running' || isRunning}
                        >
                          {job.status === 'running' ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Run:</span>
                        <p className="font-medium">{job.lastRun}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Run:</span>
                        <p className="font-medium">{job.nextRun}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Documents Found:</span>
                        <p className="font-medium">{job.documentsFound}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Changes Detected:</span>
                        <p className="font-medium text-blue-600">{job.changesDetected}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest scraping job activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{activity.action}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.job}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="h-3 w-3 mr-1" />
                Schedule
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
