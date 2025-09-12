import React, { useState } from 'react';
import { FileText, Plus, Upload, Edit3, Trash2, Mail, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Info } from 'lucide-react';

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
    title: 'EU Cookie Consent Regulation 2024',
    lastUpdated: '2024-09-01',
    status: 'pending',
    versions: [
      {
        id: 'v2',
        version: '2.0',
        uploadDate: '2024-09-01',
        fileName: 'eu_cookie_consent_v2.pdf',
        detailedChanges: [
          {
            id: "change-1",
            summary: "The updated regulation intensifies enforcement on prior consent and explicitly prohibits pre-ticked boxes and dark patterns in cookie consent mechanisms.",
            analysis: "This change reflects a stricter regulatory stance emphasizing that consent must be freely given, specific, informed, and unambiguous. It affects all website operators targeting EU users, requiring them to redesign cookie banners to avoid manipulative designs and ensure no cookies are set before consent. This raises compliance costs but enhances user privacy protection.",
            change: "Explicit prohibition of pre-ticked boxes and dark patterns; requirement that no non-essential cookies be set before active user consent.",
            before_quote: '"Consent must be obtained before any cookies are set, and pre-ticked boxes or implied consent are not valid." (Page 5, Section 3.2)',
            after_quote: '"Consent must be freely given, specific, informed, and unambiguous. Pre-ticked boxes or any form of default consent are prohibited. No cookies may be set prior to obtaining explicit consent." (Page 6, Section 3.2)',
            type: "modification",
            confidence: 1.00
          },
          {
            id: "change-2",
            summary: "The new regulation mandates granular consent options for different cookie categories rather than a single blanket acceptance.",
            analysis: "This change requires websites to provide users with clear choices to accept or reject specific categories such as analytics, advertising, and functionality cookies. It increases transparency and user control but may complicate consent management for businesses. This aligns with GDPR principles and addresses user demand for more nuanced privacy controls.",
            change: "Introduction of mandatory granular consent controls for cookie categories.",
            before_quote: '"Consent may be obtained via a single acceptance mechanism covering all cookies used." (Page 7, Section 4.1)',
            after_quote: '"Users must be provided with granular controls to consent to individual categories of cookies, including analytics, advertising, and functional cookies." (Page 8, Section 4.1)',
            type: "modification",
            confidence: 1.00
          },
          {
            id: "change-3",
            summary: "The updated regulation requires maintaining detailed records of user consent for auditability and compliance verification.",
            analysis: "This procedural change obliges data controllers to keep verifiable logs of consent, including timestamps, categories accepted or declined, and user location. This facilitates regulatory audits and enforcement actions, increasing accountability but also administrative burden on organizations.",
            change: "Requirement to maintain detailed, auditable records of consent.",
            before_quote: '"Controllers should keep records of consent but no specific format or detail is mandated." (Page 9, Section 5.3)',
            after_quote: '"Controllers must maintain verifiable records of each user\'s consent preferences, including timestamps, categories consented to or declined, and user location, to ensure auditability." (Page 10, Section 5.3)',
            type: "procedural change",
            confidence: 1.00
          },
          {
            id: "change-4",
            summary: "The new regulation clarifies that legitimate interest cannot be used as a legal basis for setting analytics or advertising cookies without consent.",
            analysis: "This narrows the scope of lawful cookie use, emphasizing that consent is the only valid legal basis for non-essential cookies. It impacts businesses relying on legitimate interest to avoid consent mechanisms, requiring them to obtain explicit consent or cease such cookie use.",
            change: "Removal of legitimate interest as a legal basis for analytics and advertising cookies.",
            before_quote: '"Legitimate interest may be used as a legal basis for analytics cookies under certain conditions." (Page 11, Section 6.2)',
            after_quote: '"Legitimate interest is not a valid legal basis for setting analytics or advertising cookies; explicit consent is required." (Page 12, Section 6.2)',
            type: "modification",
            confidence: 1.00
          },
          {
            id: "change-5",
            summary: "The updated regulation introduces stricter penalties and enforcement mechanisms for non-compliance, including higher fines and faster investigation timelines.",
            analysis: "This change signals a shift from warnings to active enforcement with significant financial consequences for violations. It increases the risk for organizations that fail to comply, incentivizing prompt and thorough adherence to cookie consent rules.",
            change: "Increased penalties and accelerated enforcement procedures.",
            before_quote: '"Penalties for non-compliance may include fines up to €20 million or 4% of global turnover." (Page 13, Section 7.1)',
            after_quote: '"Penalties have been increased, with fines up to €40 million or 6% of global turnover, and enforcement actions will be expedited to ensure swift compliance." (Page 14, Section 7.1)',
            type: "penalty change",
            confidence: 0.95
          }
        ]
      },
      {
        id: 'v1',
        version: '1.0',
        uploadDate: '2024-01-10',
        fileName: 'eu_cookie_consent_v1.pdf',
        detailedChanges: []
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Sarah Chen',
        content: 'The prohibition of dark patterns will require complete redesign of our consent banners across all digital platforms. We need to audit current implementations immediately.',
        timestamp: '2024-09-02 10:30'
      },
      {
        id: 'c2',
        author: 'Michael Rodriguez',
        content: 'Legal team confirms that legitimate interest can no longer be used for analytics cookies. This will significantly impact our data collection capabilities.',
        timestamp: '2024-09-02 14:15'
      },
      {
        id: 'c3',
        author: 'David Kim',
        content: 'The increased penalties (€40M or 6% of turnover) make this a critical compliance priority. Recommend immediate project kickoff.',
        timestamp: '2024-09-03 09:00'
      }
    ]
  },
  {
    id: '2',
    title: 'MiFID II Investment Services',
    lastUpdated: '2024-08-01',
    status: 'validated',
    versions: [
      {
        id: 'v4',
        version: '4.0',
        uploadDate: '2024-09-01',
        fileName: 'mifid_ii_v4.pdf',
        detailedChanges: []
      },
      {
        id: 'v3',
        version: '3.0',
        uploadDate: '2024-06-15',
        fileName: 'mifid_ii_v3.pdf',
        detailedChanges: []
      },
      {
        id: 'v2',
        version: '2.0',
        uploadDate: '2024-03-15',
        fileName: 'mifid_ii_v2.pdf',
        detailedChanges: []
      },
      {
        id: 'v1',
        version: '1.0',
        uploadDate: '2024-01-10',
        fileName: 'mifid_ii_v1.pdf',
        detailedChanges: []
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Sarah Chen',
        content: 'The ESG requirements in v4.0 will require significant IT infrastructure changes. We should prioritize the algorithmic trading controls.',
        timestamp: '2024-08-16 10:30'
      },
      {
        id: 'c2',
        author: 'Michael Rodriguez',
        content: 'Compliance team is already working on the ESG scoring methodology. Timeline looks tight for Q1 2025.',
        timestamp: '2024-08-16 14:15'
      }
    ]
  },
  {
    id: '3',
    title: 'Basel III Capital Requirements',
    lastUpdated: '2024-08-20',
    status: 'validated',
    versions: [
      {
        id: 'v3',
        version: '3.0',
        uploadDate: '2024-08-20',
        fileName: 'basel_iii_v3.pdf',
        detailedChanges: []
      },
      {
        id: 'v2',
        version: '2.0',
        uploadDate: '2024-05-15',
        fileName: 'basel_iii_v2.pdf',
        detailedChanges: []
      },
      {
        id: 'v1',
        version: '1.0',
        uploadDate: '2024-01-10',
        fileName: 'basel_iii_v1.pdf',
        detailedChanges: []
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
    id: '4',
    title: 'GDPR Privacy Amendment 2024',
    lastUpdated: '2024-07-10',
    status: 'validated',
    versions: [
      {
        id: 'v1',
        version: '1.0',
        uploadDate: '2024-07-10',
        fileName: 'gdpr_amendment_2024.pdf',
        detailedChanges: []
      }
    ],
    comments: []
  }
];

const DetailedChangesView: React.FC<{ 
  changes: DetailedChange[]; 
  onEdit: (changeId: string) => void;
  editingChangeId: string | null;
  editedChanges: {[key: string]: DetailedChange};
  setEditedChanges: React.Dispatch<React.SetStateAction<{[key: string]: DetailedChange}>>;
}> = ({ changes, onEdit, editingChangeId, editedChanges, setEditedChanges }) => {
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

  const toggleExpand = (changeId: string) => {
    const newExpanded = new Set(expandedChanges);
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId);
    } else {
      newExpanded.add(changeId);
    }
    setExpandedChanges(newExpanded);
  };

  const handleFieldChange = (changeId: string, field: keyof DetailedChange, value: string | number) => {
    setEditedChanges(prev => ({
      ...prev,
      [changeId]: {
        ...prev[changeId],
        [field]: value
      }
    }));
  };

  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Info size={48} className="mx-auto mb-4 text-gray-400" />
        <p>No detailed changes available for this version.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changes.map((change, index) => {
        const isExpanded = expandedChanges.has(change.id);
        const isEditing = editingChangeId === change.id;
        const editedChange = editedChanges[change.id] || change;

        return (
          <div key={change.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleExpand(change.id)}
                      className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="font-medium">Change {index + 1}</span>
                    </button>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      change.type === 'modification' ? 'bg-blue-100 text-blue-800' :
                      change.type === 'procedural change' ? 'bg-green-100 text-green-800' :
                      change.type === 'penalty change' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {change.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      Confidence: {(change.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <textarea
                      value={editedChange.summary}
                      onChange={(e) => handleFieldChange(change.id, 'summary', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-700 text-sm">{change.summary}</p>
                  )}
                </div>
                
                <button
                  onClick={() => onEdit(change.id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50 ml-4"
                >
                  <Edit3 size={14} />
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Analysis</h5>
                  {isEditing ? (
                    <textarea
                      value={editedChange.analysis}
                      onChange={(e) => handleFieldChange(change.id, 'analysis', e.target.value)}
                      className="w-full p-3 border rounded text-sm"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">{change.analysis}</p>
                  )}
                </div>

                <div>
                  <h5 className="font-medium mb-2">Change Description</h5>
                  {isEditing ? (
                    <textarea
                      value={editedChange.change}
                      onChange={(e) => handleFieldChange(change.id, 'change', e.target.value)}
                      className="w-full p-3 border rounded text-sm"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded">{change.change}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2 text-red-700">Before (Original Text)</h5>
                    {isEditing ? (
                      <textarea
                        value={editedChange.before_quote}
                        onChange={(e) => handleFieldChange(change.id, 'before_quote', e.target.value)}
                        className="w-full p-3 border rounded text-sm"
                        rows={3}
                      />
                    ) : (
                      <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                        <p className="text-sm text-gray-700 italic">{change.before_quote}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2 text-green-700">After (Updated Text)</h5>
                    {isEditing ? (
                      <textarea
                        value={editedChange.after_quote}
                        onChange={(e) => handleFieldChange(change.id, 'after_quote', e.target.value)}
                        className="w-full p-3 border rounded text-sm"
                        rows={3}
                      />
                    ) : (
                      <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                        <p className="text-sm text-gray-700 italic">{change.after_quote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const RegulationManagementPlatform: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>(mockRegulations);
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
  const [editedChanges, setEditedChanges] = useState<{[key: string]: DetailedChange}>({});
  const [newTitle, setNewTitle] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const selectedReg = regulations.find(r => r.id === selectedRegulation);
  
  // Safely get version data
  let currentVersionData: RegulationVersion | null = null;
  let previousVersionData: RegulationVersion | null = null;
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

  // Change from pending to verified or vice versa
  const handleStatusChange = (regId: string) => {
    setRegulations(prev => prev.map(reg => 
      reg.id === regId 
        ? { ...reg, status: reg.status === 'pending' ? 'validated' : 'pending' }
        : reg
    ));
    // Simulate email notification
    alert('Email notification sent to team regarding status change.');
  };

  // delete regulation
  const handleDelete = (regId: string) => {
    if (window.confirm('Are you sure you want to delete this regulation?')) {
      setRegulations(prev => prev.filter(reg => reg.id !== regId));
      setSelectedRegulation(null);
    }
  };

  const testCORS = async () => {
  try {
    console.log("Testing CORS with GET request...");
    
    const response = await fetch("http://localhost:9000/hello", {
      method: "GET"
    });
    
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    
    if (!response.ok) {
      console.error("Response not ok:", response.status);
      return;
    }
    
    const data = await response.json();
    console.log("Response data:", data);
    alert("CORS is working! Got: " + data.message);
    
  } catch (error) {
    console.error("CORS test failed:", error);
  }
};


  // add brand new regulation
  const handleAddRegulation = async () => {
  if (!newTitle || !newFile) return;

  try {
    // Prepare form data to send to backend
    const formData = new FormData();
    formData.append("file", newFile);

    // POST to backend
    const res = await fetch("http://127.0.0.1:9000/upload-pdf", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload PDF");
    }

    const data = await res.json(); 
    // data contains { filename, content_type, location }

    const today = new Date().toISOString().split("T")[0];

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
        detailedChanges: []
      }],
      comments: []
    };

    setRegulations((prev) => [...prev, newReg]);
    setShowAddModal(false);
    setNewTitle("");
    setNewFile(null);
    alert("Email notification sent to team regarding new regulation upload.");
  } catch (err) {
    console.error(err);
    alert("Error uploading regulation. Please try again.");
  }
};


  const handleEditChange = (changeId: string) => {
    if (editingChangeId === changeId) {
      // Save the edited change
      const editedChange = editedChanges[changeId];
      if (editedChange && selectedReg && currentVersionData) {
        setRegulations(prev => prev.map(reg => 
          reg.id === selectedReg.id 
            ? {
                ...reg,
                versions: reg.versions.map(v => 
                  v.id === currentVersionData!.id 
                    ? { 
                        ...v, 
                        detailedChanges: v.detailedChanges?.map(dc => 
                          dc.id === changeId ? editedChange : dc
                        ) || []
                      }
                    : v
                )
              }
            : reg
        ));
      }
      setEditingChangeId(null);
      setEditedChanges(prev => {
        const newState = { ...prev };
        delete newState[changeId];
        return newState;
      });
    } else {
      // Start editing
      const change = currentVersionData?.detailedChanges?.find(dc => dc.id === changeId);
      if (change) {
        setEditedChanges(prev => ({ ...prev, [changeId]: { ...change } }));
        setEditingChangeId(changeId);
      }
    }
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
<button onClick={testCORS}>Test CORS</button>
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

                      {/* Show detailed changes if available */}
                      {currentVersionData.detailedChanges && currentVersionData.detailedChanges.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <span>Detailed Changes Analysis</span>
                            {previousVersionData && (
                              <span className="text-sm text-gray-500">
                                (v{previousVersionData.version} → v{currentVersionData.version})
                              </span>
                            )}
                          </h4>
                          <DetailedChangesView 
                            changes={currentVersionData.detailedChanges}
                            onEdit={handleEditChange}
                            editingChangeId={editingChangeId}
                            editedChanges={editedChanges}
                            setEditedChanges={setEditedChanges}
                          />
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
