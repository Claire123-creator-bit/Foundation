import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiClient';
import API_BASE from '../utils/apiConfig';
import './MediaGallery.css';

function MediaGallery() {
  const [sections, setSections] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bulkProgress, setBulkProgress] = useState('');
  const [message, setMessage] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDesc, setNewSectionDesc] = useState('');
  const [showNewSection, setShowNewSection] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([apiFetch('/activities'), apiFetch('/media')]);
      setSections(Array.isArray(s) ? s : []);
      setMedia(Array.isArray(m) ? m : []);
    } catch (e) {
      setMessage(`Error loading: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath) => {
    if (filePath.startsWith('http')) return filePath;
    return `${API_BASE}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    try {
      const data = await apiFetch('/activities', {
        method: 'POST',
        body: JSON.stringify({ title: newSectionTitle.trim(), description: newSectionDesc.trim() }),
      });
      if (data.success) {
        setMessage(`Section "${newSectionTitle}" created`);
        setNewSectionTitle(''); setNewSectionDesc('');
        setShowNewSection(false);
        await loadAll();
      } else {
        setMessage(data.error || 'Failed to create section');
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
  };

  const handleDeleteSection = async (id, title) => {
    if (!window.confirm(`Delete section "${title}"? Photos in it will become unsectioned.`)) return;
    try {
      const response = await fetch(`${API_BASE}/activities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (data.success) { setMessage('Section deleted'); await loadAll(); }
      else setMessage(data.error || 'Failed');
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
  };

  const uploadSingle = async (file, titleVal, descVal, activityId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', titleVal || file.name);
    formData.append('description', descVal || '');
    formData.append('media_type', 'image');
    if (activityId) formData.append('activity_id', activityId);
    const response = await fetch(`${API_BASE}/media-upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    return response.json();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) { setMessage('Please select files'); return; }
    setUploading(true); setMessage('');
    if (selectedFiles.length === 1) {
      const data = await uploadSingle(selectedFiles[0], title, description, selectedSection);
      if (data.success) {
        setMessage('Uploaded successfully');
        setTitle(''); setDescription(''); setSelectedFiles([]);
        await loadAll();
      } else {
        setMessage(`Upload failed: ${data.message || data.error}`);
      }
    } else {
      let success = 0, failed = 0;
      for (let i = 0; i < selectedFiles.length; i++) {
        setBulkProgress(`Uploading ${i + 1} of ${selectedFiles.length}...`);
        try {
          const data = await uploadSingle(selectedFiles[i], selectedFiles[i].name, '', selectedSection);
          if (data.success) success++; else failed++;
        } catch { failed++; }
      }
      setBulkProgress('');
      setMessage(`Done: ${success} uploaded, ${failed} failed`);
      setSelectedFiles([]);
      await loadAll();
    }
    setUploading(false);
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      const response = await fetch(`${API_BASE}/media/${mediaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (data.success) { setMessage('Deleted'); await loadAll(); }
      else setMessage(`Delete failed: ${data.message || data.error}`);
    } catch (e) { setMessage(`Error: ${e.message}`); }
  };

  const handleEdit = async (mediaId) => {
    try {
      const response = await fetch(`${API_BASE}/media/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      const data = await response.json();
      if (data.success) { setMessage('Updated'); setEditingId(null); await loadAll(); }
      else setMessage(`Update failed: ${data.message || data.error}`);
    } catch (e) { setMessage(`Error: ${e.message}`); }
  };

  // Group media by activity_id
  const grouped = {};
  const unsectioned = [];
  media.forEach(item => {
    if (item.activity_id) {
      if (!grouped[item.activity_id]) grouped[item.activity_id] = [];
      grouped[item.activity_id].push(item);
    } else {
      unsectioned.push(item);
    }
  });

  return (
    <div className="media-gallery">
      <h2>Media Gallery</h2>

      <div className="mg-tabs">
        <button className={`mg-tab ${activeTab === 'upload' ? 'mg-tab-active' : ''}`} onClick={() => setActiveTab('upload')}>Upload Photos</button>
        <button className={`mg-tab ${activeTab === 'sections' ? 'mg-tab-active' : ''}`} onClick={() => setActiveTab('sections')}>Manage Sections</button>
        <button className={`mg-tab ${activeTab === 'gallery' ? 'mg-tab-active' : ''}`} onClick={() => setActiveTab('gallery')}>All Photos</button>
      </div>

      {message && <p className="message">{message}</p>}

      {/* ── Upload Tab ── */}
      {activeTab === 'upload' && (
        <div className="upload-section">
          <h3>Upload Photos</h3>
          <form onSubmit={handleUpload} className="upload-form">
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={uploading}>
              <option value="">— No section (general) —</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <input type="text" placeholder="Title (optional for bulk)" value={title} onChange={(e) => setTitle(e.target.value)} disabled={uploading} />
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} rows="2" />
            <input type="file" multiple accept="image/*,video/*" onChange={(e) => setSelectedFiles(Array.from(e.target.files))} disabled={uploading} />
            {selectedFiles.length > 1 && <p className="bulk-info">{selectedFiles.length} files selected — bulk upload</p>}
            <button type="submit" disabled={uploading || !selectedFiles.length}>
              {uploading ? (bulkProgress || 'Uploading...') : 'Upload'}
            </button>
          </form>
        </div>
      )}

      {/* ── Sections Tab ── */}
      {activeTab === 'sections' && (
        <div className="upload-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Sections</h3>
            <button className="small" onClick={() => setShowNewSection(!showNewSection)}>
              {showNewSection ? 'Cancel' : '+ New Section'}
            </button>
          </div>

          {showNewSection && (
            <form onSubmit={handleCreateSection} className="upload-form" style={{ marginBottom: 20 }}>
              <input type="text" placeholder="Section name (e.g. Environmental Conservation)" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} required />
              <textarea placeholder="Description (optional)" value={newSectionDesc} onChange={(e) => setNewSectionDesc(e.target.value)} rows="2" />
              <button type="submit">Create Section</button>
            </form>
          )}

          {loading ? <p>Loading...</p> : sections.length === 0 ? (
            <p>No sections yet. Create one above.</p>
          ) : (
            <div className="sections-list">
              {sections.map(s => (
                <div key={s.id} className="section-row">
                  <div>
                    <strong>{s.title}</strong>
                    {s.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>{s.description}</p>}
                    <small style={{ color: '#999' }}>{(grouped[s.id] || []).length} photo(s)</small>
                  </div>
                  <button className="media-delete-btn" style={{ width: 'auto', padding: '4px 12px' }} onClick={() => handleDeleteSection(s.id, s.title)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Gallery Tab ── */}
      {activeTab === 'gallery' && (
        <div className="media-section">
          {loading ? <p>Loading...</p> : (
            <>
              {sections.map(s => (grouped[s.id] || []).length > 0 && (
                <div key={s.id} className="section-block">
                  <h3 className="section-heading">{s.title}</h3>
                  <div className="media-grid">
                    {(grouped[s.id] || []).map(item => <MediaCard key={item.id} item={item} editingId={editingId} editTitle={editTitle} editDescription={editDescription} setEditingId={setEditingId} setEditTitle={setEditTitle} setEditDescription={setEditDescription} handleEdit={handleEdit} handleDelete={handleDelete} getImageUrl={getImageUrl} />)}
                  </div>
                </div>
              ))}
              {unsectioned.length > 0 && (
                <div className="section-block">
                  <h3 className="section-heading">General</h3>
                  <div className="media-grid">
                    {unsectioned.map(item => <MediaCard key={item.id} item={item} editingId={editingId} editTitle={editTitle} editDescription={editDescription} setEditingId={setEditingId} setEditTitle={setEditTitle} setEditDescription={setEditDescription} handleEdit={handleEdit} handleDelete={handleDelete} getImageUrl={getImageUrl} />)}
                  </div>
                </div>
              )}
              {media.length === 0 && <p>No photos uploaded yet.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MediaCard({ item, editingId, editTitle, editDescription, setEditingId, setEditTitle, setEditDescription, handleEdit, handleDelete, getImageUrl }) {
  return (
    <div className="media-item">
      <div className="media-preview">
        {item.media_type === 'image'
          ? <img src={getImageUrl(item.file_path)} alt={item.title} />
          : <div className="media-placeholder">{item.file_type}</div>}
      </div>
      <div className="media-info">
        {editingId === item.id ? (
          <>
            <input className="edit-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
            <textarea className="edit-textarea" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" rows="2" />
            <div className="edit-actions">
              <button className="media-save-btn" onClick={() => handleEdit(item.id)}>Save</button>
              <button className="media-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p>{item.description || 'No description'}</p>
            <small>Uploaded: {new Date(item.created_date).toLocaleDateString()}</small>
            <div className="edit-actions">
              <button className="media-edit-btn" onClick={() => { setEditingId(item.id); setEditTitle(item.title); setEditDescription(item.description || ''); }}>Edit</button>
              <button className="media-delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MediaGallery;
