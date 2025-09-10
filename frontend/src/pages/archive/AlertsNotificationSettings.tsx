import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  Plus,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export function AlertsNotificationSettings() {
  const [newAlertRule, setNewAlertRule] = useState({
    name: '',
    trigger: 'any_change',
    severity: 'medium',
    channels: ['email']
  });

  const alertRules = [
    {
      id: 1,
      name: 'High Impact Banking Changes',
      description: 'Alert for any high-severity changes in banking regulations',
      trigger: 'high_severity',
      categories: ['Banking', 'Capital Requirements'],
      channels: ['email', 'sms'],
      enabled: true,
      lastTriggered: '2025-08-21 10:30:00'
    },
    {
      id: 2,
      name: 'Data Protection Updates',
      description: 'Monitor all changes to data protection and privacy regulations',
      trigger: 'category_specific',
      categories: ['Data Protection', 'Privacy'],
      channels: ['email'],
      enabled: true,
      lastTriggered: '2025-08-20 15:45:00'
    },
    {
      id: 3,
      name: 'Daily Summary',
      description: 'Daily digest of all regulatory changes',
      trigger: 'scheduled',
      categories: ['All'],
      channels: ['email'],
      enabled: false,
      lastTriggered: '2025-08-19 08:00:00'
    }
  ];

  const alertHistory = [
    {
      id: 1,
      title: 'High Impact Change Detected',
      message: 'Banking Regulation Framework 2025 has significant changes in capital requirements',
      timestamp: '2025-08-21 10:30:00',
      severity: 'high',
      status: 'read',
      channels: ['email', 'sms']
    },
    {
      id: 2,
      title: 'New Document Uploaded',
      message: 'Data Protection Guidelines v1.9 has been uploaded and is being analyzed',
      timestamp: '2025-08-21 08:15:00',
      severity: 'medium',
      status: 'unread',
      channels: ['email']
    },
    {
      id: 3,
      title: 'Scraping Job Failed',
      message: 'Financial Services Monitor failed after 3 consecutive attempts',
      timestamp: '2025-08-20 23:50:00',
      severity: 'low',
      status: 'read',
      channels: ['email']
    },
    {
      id: 4,
      title: 'Weekly Analysis Report Ready',
      message: 'Your weekly regulatory analysis report is ready for download',
      timestamp: '2025-08-19 09:00:00',
      severity: 'low',
      status: 'read',
      channels: ['email']
    }
  ];

  const notificationChannels = [
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      enabled: true,
      address: 'user@company.com'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Smartphone,
      enabled: true,
      address: '+1 (555) 123-4567'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Bell className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notification Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure alert preferences and manage notification channels
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Alert Rule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Rules</CardDescription>
            <CardTitle className="text-2xl">2</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alerts Today</CardDescription>
            <CardTitle className="text-2xl text-blue-600">3</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unread Alerts</CardDescription>
            <CardTitle className="text-2xl text-red-600">1</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Channels</CardDescription>
            <CardTitle className="text-2xl text-green-600">2</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Rules */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>
                Configure when and how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          rule.enabled ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Bell className={`h-4 w-4 ${
                            rule.enabled ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-500">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={rule.enabled ? 'default' : 'outline'}>
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Trigger:</span>
                        <p className="font-medium capitalize">{rule.trigger.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Triggered:</span>
                        <p className="font-medium">{new Date(rule.lastTriggered).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {rule.categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Channels:</span>
                      {rule.channels.map((channel, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Channels & Recent Alerts */}
        <div className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Manage how you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationChannels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <div>
                          <h5 className="font-medium">{channel.name}</h5>
                          <p className="text-sm text-gray-500">{channel.address}</p>
                        </div>
                      </div>
                      <Badge variant={channel.enabled ? 'default' : 'outline'}>
                        {channel.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-3 w-3 mr-1" />
                Add Channel
              </Button>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Latest notification history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertHistory.slice(0, 4).map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-3 ${
                    alert.status === 'unread' ? 'bg-blue-50 border-blue-200' : ''
                  }`}>
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h6 className="font-medium text-sm">{alert.title}</h6>
                          {alert.status === 'unread' && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            {alert.channels.map((channel, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
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
    </div>
  );
}
