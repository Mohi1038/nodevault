// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import './index.css';

// --- SELF-CONTAINED DYNAMIC SVG ICONS ---
const Icons = {
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  ),
  EyeOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  ),
  Database: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>
  ),
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  )
};

// --- AUTHENTICATION MODULE ---
const AuthView = ({ theme, toggleTheme }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetMessages();
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else if (activeTab === 'register') {
        await register(email, password, role);
        setSuccessMsg('Account registered successfully! Please log in above.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('USER');
        setActiveTab('login');
      } else if (activeTab === 'forgot') {
        // Mock forgot password for now
        setSuccessMsg('If an account exists for this email, you will receive a reset link shortly.');
        setEmail('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card-panel">
        {/* Minimal Sun/Moon Toggle inside auth */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px' }}>
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme Mode">
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>

        <div className="brand-header">
          <h1 className="brand-name" style={{ marginTop: '12px' }}>NodeVault</h1>
          <p className="brand-subtitle">Credentials & Safe Note Storage</p>
        </div>

        <div className="auth-tabs">
          <button
            onClick={() => handleTabChange('login')}
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          >
            Sign Up
          </button>
          {activeTab === 'forgot' && (
            <button className="auth-tab active">Reset Password</button>
          )}
        </div>

        {errorMsg && (
          <div className="alert alert-error">
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {activeTab !== 'forgot' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input form-select"
                >
                  <option value="USER">User (Personal Vault)</option>
                  <option value="ADMIN">Admin (Global Log)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-8px' }}>
              <button
                type="button"
                className="text-link"
                onClick={() => handleTabChange('forgot')}
                style={{ fontSize: '0.85rem' }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '8px' }}>
              <button
                type="button"
                className="text-link"
                onClick={() => handleTabChange('login')}
              >
                Back to Sign In
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ marginTop: '8px' }}
          >
            {submitting ? 'Authenticating...' : 
             activeTab === 'login' ? 'Sign In' : 
             activeTab === 'register' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- CORE DASHBOARD COMPONENT ---
const DashboardView = ({ theme, toggleTheme }) => {
  const { user, logout, apiRequest } = useAuth();
  
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  
  const [visibleSecrets, setVisibleSecrets] = useState({});

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState(null); 
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSecretId, setDeletingSecretId] = useState(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('NOTE');
  const [formContent, setFormContent] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiRequest('/secrets');
      if (data.success) {
        setSecrets(data.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = (id) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenCreate = () => {
    setEditingSecret(null);
    setFormTitle('');
    setFormType('NOTE');
    setFormContent('');
    setIsUpsertOpen(true);
  };

  const handleOpenEdit = (secret) => {
    setEditingSecret(secret);
    setFormTitle(secret.title);
    setFormType(secret.type);
    setFormContent(secret.content);
    setIsUpsertOpen(true);
  };

  const handleUpsertSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      alert('Title and Content are required!');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingSecret) {
        const result = await apiRequest(`/secrets/${editingSecret.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: formTitle,
            type: formType,
            content: formContent
          })
        });
        if (result.success) {
          setSecrets(prev => prev.map(s => s.id === editingSecret.id ? result.data : s));
          setIsUpsertOpen(false);
        }
      } else {
        const result = await apiRequest('/secrets', {
          method: 'POST',
          body: JSON.stringify({
            title: formTitle,
            type: formType,
            content: formContent
          })
        });
        if (result.success) {
          setSecrets(prev => [result.data, ...prev]);
          setIsUpsertOpen(false);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to submit vault item');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = (id) => {
    setDeletingSecretId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await apiRequest(`/secrets/${deletingSecretId}`, {
        method: 'DELETE'
      });
      if (result.success) {
        setSecrets(prev => prev.filter(s => s.id !== deletingSecretId));
        setIsDeleteOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete secret');
    }
  };

  const filteredSecrets = secrets.filter((s) => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.user?.email && s.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'ALL' || s.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const totalCount = secrets.length;
  const passwordCount = secrets.filter(s => s.type === 'PASSWORD').length;
  const noteCount = secrets.filter(s => s.type === 'NOTE').length;

  return (
    <div className="dashboard-layout">
      {/* Navbar with Sun/Moon theme toggler */}
      <nav className="navbar">
        <div className="nav-brand">
          <Icons.Lock />
          <span className="brand-name">NodeVault</span>
        </div>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Theme">
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          
          <div className="user-profile-badge">
            <span>{user.email}</span>
            <span className="user-role-tag">
              {user.role}
            </span>
          </div>

          <button onClick={logout} className="theme-toggle-btn" title="Log Out">
            <Icons.LogOut />
          </button>
        </div>
      </nav>

      {/* Content Container */}
      <div className="dashboard-container">
        
        {/* Simple Numeric Analytics Grid */}
        <div className="stats-grid">
          <div className="stats-card card-panel">
            <div className="stats-info">
              <h4>{user.role === 'ADMIN' ? 'Secrets (System)' : 'Secrets (Personal)'}</h4>
              <p>{totalCount}</p>
            </div>
            <div className="stats-icon-box">
              <Icons.Database />
            </div>
          </div>

          <div className="stats-card card-panel">
            <div className="stats-info">
              <h4>Passwords</h4>
              <p>{passwordCount}</p>
            </div>
            <div className="stats-icon-box">
              <Icons.Key />
            </div>
          </div>

          <div className="stats-card card-panel">
            <div className="stats-info">
              <h4>Secure Notes</h4>
              <p>{noteCount}</p>
            </div>
            <div className="stats-icon-box">
              <Icons.Shield />
            </div>
          </div>
        </div>

        {/* Filters and Add Controls */}
        <div className="content-header">
          <div className="search-filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon"><Icons.Search /></span>
              <input
                type="text"
                placeholder={user.role === 'ADMIN' ? "Search title, secrets, or owner..." : "Search secrets..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-input filter-select"
            >
              <option value="ALL">All Types</option>
              <option value="PASSWORD">Passwords</option>
              <option value="NOTE">Notes</option>
              <option value="KEY">Keys</option>
              <option value="OTHER">Others</option>
            </select>
          </div>

          {user.role !== 'ADMIN' && (
            <button onClick={handleOpenCreate} className="btn btn-primary" style={{ width: 'auto' }}>
              <Icons.Plus style={{ width: '14px', height: '14px' }} />
              Add Secret
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="alert alert-error">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Grid secrets display */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Decrypting storage...</p>
          </div>
        ) : filteredSecrets.length === 0 ? (
          <div className="card-panel empty-state">
            <h3>No Records Available</h3>
            <p style={{ fontSize: '13px' }}>
              {searchQuery || selectedType !== 'ALL'
                ? "No credentials match the filters."
                : "Your vault is empty. Click add above to record safe credentials."}
            </p>
            {!searchQuery && selectedType === 'ALL' && user.role !== 'ADMIN' && (
              <button onClick={handleOpenCreate} className="btn btn-primary" style={{ width: 'auto' }}>
                <Icons.Plus style={{ width: '14px', height: '14px' }} />
                Add Record
              </button>
            )}
          </div>
        ) : (
          <div className="secrets-grid">
            {filteredSecrets.map((secret) => {
              const isMasked = !visibleSecrets[secret.id];
              return (
                <div key={secret.id} className="card-panel secret-card">
                  <div className="secret-card-header">
                    <div>
                      <h3 className="secret-title" title={secret.title}>{secret.title}</h3>
                      {user.role === 'ADMIN' && secret.user && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Owner: {secret.user.email}
                        </p>
                      )}
                    </div>
                    <span className="secret-type-pill">
                      {secret.type}
                    </span>
                  </div>

                  <div className="secret-content-container">
                    {isMasked ? (
                      <span className="secret-masked-text">••••••••••••••••</span>
                    ) : (
                      <span className="secret-raw-text">{secret.content}</span>
                    )}
                  </div>

                  <div className="secret-actions">
                    <span className="card-date">
                      {new Date(secret.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>

                    <div className="card-action-btns">
                      <button
                        onClick={() => handleToggleVisibility(secret.id)}
                        className="icon-btn"
                        title={isMasked ? "Show Secret" : "Hide Secret"}
                      >
                        {isMasked ? <Icons.Eye style={{ width: '14px', height: '14px' }} /> : <Icons.EyeOff style={{ width: '14px', height: '14px' }} />}
                      </button>

                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleOpenEdit(secret)}
                          className="icon-btn"
                          title="Edit Record"
                        >
                          <Icons.Edit style={{ width: '13px', height: '13px' }} />
                        </button>
                      )}

                      {(user.role === 'ADMIN' || secret.userId === user.id) && (
                        <button
                          onClick={() => handleOpenDelete(secret.id)}
                          className="icon-btn icon-btn-danger"
                          title="Purge Record"
                        >
                          <Icons.Trash style={{ width: '13px', height: '13px' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isUpsertOpen && (
        <div className="modal-overlay">
          <div className="card-panel modal-content">
            <div className="modal-header">
              <h3>{editingSecret ? 'Update Vault Item' : 'New Vault Item'}</h3>
              <button onClick={() => setIsUpsertOpen(false)} className="icon-btn" style={{ fontSize: '20px' }}>×</button>
            </div>

            <form onSubmit={handleUpsertSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Github Personal Token"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="form-input form-select"
                >
                  <option value="PASSWORD">PASSWORD</option>
                  <option value="NOTE">NOTE</option>
                  <option value="KEY">ACCESS KEY</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Protected Info</label>
                <textarea
                  placeholder="Enter secrets here..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="form-input"
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsUpsertOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : editingSecret ? 'Update' : 'Secure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {isDeleteOpen && (
        <div className="modal-overlay">
          <div className="card-panel modal-content" style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--error)' }}>Purge Vault Item</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete this secret? This action is irreversible.
            </p>
            <div className="modal-actions">
              <button onClick={() => setIsDeleteOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP CONTEXT BRIDGE ---
const AppContent = ({ theme, toggleTheme }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
          DECRYPTING VAULT PROTOCOL...
        </p>
      </div>
    );
  }

  return user ? (
    <DashboardView theme={theme} toggleTheme={toggleTheme} />
  ) : (
    <AuthView theme={theme} toggleTheme={toggleTheme} />
  );
};

const App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nv_theme') || 'dark';
  });

  useEffect(() => {
    // Apply data-theme attribute on <html> element
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nv_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthProvider>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </AuthProvider>
  );
};

export default App;
