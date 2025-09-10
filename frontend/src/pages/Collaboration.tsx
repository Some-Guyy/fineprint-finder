import React, { useState } from 'react';
import { FileText, Plus, Upload, Edit3, Trash2, Mail, AlertCircle, CheckCircle, Eye, Download } from 'lucide-react';

interface Regulation {
  id: string;
  title: string;
  lastUpdated: string;
  status: 'pending' | 'validated';
  versions: RegulationVersion[];
  comments: Comment[];
}

interface RegulationVersion {
  id: string;
  version: string;
  uploadDate: string;
  fileName: string;
  summary: string;
  analysis: string;
  changes: string[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const mockRegulations: Regulation[] = [
  {
    id: '1',
    title: 'MiFID II Investment Services',
    lastUpdated: '2024-09-01',
    status: 'pending',
    versions: [
      {
        id: 'v4',
        version: '4.0',
        uploadDate: '2024-09-01',
        fileName: 'mifid_ii_v4.pdf',
        summary: 'Enhanced algorithmic trading controls and ESG disclosure requirements',
        analysis: 'Version 4.0 introduces mandatory ESG risk disclosures for all investment products and stricter algorithmic trading controls. Nomura must implement new ESG scoring systems and enhance our algorithmic trading monitoring infrastructure. The compliance deadline is Q1 2025.',
        changes: [
          'Mandatory ESG risk disclosure for all investment products',
          'Enhanced algorithmic trading kill switch requirements',
          'New client suitability assessment criteria including ESG preferences',
          'Quarterly ESG impact reporting to regulators'
        ]
      },
      {
        id: 'v3',
        version: '3.0',
        uploadDate: '2024-06-15',
        fileName: 'mifid_ii_v3.pdf',
        summary: 'Updated best execution requirements and transaction reporting thresholds',
        analysis: 'Version 3.0 modifies best execution criteria and reduces transaction reporting thresholds. This requires updates to our execution algorithms and reporting systems to capture smaller transactions previously exempt from reporting.',
        changes: [
          'Best execution reports now required quarterly instead of annually',
          'Transaction reporting threshold lowered from €15,000 to €10,000',
          'New venue transparency requirements for dark pools',
          'Enhanced client communication standards for execution quality'
        ]
      },
      {
        id: 'v2',
        version: '2.0',
        uploadDate: '2024-03-15',
        fileName: 'mifid_ii_v2.pdf',
        summary: 'Revised research unbundling rules and client reporting standards',
        analysis: 'Version 2.0 clarifies research payment arrangements and enhances client reporting requirements. This affects our research distribution model and requires enhanced cost disclosure to clients.',
        changes: [
          'Clearer guidelines on research payment arrangements',
          'Enhanced cost disclosure requirements to clients',
          'New annual client reporting templates',
          'Stricter inducement rules for investment advice'
        ]
      },
      {
        id: 'v1',
        version: '1.0',
        uploadDate: '2024-01-10',
        fileName: 'mifid_ii_v1.pdf',
        summary: '',
        analysis: 'Initial MiFID II implementation guidelines establishing the foundational framework for investment services regulation. This version sets out the basic requirements for client protection, market transparency, and conduct of business rules.',
        changes: []
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Sarah Chen',
        content: 'The ESG requirements in v4.0 will require significant IT infrastructure changes. We should prioritize the algorithmic trading controls.',
        timestamp: '2024-09-02 10:30'
      },
      {
        id: 'c2',
        author: 'Michael Rodriguez',
        content: 'Compliance team is already working on the ESG scoring methodology. Timeline looks tight for Q1 2025.',
        timestamp: '2024-09-02 14:15'
      }
    ]
  },
  {
    id: '2',
    title: 'Basel III Capital Requirements',
    lastUpdated: '2024-08-20',
    status: 'validated',
    versions: [
      {
        id: 'v3',
        version: '3.0',
        uploadDate: '2024-08-20',
        fileName: 'basel_iii_v3.pdf',
        summary: 'Operational risk framework updates and climate risk integration',
        analysis: 'Version 3.0 introduces climate risk stress testing and updates operational risk calculations. Nomura must integrate climate scenarios into our risk models and enhance operational risk data collection systems.',
        changes: [
          'Climate risk stress testing mandatory for all major banks',
          'Updated operational risk standardized measurement approach',
          'New climate-related financial disclosure requirements',
          'Enhanced cyber risk capital allocation requirements'
        ]
      },
      {
        id: 'v2',
        version: '2.0',
        uploadDate: '2024-05-15',
        fileName: 'basel_iii_v2.pdf',
        summary: 'Updated capital ratio requirements and stress testing procedures',
        analysis: 'Version 2.0 increases minimum capital ratios and introduces more rigorous stress testing procedures. This requires Nomura to maintain higher capital reserves and implement enhanced stress testing capabilities.',
        changes: [
          'Minimum Tier 1 capital ratio increased from 6% to 7%',
          'New quarterly stress testing requirements',
          'Enhanced disclosure requirements for systemically important banks',
          'Introduction of leverage ratio buffer requirements'
        ]
      },
      {
        id: 'v1',
        version: '1.0',
        uploadDate: '2024-01-10',
        fileName: 'basel_iii_v1.pdf',
        summary: '',
        analysis: 'Initial Basel III implementation establishing fundamental capital adequacy requirements and risk management standards for international banks.',
        changes: []
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'David Kim',
        content: 'Climate risk integration is complex but necessary. Risk team is evaluating third-party climate data providers.',
        timestamp: '2024-08-21 09:45'
      }
    ]
  },
  {
    id: '3',
    title: 'GDPR Privacy Amendment 2024',
    lastUpdated: '2024-07-10',
    status: 'validated',
    versions: [
      {
        id: 'v1',
        version: '1.0',
        uploadDate: '2024-07-10',
        fileName: 'gdpr_amendment_2024.pdf',
        summary: '',
        analysis: 'New GDPR amendment addressing AI and automated decision-making in financial services. This regulation requires explicit consent for AI-driven investment recommendations and enhanced transparency in algorithmic decision-making processes.',
        changes: []
      }
    ],
    comments: []
  }
];

const RegulationManagementPlatform: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>(mockRegulations);
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const selectedReg = regulations.find(r => r.id === selectedRegulation);
  
  // Safely get version data
  let currentVersionData = null;
  let previousVersionData = null;
  let isOldestVersion = false;
  
  if (selectedReg) {
    if (selectedVersion === 'latest') {
      currentVersionData = selectedReg.versions[0];
      previousVersionData = selectedReg.versions.length > 1 ? selectedReg.versions[1] : null;
    } else {
      const versionIndex = selectedReg.versions.findIndex(v => v.id === selectedVersion);
      if (versionIndex !== -1) {
        currentVersionData = selectedReg.versions[versionIndex];
        previousVersionData = versionIndex < selectedReg.versions.length - 1 ? selectedReg.versions[versionIndex + 1] : null;
      } else {
        // Fallback to latest if version not found
        currentVersionData = selectedReg.versions[0];
        previousVersionData = selectedReg.versions.length > 1 ? selectedReg.versions[1] : null;
      }
    }
    isOldestVersion = !previousVersionData;
  }

  const handleStatusChange = (regId: string) => {
    setRegulations(prev => prev.map(reg => 
      reg.id === regId 
        ? { ...reg, status: reg.status === 'pending' ? 'validated' : 'pending' }
        : reg
    ));
    // Simulate email notification
    alert('Email notification sent to team regarding status change.');
  };

  const handleDelete = (regId: string) => {
    if (window.confirm('Are you sure you want to delete this regulation?')) {
      setRegulations(prev => prev.filter(reg => reg.id !== regId));
      setSelectedRegulation(null);
    }
  };

  const handleAddRegulation = () => {
    if (!newTitle || !newFile) return;
    
    const newReg: Regulation = {
      id: Date.now().toString(),
      title: newTitle,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'pending',
      versions: [{
        id: 'v1',
        version: '1.0',
        uploadDate: new Date().toISOString().split('T')[0],
        fileName: newFile.name,
        summary: '',
        analysis: 'LLM analysis in progress...',
        changes: []
      }],
      comments: []
    };

    setRegulations(prev => [...prev, newReg]);
    setShowAddModal(false);
    setNewTitle('');
    setNewFile(null);
    alert('Email notification sent to team regarding new regulation upload.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Nomura Regulation Management</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Regulation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Regulation List */}
          <div className="w-1/3 bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Regulations</h2>
            </div>
            <div className="divide-y">
              {regulations.map((regulation) => (
                <div
                  key={regulation.id}
                  onClick={() => setSelectedRegulation(regulation.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRegulation === regulation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-500" />
                        <h3 className="font-medium text-gray-900 text-sm">{regulation.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Updated: {regulation.lastUpdated}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {regulation.status === 'validated' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <AlertCircle size={16} className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedReg ? (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Tab Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedReg.title}</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedReg.status === 'validated' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedReg.status.charAt(0).toUpperCase() + selectedReg.status.slice(1)}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Compare versions:</label>
                          <select
                            value={selectedVersion}
                            onChange={(e) => setSelectedVersion(e.target.value)}
                            className="text-sm border rounded px-2 py-1 bg-white"
                          >
                            <option value="latest">Latest vs Previous</option>
                            {selectedReg.versions.map((version, index) => (
                              <option key={version.id} value={version.id}>
                                Version {version.version} {index === 0 ? '(Latest)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedReg.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        <Mail size={14} />
                        {selectedReg.status === 'pending' ? 'Validate' : 'Mark Pending'}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedReg.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* File Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload size={16} />
                      <span className="font-medium">Update Regulation</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="w-full text-sm"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          alert('New version uploaded. Analysis in progress...');
                        }
                      }}
                    />
                  </div>

                  {/* Version Comparison */}
                  {currentVersionData && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {selectedReg.versions.length === 1 ? 'Initial Version Analysis' : 'Version Analysis & Comparison'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Current: v{currentVersionData.version}
                          </span>
                          {previousVersionData && (
                            <>
                              <span>vs</span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                Previous: v{previousVersionData.version}
                              </span>
                            </>
                          )}
                          {isOldestVersion && selectedReg.versions.length > 1 && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                              Oldest Version
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-700">
                          {currentVersionData.summary || 'Initial version - no comparison available'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Uploaded: {currentVersionData.uploadDate} • File: {currentVersionData.fileName}
                        </p>
                      </div>

                      {/* Show changes only if there are changes to display */}
                      {currentVersionData.changes.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <span>Changes from Previous Version</span>
                            {previousVersionData && (
                              <span className="text-sm text-gray-500">
                                (v{previousVersionData.version} → v{currentVersionData.version})
                              </span>
                            )}
                          </h4>
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <ul className="space-y-2">
                              {currentVersionData.changes.map((change, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span className="text-gray-700">{change}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Show upload prompt for single version */}
                      {selectedReg.versions.length === 1 && (
                        <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Upload size={16} className="text-blue-600" />
                            <h4 className="font-medium text-blue-900">Ready for Updates</h4>
                          </div>
                          <p className="text-blue-800 text-sm">
                            This is the initial version. Upload a new version to see comparative analysis and track regulatory changes.
                          </p>
                        </div>
                      )}

                      {/* Show no comparison message for oldest version */}
                      {isOldestVersion && selectedReg.versions.length > 1 && (
                        <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={16} className="text-amber-600" />
                            <h4 className="font-medium text-amber-900">Baseline Version</h4>
                          </div>
                          <p className="text-amber-800 text-sm">
                            This is the oldest version in our system. No comparison data available as there are no previous versions to compare against.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analysis Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Impact Analysis</h3>
                      <button
                        onClick={() => setEditingAnalysis(!editingAnalysis)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        <Edit3 size={14} />
                        {editingAnalysis ? 'Save' : 'Edit'}
                      </button>
                    </div>
                    {editingAnalysis ? (
                      <textarea
                        defaultValue={currentVersionData?.analysis || ''}
                        className="w-full h-32 p-3 border rounded-lg resize-none"
                        placeholder="Edit the analysis..."
                      />
                    ) : (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-800">{currentVersionData?.analysis || 'No analysis available'}</p>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Comments</h3>
                    <div className="space-y-3 mb-4">
                      {selectedReg.comments.map((comment) => (
                        <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                    />
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Regulation</h3>
                <p className="text-gray-500">Choose a regulation from the list to view details and manage versions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Regulation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Add New Regulation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Regulation Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter regulation title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Upload PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddRegulation}
                  disabled={!newTitle || !newFile}
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Add Regulation
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationManagementPlatform;