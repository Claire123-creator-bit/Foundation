import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiClient';

const emptyForm = {
  full_name: '',
  position: '',
  bio: '',
  sort_order: '0',
};

function LeadershipManagement() {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const getFriendlyApiMessage = (error) => {
    const status = error?.status || error?.response?.status;
    if (status === 404) {
      return 'Leadership service is unavailable. Please refresh or redeploy the backend to load this feature.';
    }
    if (status === 401) {
      return 'Please log in again as an admin to manage leadership profiles.';
    }
    if (status === 403) {
      return 'You do not have permission to manage leadership profiles.';
    }
    return error?.message || 'Unable to load leadership profiles';
  };

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/leadership');
      setProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(getFriendlyApiMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const resetForm = () => {
    setForm(emptyForm);
    setPhoto(null);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.full_name.trim() || !form.position.trim() || !form.bio.trim()) {
      setMessage('Name, position, and biography are required.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const payload = new FormData();
      payload.append('full_name', form.full_name.trim());
      payload.append('position', form.position.trim());
      payload.append('bio', form.bio.trim());
      payload.append('sort_order', String(form.sort_order || 0));
      if (photo) payload.append('photo', photo);

      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/leadership/${editingId}` : '/leadership';
      const data = await apiFetch(endpoint, { method, body: payload });

      if (!data.success) {
        setMessage(data.error || data.message || 'Unable to save leadership profile.');
        return;
      }

      setMessage(editingId ? 'Leadership profile updated.' : 'Leadership profile created.');
      resetForm();
      await loadProfiles();
    } catch (error) {
      setMessage(getFriendlyApiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (profile) => {
    setEditingId(profile.id);
    setForm({
      full_name: profile.full_name || '',
      position: profile.position || '',
      bio: profile.bio || '',
      sort_order: String(profile.sort_order ?? 0),
    });
    setPhoto(null);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leadership profile?')) return;

    try {
      const data = await apiFetch(`/leadership/${id}`, { method: 'DELETE' });
      if (!data.success) {
        setMessage(data.error || data.message || 'Unable to delete leadership profile.');
        return;
      }
      setMessage('Leadership profile deleted.');
      if (editingId === id) resetForm();
      await loadProfiles();
    } catch (error) {
      setMessage(getFriendlyApiMessage(error));
    }
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.07)' }}>
        <h3 style={{ margin: '0 0 12px' }}>{editingId ? 'Edit Leadership Profile' : 'Add Leadership Profile'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Full name"
              style={inputStyle}
            />
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Position"
              style={inputStyle}
            />
            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
              placeholder="Display order"
              min="0"
              style={inputStyle}
            />
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Short biography"
              rows="4"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] || null)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={buttonStyle}>
              {saving ? 'Saving...' : editingId ? 'Update Profile' : 'Create Profile'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary" style={secondaryButtonStyle}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p style={{ marginTop: 12, color: '#0f3d73', fontWeight: 600 }}>{message}</p>}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.07)' }}>
        <h3 style={{ margin: '0 0 12px' }}>Current Leadership Profiles</h3>
        {loading ? (
          <p>Loading leadership profiles...</p>
        ) : profiles.length === 0 ? (
          <p>No leadership profiles yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {profiles.map((profile) => (
              <div key={profile.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 16, alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                <img
                  src={profile.photo_url || '/mbogo-background.jpeg'}
                  alt={profile.full_name}
                  style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '50%', border: '2px solid #dbeafe' }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 18 }}>{profile.full_name}</div>
                  <div style={{ color: '#0f3d73', fontWeight: 600, marginBottom: 4 }}>{profile.position}</div>
                  <div style={{ color: '#475569', lineHeight: 1.5 }}>{profile.bio}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button type="button" onClick={() => handleEdit(profile)} style={secondaryButtonStyle}>Edit</button>
                  <button type="button" onClick={() => handleDelete(profile.id)} style={{ ...secondaryButtonStyle, background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14,
  boxSizing: 'border-box',
};

const buttonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '10px 18px',
  cursor: 'pointer',
  color: '#fff',
  background: '#0f3d73',
  fontWeight: 600,
};

const secondaryButtonStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#fff',
  color: '#0f172a',
  cursor: 'pointer',
  fontWeight: 600,
};

export default LeadershipManagement;
