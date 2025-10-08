import React, { useRef, useState, useEffect } from 'react';
import { FileText, Plus, Upload, Edit3, Trash2, Mail, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Button } from '../components/ui/button';

interface Regulation {
  _id: string;
  title: string;
  version: string;
  lastUpdated: string;
  status: 'pending' | 'validated';
  versions: RegulationVersion[];
}

interface RegulationVersion {
  id: string;
  version: string;
  title?: string; // Custom title for the version
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
  comments?: Comment[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const DetailedChangesView: React.FC<{
  changes: DetailedChange[];
  onEdit: (changeId: string) => void;
  onStatusChange: (changeId: string, status: 'relevant' | 'not-relevant') => void;
  onDelete: (changeId: string) => void;
  onAddComment: (changeId: string, content: string) => void;
  editingChangeId: string | null;
  editedChanges: { [key: string]: DetailedChange };
  setEditedChanges: React.Dispatch<React.SetStateAction<{ [key: string]: DetailedChange }>>;
  tempStatus: { [key: string]: 'relevant' | 'not-relevant' };
  setTempStatus: React.Dispatch<React.SetStateAction<{ [key: string]: 'relevant' | 'not-relevant' }>>;
  statusFilter?: 'all' | 'relevant' | 'pending' | 'not-relevant';
}> = ({ changes, onEdit, onStatusChange, onDelete, onAddComment, editingChangeId, editedChanges, setEditedChanges, tempStatus, setTempStatus, statusFilter = 'all' }) => {
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

  // Filter changes based on the status filter
  const filteredChanges = statusFilter === 'all'
    ? changes
    : changes.filter(change => {
      if (statusFilter === 'pending') {
        return !change.status || change.status === 'pending';
      }
      return change.status === statusFilter;
    });

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

  if (filteredChanges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Info size={48} className="mx-auto mb-4 text-gray-400" />
        {statusFilter !== 'all' ? (
          <div>
            <p className="mb-2">No {statusFilter === 'pending' ? 'pending' : statusFilter === 'relevant' ? 'relevant' : 'not relevant'} changes found for this version.</p>
            <p className="text-sm">Try switching to "All Changes" to see all detected changes.</p>
          </div>
        ) : (
          <p>No detailed changes available for this version.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusFilter !== 'all' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-blue-600" />
            <p className="text-blue-800 text-sm">
              Showing only {statusFilter === 'pending' ? 'pending review' : statusFilter === 'relevant' ? 'relevant' : 'not relevant'} changes ({filteredChanges.length} of {changes.length} changes)
            </p>
          </div>
        </div>
      )}
      {filteredChanges.map((change, filteredIndex) => {
        const isExpanded = expandedChanges.has(change.id);
        const isEditing = editingChangeId === change.id;
        const editedChange = editedChanges[change.id] || change;
        // Calculate the original index for display
        const originalIndex = changes.findIndex(c => c.id === change.id);

        return (
          <div key={change.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Button variant={"ghost"}
                      onClick={() => toggleExpand(change.id)}
                      className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="font-medium">Change {originalIndex + 1}</span>
                    </Button>
                    <span className={`px-2 py-1 text-xs rounded-full ${change.type === 'modification' ? 'bg-blue-100 text-blue-800' :
                      change.type === 'procedural change' ? 'bg-green-100 text-green-800' :
                        change.type === 'penalty change' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {change.type}

                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${change.status === 'relevant' ? 'bg-green-100 text-green-800' :
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


                  <h5 className="font-medium mb-2">Summary</h5>
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


                <div className="flex items-center gap-2 ml-4">
                  {/* Status buttons for pending changes */}
                  {(change.status === 'pending' || change.status === undefined || !change.status) && (
                    <>
                      <Button variant="outline"
                        onClick={() => onStatusChange(change.id, 'relevant')}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-green-300 rounded hover:bg-green-50 text-green-700"
                      >
                        <CheckCircle size={12} />
                        Mark Relevant
                      </Button>
                      <Button variant="outline"
                        onClick={() => onStatusChange(change.id, 'not-relevant')}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-red-300 rounded hover:bg-red-50 text-red-700"
                      >
                        <AlertCircle size={12} />
                        Not Relevant
                      </Button>
                    </>
                  )}

                  {/* Status editing options - only show when editing */}
                  {isEditing && (change.status === 'relevant' || change.status === 'not-relevant') && (
                    <div className="flex items-center gap-1">
                      <Button variant="outline"
                        onClick={() => setTempStatus({ ...tempStatus, [change.id]: 'relevant' })}
                        className={`flex items-center gap-1 px-2 py-1 text-xs border rounded ${tempStatus[change.id] === 'relevant'
                          ? 'border-green-500 bg-green-100 text-green-800'
                          : 'border-green-300 hover:bg-green-50 text-green-700'}`}
                      >
                        <CheckCircle size={12} />
                        Relevant
                      </Button>
                      <Button variant="outline"
                        onClick={() => setTempStatus({ ...tempStatus, [change.id]: 'not-relevant' })}
                        className={`flex items-center gap-1 px-2 py-1 text-xs border rounded ${tempStatus[change.id] === 'not-relevant'
                          ? 'border-red-500 bg-red-100 text-red-800'
                          : 'border-red-300 hover:bg-red-50 text-red-700'}`}
                      >
                        <AlertCircle size={12} />
                        Not Relevant
                      </Button>
                    </div>
                  )}

                  <Button variant="outline"
                    onClick={() => onEdit(change.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    <Edit3 size={14} />
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                  <Button variant="outline"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this change? This action cannot be undone.')) {
                        onDelete(change.id);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
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

                {/* Comments Section for this change */}
                <div className="border-t pt-4">
                  <h5 className="font-medium mb-3">Comments</h5>
                  <div className="space-y-3 mb-4">
                    {(change.comments || []).map((comment) => (
                      <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={newComments[change.id] || ''}
                      onChange={(e) => setNewComments(prev => ({ ...prev, [change.id]: e.target.value }))}
                      placeholder="Add a comment about this change..."
                      className="w-full p-3 border rounded-lg resize-none text-sm"
                      rows={2}
                    />
                    <Button variant="secondary" 
                      onClick={() => {
                        const content = newComments[change.id];
                        if (content && content.trim()) {
                          onAddComment(change.id, content.trim());
                          setNewComments(prev => ({ ...prev, [change.id]: '' }));
                        }
                      }}
                      disabled={!newComments[change.id] || !newComments[change.id].trim()}
                      className="px-4 py-2  disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      Add Comment
                    </Button>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
  const [editedChanges, setEditedChanges] = useState<{ [key: string]: DetailedChange }>({});
  const [newTitle, setNewTitle] = useState('');
  const [newVersionTitle, setNewVersionTitle] = useState(''); // For add regulation version title
  const [updateVersionTitle, setUpdateVersionTitle] = useState(''); // For update regulation version title
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isAddingRegulation, setIsAddingRegulation] = useState(false);
  const [isUpdatingRegulation, setIsUpdatingRegulation] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'relevant' | 'pending' | 'not-relevant'>('all'); // Filter for changes by status
  const [tempStatus, setTempStatus] = useState<{ [key: string]: 'relevant' | 'not-relevant' }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch regulations on component mount
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        setLoading(true);

        const response = await fetch('http://127.0.0.1:9000/regulations');

        if (!response.ok) {
          throw new Error(`Failed to fetch regulations: ${response.statusText}`);
        }

        const data = await response.json();

        // console.log(data)

        // Sort versions within each regulation to ensure latest version is first
        const sortedData = data.map((regulation: Regulation) => ({
          ...regulation,
          versions: [...regulation.versions].sort((a, b) => {
            // First try to sort by version number (assuming semantic versioning like "2.0", "1.0")
            const versionA = parseFloat(a.version);
            const versionB = parseFloat(b.version);

            if (!isNaN(versionA) && !isNaN(versionB)) {
              return versionB - versionA; // Descending order (latest first)
            }

            // Fallback to sorting by upload date if version parsing fails
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
          })
        }));

        setRegulations(sortedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching regulations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch regulations');
      } finally {
        setLoading(false);
      }
    };

    fetchRegulations();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading regulations...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && regulations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Regulations</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="outline"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  const selectedReg = regulations.find(r => r._id === selectedRegulation);

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

  // console.log(selectedReg)
  // console.log(currentVersionData)

  // Change from pending to verified or vice versa for whole
  const handleStatusChange = (regId: string) => {
    setRegulations(prev => prev.map(reg =>
      reg._id === regId
        ? { ...reg, status: reg.status === 'pending' ? 'validated' : 'pending' }
        : reg
    ));
    // Simulate email notification
    alert('Email notification sent to team regarding status change.');
  };

  // add brand new regulation
  const handleAddRegulation = async () => {
    if (!newTitle || !newFile || !newVersionTitle) return;

    setIsAddingRegulation(true);

    try {
      // Prepare form data to send to backend
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("file", newFile);
      formData.append("version", newVersionTitle.trim());

      // POST to backend
      const res = await fetch("http://127.0.0.1:9000/regulations", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload PDF");
      }

      const resData = await res.json();

      const newReg: Regulation = {
        _id: resData.id,
        title: newTitle,
        version: newVersionTitle,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'pending',
        versions: []
      };

      setRegulations((prev) => [...prev, newReg]);
      setShowAddModal(false);
      setNewTitle("");
      setNewVersionTitle("");
      setNewFile(null);
      alert("Email notification sent to team regarding new regulation upload.");
    } catch (err) {
      console.error(err);
      alert("Error uploading regulation. Please try again.");
    } finally {
      setIsAddingRegulation(false);
    }
  };

  // updating regulation with new version of it
  const handleUpdateRegulation = async (file: File | null | undefined) => {
    if (!file) {
      alert("Please select a PDF file.");
      return;
    }

    setIsUpdatingRegulation(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (updateVersionTitle.trim()) {
        formData.append("version", updateVersionTitle.trim());
      }

      const regId = selectedReg?._id;

      const res = await fetch(`http://127.0.0.1:9000/regulations/${regId}/versions`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMessage =
          data.detail && typeof data.detail === 'object' && 'details' in data.detail
            ? data.detail.details
            : data.detail;
        throw new Error(errorMessage);
      }

      const updatedRegulations = regulations.map((reg) =>
        reg._id === selectedReg?._id
          ? { ...reg, versions: [data.version, ...reg.versions] }
          : reg
      );

      setRegulations(updatedRegulations);
      setNewFile(null);
      setUpdateVersionTitle("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("Email notification sent to team regarding new regulation version upload.");
    } catch (err) {
      console.error(err);
      alert(err);
    } finally {
      setIsUpdatingRegulation(false);
    }
  };

  // Editing changes
  const handleEditChange = async (changeId: string) => {
    if (editingChangeId === changeId) {
      // Save the edited change
      const editedChange = editedChanges[changeId];
      const newStatus = tempStatus[changeId];
      const change = currentVersionData?.detailedChanges?.find(dc => dc.id === changeId);

      if (editedChange && selectedReg && currentVersionData) {
        // Update content locally
        setRegulations(prev => prev.map(reg =>
          reg._id === selectedReg._id
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

      // Handle status change if there's a new status
      if (newStatus && change && newStatus !== change.status) {
        await handleChangeStatusUpdate(changeId, newStatus);
      }

      // Clean up editing state
      setEditingChangeId(null);
      setEditedChanges(prev => {
        const newState = { ...prev };
        delete newState[changeId];
        return newState;
      });
      setTempStatus(prev => {
        const newTemp = { ...prev };
        delete newTemp[changeId];
        return newTemp;
      });
    } else {
      // Start editing
      const change = currentVersionData?.detailedChanges?.find(dc => dc.id === changeId);
      if (change) {
        setEditedChanges(prev => ({ ...prev, [changeId]: { ...change } }));
        setEditingChangeId(changeId);
        // Initialize temporary status if the change has a status
        if (change.status === 'relevant' || change.status === 'not-relevant') {
          setTempStatus(prev => ({ ...prev, [changeId]: change.status as 'relevant' | 'not-relevant' }));
        }
      }
    }
  };

  // Handle status change for flagged changes
  const handleChangeStatusUpdate = async (changeId: string, status: 'relevant' | 'not-relevant') => {
    if (!selectedReg || !currentVersionData) return;

    try {
      // Call backend API
      const versionIndex = selectedReg.versions.findIndex(v => v.id === currentVersionData!.id);
      const changeIndex = currentVersionData.detailedChanges?.findIndex(dc => dc.id === changeId);

      if (versionIndex === -1 || changeIndex === undefined || changeIndex === -1) {
        console.error("Version index or change index not found");
        return;
      }
      // console.log(selectedReg)
      // console.log(selectedReg._id, versionIndex, changeIndex)
      // console.log("Frontend order:", selectedReg.versions.map(v => v.id));

      const response = await fetch(
        `http://127.0.0.1:9000/regulations/${selectedReg._id}/versions/${currentVersionData.id}/changes/${changeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ new_status: status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update status:", errorData.detail || response.statusText);
        throw new Error(errorData.detail);
      }

      // Update local state after successful backend update
      setRegulations(prev =>
        prev.map(reg =>
          reg._id === selectedReg._id
            ? {
              ...reg,
              versions: reg.versions.map(v =>
                v.id === currentVersionData?.id // use optional chaining
                  ? {
                    ...v,
                    detailedChanges: v.detailedChanges?.map(dc =>
                      dc.id === changeId ? { ...dc, status } : dc
                    ) || [],
                  }
                  : v
              ),
            }
            : reg
        )
      );

    } catch (error) {
      alert(error);
    }
  };

  // delete regulation
  const handleDelete = (regId: string) => {
    if (window.confirm('Are you sure you want to delete this regulation?')) {
      setRegulations(prev => prev.filter(reg => reg._id !== regId));
      setSelectedRegulation(null);
      setShowDeleteModal(false);
      console.log(selectedReg?._id)
      alert('Regulation deleted successfully.');
    }
  };
  
  // Handle delete change
  const handleDeleteChange = async (changeId: string) => {
    if (!selectedReg || !currentVersionData) return;

    try {
      // Call backend API to delete the change

      // TODO update the endpoint according to backend
      const response = await fetch(
        `http://127.0.0.1:9000/regulations/${selectedReg._id}/versions/${currentVersionData.id}/changes/${changeId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete change:", errorData.detail || response.statusText);
        alert("Failed to delete change. Please try again.");
        return;
      }

      // Update local state after successful backend deletion
      setRegulations(prev =>
        prev.map(reg =>
          reg._id === selectedReg._id
            ? {
              ...reg,
              versions: reg.versions.map(v =>
                v.id === currentVersionData?.id
                  ? {
                    ...v,
                    detailedChanges: v.detailedChanges?.filter(dc => dc.id !== changeId) || [],
                  }
                  : v
              ),
            }
            : reg
        )
      );

      // Clear any editing state for the deleted change
      if (editingChangeId === changeId) {
        setEditingChangeId(null);
        setEditedChanges(prev => {
          const newState = { ...prev };
          delete newState[changeId];
          return newState;
        });
      }

      // Clear any temp status for the deleted change
      setTempStatus(prev => {
        const newState = { ...prev };
        delete newState[changeId];
        return newState;
      });

    } catch (error) {
      console.error("Error deleting change:", error);
      alert("Error deleting change. Please try again.");
    }
  };

  // Handle add comment to change
  const handleAddComment = async (changeId: string, content: string) => {
    if (!selectedReg || !currentVersionData || !content.trim()) return;

    try {
      // Create new comment
      const newComment: Comment = {
        id: Date.now().toString(), // Simple ID generation - in production, this should come from backend
        author: 'Current User', // In production, this should come from authentication
        content: content.trim(),
        timestamp: new Date().toLocaleString()
      };

      // Update local state
      setRegulations(prev =>
        prev.map(reg =>
          reg._id === selectedReg._id
            ? {
                ...reg,
                versions: reg.versions.map(v =>
                  v.id === currentVersionData?.id
                    ? {
                        ...v,
                        detailedChanges: v.detailedChanges?.map(dc =>
                          dc.id === changeId 
                            ? { ...dc, comments: [...(dc.comments || []), newComment] }
                            : dc
                        ) || [],
                      }
                    : v
                ),
              }
            : reg
        )
      );

      // TODO: Call backend API to save the comment
      // const response = await fetch(`http://127.0.0.1:9000/regulations/${selectedReg._id}/versions/${currentVersionData.id}/changes/${changeId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: content.trim() })
      // });

    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment. Please try again.");
    }
  };

  return (

    <div className="min-h-screen bg-gray-50">
      {/* Show error banner if there was an error */}
      {error && regulations.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-yellow-700">
              Unable to fetch latest data. Showing cached results. Error: {error}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Nomura Regulation Management</h1>
            <Button variant="outline"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Regulation
            </Button>
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
                  key={regulation._id}
                  onClick={() => setSelectedRegulation(regulation._id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRegulation === regulation._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
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
                        <span className={`px-2 py-1 text-xs rounded-full ${selectedReg.status === 'validated'
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
                                {version.version} {version.title ? `- ${version.title}` : ''} {index === 0 ? '(Latest)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline"
                        onClick={() => handleStatusChange(selectedReg._id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        <Mail size={14} />
                        {selectedReg.status === 'pending' ? 'Validate' : 'Mark Pending'}
                      </Button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
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
                      {isUpdatingRegulation && (
                        <span className="text-sm text-blue-600">Uploading...</span>
                      )}
                    </div>

                    {isUpdatingRegulation && (
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Processing document and analyzing changes...</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Version Title</label>
                        <input
                          type="text"
                          value={updateVersionTitle}
                          onChange={(e) => setUpdateVersionTitle(e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="e.g., 'September 2024 Amendment', 'Post-Brexit Update'..."
                          disabled={isUpdatingRegulation}
                        />
                        <p className="text-xs text-gray-500 mt-1">Give this version a descriptive title to help identify it later</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Select PDF File</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          className="w-full text-sm"
                          disabled={isUpdatingRegulation}
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setNewFile(file);
                          }}
                        />
                      </div>
                    </div>

                    {newFile && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Selected: {newFile.name}</p>
                        <Button variant="outline"
                          onClick={() => handleUpdateRegulation(newFile)}
                          disabled={!updateVersionTitle || !newFile || isUpdatingRegulation}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                        >
                          {isUpdatingRegulation ? 'Uploading...' : 'Upload New Version'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Version Comparison */}
                  {currentVersionData && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {selectedReg.versions.length === 1 ? 'Initial Version Analysis' : 'Version Analysis & Comparison'}
                          <p className="text-xs text-gray-500 mt-1">Previous Version upload date: {currentVersionData.uploadDate}</p>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Current: {currentVersionData.version}{currentVersionData.title ? ` - ${currentVersionData.title}` : ''}
                          </span>
                          {previousVersionData && (
                            <>
                              <span>vs</span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                Previous: {previousVersionData.version}{previousVersionData.title ? ` - ${previousVersionData.title}` : ''}
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
                                ({previousVersionData.version} → {currentVersionData.version})
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm text-gray-600">Filter changes:</label>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'relevant' | 'pending' | 'not-relevant')}
                              className="text-sm border rounded px-2 py-1 bg-white"
                            >
                              <option value="all">All Changes</option>
                              <option value="relevant">Relevant Only</option>
                              <option value="pending">Pending Review</option>
                              <option value="not-relevant">Not Relevant</option>
                            </select>
                          </div>
                          <DetailedChangesView
                            changes={currentVersionData.detailedChanges}
                            onEdit={handleEditChange}
                            onStatusChange={handleChangeStatusUpdate}
                            onDelete={handleDeleteChange}
                            onAddComment={handleAddComment}
                            editingChangeId={editingChangeId}
                            editedChanges={editedChanges}
                            setEditedChanges={setEditedChanges}
                            tempStatus={tempStatus}
                            setTempStatus={setTempStatus}
                            statusFilter={statusFilter}
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

            {isAddingRegulation && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Uploading regulation and initializing analysis...</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Regulation Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter regulation title..."
                  disabled={isAddingRegulation}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Version Title</label>
                <input
                  type="text"
                  value={newVersionTitle}
                  onChange={(e) => setNewVersionTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 'Initial Release', 'Q3 2024 Update'..."
                  disabled={isAddingRegulation}
                />
                <p className="text-xs text-gray-500 mt-1">Give this version a descriptive title to help identify it later</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Upload PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-lg"
                  disabled={isAddingRegulation}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline"
                  onClick={handleAddRegulation}
                  disabled={!newTitle || !newFile || !newVersionTitle || isAddingRegulation}
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isAddingRegulation ? 'Adding...' : 'Add Regulation'}
                </Button>
                <Button variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewTitle("");
                    setNewVersionTitle("");
                    setNewFile(null);
                  }}
                  className="flex-1 py-2 border rounded hover:bg-gray-50"
                  disabled={isAddingRegulation}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Regulation</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{selectedReg?.title}</strong>? This action cannot be undone and will permanently remove all versions and associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (selectedReg?._id) {
                    handleDelete(selectedReg._id);
                  }
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Regulation
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationManagementPlatform;
