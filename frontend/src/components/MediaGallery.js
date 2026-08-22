import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiClient';
import API_BASE from '../utils/apiConfig';
import './MediaGallery.css';

function MediaGallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [bulkProgress, setBulkProgress] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => { loadMedia(); }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/media');
      setMedia(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage(`Error loading media: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath) => {
    if (filePath.startsWith('http')) return filePath;
    return `${API_BASE}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Delete this media? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/media/${mediaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Media deleted successfully');
        await loadMedia();
      } else {
        setMessage(`Delete failed: ${data.message || data.error}`);
      }
    } catch (e) {
      setMessage(`Error deleting: ${e.message}`);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
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
      if (data.success) {
        setMessage('Media updated successfully');
        setEditingId(null);
        await loadMedia();
      } else {
        setMessage(`Update failed: ${data.message || data.error}`);
      }
    } catch (e) {
      setMessage(`Error updating: ${e.message}`);
    }
  };

  const uploadSingle = async (file, titleVal, descVal) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', titleVal || file.name);
    formData.append('description', descVal);
    formData.append('media_type', mediaType);

    const response = await fetch(`${API_BASE}/media-upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    return response.json();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) { setMessage('Please select a file'); return; }

    setUploading(true);
    setMessage('');

    if (selectedFiles.length === 1) {
      try {
        const data = await uploadSingle(selectedFiles[0], title, description);
        if (data.success) {
          setMessage('Media uploaded successfully');
          setTitle(''); setDescription(''); setSelectedFiles([]);
          await loadMedia();
        } else {
          setMessage(`Upload failed: ${data.message || data.error}`);
        }
      } catch (e) {
        setMessage(`Error uploading: ${e.message}`);
      }
    } else {
      // Bulk upload
      let success = 0, failed = 0;
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setBulkProgress(`Uploading ${i + 1} of ${selectedFiles.length}: ${file.name}`);
        try {
          const data = await uploadSingle(file, file.name, '');
          if (data.success) success++; else failed++;
        } catch { failed++; }
      }
      setBulkProgress('');
      setMessage(`Bulk upload complete: ${success} succeeded, ${failed} failed`);
      setSelectedFiles([]);
      await loadMedia();
    }

    setUploading(false);
  };

  return (
    <div className="media-gallery">
      <h2>Media Gallery</h2>

      <div className="upload-section">
        <h3>Upload Media</h3>
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="text"
            placeholder="Title (optional for bulk)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            rows="2"
          />
          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} disabled={uploading}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
          <input
            type="file"
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            disabled={uploading}
          />
          {selectedFiles.length > 1 && (
            <p className="bulk-info">{selectedFiles.length} files selected — will be bulk uploaded</p>
          )}
          <button type="submit" disabled={uploading || !selectedFiles.length}>
            {uploading ? (bulkProgress || 'Uploading...') : 'Upload'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="media-section">
        <h3>Media Files</h3>
        {loading ? (
          <p>Loading media...</p>
        ) : media.length === 0 ? (
          <p>No media uploaded yet</p>
        ) : (
          <div className="media-grid">
            {media.map((item) => (
              <div key={item.id} className="media-item">
                <div className="media-preview">
                  {item.media_type === 'image' ? (
                    <img src={getImageUrl(item.file_path)} alt={item.title} />
                  ) : (
                    <div className="media-placeholder">{item.file_type}</div>
                  )}
                </div>
                <div className="media-info">
                  {editingId === item.id ? (
                    <>
                      <input
                        className="edit-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <textarea
                        className="edit-textarea"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        rows="2"
                      />
                      <div className="edit-actions">
                        <button className="media-save-btn" onClick={() => handleEdit(item.id)}>Save</button>
                        <button className="media-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>{item.title}</h4>
                      <p>{item.description || 'No description'}</p>
                      <small>Uploaded: {new Date(item.created_date).toLocaleDateString()}</small>
                      <div className="edit-actions">
                        <button className="media-edit-btn" onClick={() => startEdit(item)}>Edit</button>
                        <button className="media-delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaGallery;
