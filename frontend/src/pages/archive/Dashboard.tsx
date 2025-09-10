import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp,
  Activity
} from 'lucide-react';

export function Dashboard() {
  const recentChanges = [
    {
      id: 1,
      title: 'Banking Regulation Amendment',
      type: 'High Impact',
      date: '2025-08-20',
      status: 'analyzed',
      severity: 'high'
    },
    {
      id: 2,
      title: 'Data Protection Guidelines Update',
      type: 'Medium Impact',
      date: '2025-08-19',
      status: 'pending',
      severity: 'medium'
    },
    {
      id: 3,
      title: 'Financial Reporting Standards',
      type: 'Low Impact',
      date: '2025-08-18',
      status: 'analyzed',
      severity: 'low'
    }
  ];

  const systemMetrics = [
    {
      title: 'Documents Monitored',
      value: '1,247',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Changes Detected',
      value: '23',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Analysis Pending',
      value: '3',
      change: '-2%',
      trend: 'down'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+0.5%',
      trend: 'up'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'New critical regulation change detected requiring immediate review',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Scraping job failed for 3 consecutive attempts',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'info',
      message: 'Weekly analysis report is ready for download',
      time: '1 day ago'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor regulatory changes and system health
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className={`h-4 w-4 ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }>
                  {metric.change}
                </span>
                <span className="text-gray-500">from last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Changes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Regulatory Changes</CardTitle>
              <CardDescription>
                Latest detected changes requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChanges.map((change) => (
                  <div key={change.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        change.severity === 'high' ? 'bg-red-100' :
                        change.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          change.severity === 'high' ? 'text-red-600' :
                          change.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{change.title}</h4>
                        <p className="text-sm text-gray-500">{change.type} • {change.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={change.status === 'analyzed' ? 'default' : 'secondary'}>
                        {change.status === 'analyzed' ? 'Analyzed' : 'Pending'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>
              System notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`p-1 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {alert.type === 'critical' ? (
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    ) : alert.type === 'warning' ? (
                      <Clock className="h-3 w-3 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
