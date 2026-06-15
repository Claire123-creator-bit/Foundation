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
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMedia();
  }, []);

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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Delete this media? This cannot be undone.')) return;

    try {
      const response = await fetch(`${API_BASE}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || selectedFile.name);
      formData.append('description', description);
      formData.append('media_type', mediaType);

      const response = await fetch(`${API_BASE}/media-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Media uploaded successfully');
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        await loadMedia();
      } else {
        setMessage(`Upload failed: ${data.message || data.error}`);
      }
    } catch (e) {
      setMessage(`Error uploading: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-gallery">
      <h2>Media Gallery</h2>

      {/* Upload Form */}
      <div className="upload-section">
        <h3>Upload Media</h3>
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="text"
            placeholder="Title"
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
          <input type="file" onChange={handleFileChange} disabled={uploading} />
          <button type="submit" disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      {/* Media List */}
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
                  <h4>{item.title}</h4>
                  <p>{item.description || 'No description'}</p>
                  <small>Uploaded: {new Date(item.created_at).toLocaleDateString()}</small>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="media-delete-btn"
                  >
                    Delete
                  </button>
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
