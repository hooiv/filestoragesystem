import React, { useState } from 'react';
import './App.css';
import API from './api';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as FaIcons from 'react-icons/fa';

Modal.setAppElement('#root');

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [shareTargetId, setShareTargetId] = useState('');
  const [sharePermission, setSharePermission] = useState('read');
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      const data = res.data as { token: string };
      setToken(data.token);
      toast.success('Login successful');
      fetchFiles(data.token);
      setShowLogin(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/files/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('File uploaded');
      fetchFiles(token);
      setShowUpload(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  const fetchFiles = async (authToken: string) => {
    try {
      const res = await API.get('/files', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = res.data as { files: any[] };
      setFiles(data.files);
    } catch (err) {
      setFiles([]);
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const res = await API.get(`/files/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setMessage('Download failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', {
        email: registerEmail,
        password: registerPassword,
        name: registerName,
      });
      toast.success('Registration successful. Please log in.');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
      setShowRegister(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  const fetchVersions = async (name: string) => {
    if (!token) return;
    try {
      const res = await API.get(`/files/versions/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data as { files: any[] };
      setVersions(data.files);
      setSelectedFileName(name);
    } catch (err) {
      setVersions([]);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTargetId || !shareEmail || !token) return;
    try {
      await API.post('/share/share', {
        fileId: shareTargetId,
        email: shareEmail,
        permission: sharePermission,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('File shared successfully');
      setShareEmail('');
      setShareTargetId('');
      setSharePermission('read');
      setShowShare(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Share failed');
    }
  };

  const fetchSharedFiles = async () => {
    if (!token) return;
    try {
      const res = await API.get('/share/shared', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data as { files: any[] };
      setSharedFiles(data.files);
    } catch (err) {
      setSharedFiles([]);
    }
  };

  const handleLogout = () => {
    setToken('');
    setFiles([]);
    setSharedFiles([]);
    setMessage('Logged out');
  };

  return (
    <div className="App" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f7f9fb', minHeight: '100vh' }}>
      <ToastContainer position="top-center" />
      <header style={{ background: '#1976d2', color: 'white', padding: '1rem', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px #0002' }}>
        <span style={{ fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>{Icon(FaIcons.FaFileAlt)} File Storage System</span>
        <div>
          {!token && <button style={buttonStyle} onClick={() => setShowRegister(true)}>{Icon(FaIcons.FaUserPlus)} Register</button>}
          {!token && <button style={buttonStyle} onClick={() => setShowLogin(true)}>{Icon(FaIcons.FaSignInAlt)} Login</button>}
          {token && <button style={buttonStyle} onClick={() => setShowUpload(true)}>{Icon(FaIcons.FaUpload)} Upload</button>}
          {token && <button style={buttonStyle} onClick={() => setShowShare(true)}>{Icon(FaIcons.FaShareAlt)} Share</button>}
          {token && <button style={buttonStyle} onClick={handleLogout}>{Icon(FaIcons.FaSignOutAlt)} Logout</button>}
        </div>
      </header>
      <main style={{ maxWidth: 800, margin: '0 auto', background: 'white', borderRadius: 12, boxShadow: '0 4px 24px #0002', padding: 32, minHeight: 600 }}>
        <Modal isOpen={showRegister} onRequestClose={() => setShowRegister(false)} contentLabel="Register">
          <h2 style={modalTitleStyle}>Register</h2>
          <form onSubmit={handleRegister} style={modalFormStyle}>
            <input type="text" placeholder="Name" value={registerName} onChange={e => setRegisterName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} style={inputStyle} />
            <button type="submit" style={primaryButtonStyle}>Register</button>
          </form>
        </Modal>
        <Modal isOpen={showLogin} onRequestClose={() => setShowLogin(false)} contentLabel="Login">
          <h2 style={modalTitleStyle}>Login</h2>
          <form onSubmit={handleLogin} style={modalFormStyle}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            <button type="submit" style={primaryButtonStyle}>Login</button>
          </form>
        </Modal>
        <Modal isOpen={showUpload} onRequestClose={() => setShowUpload(false)} contentLabel="Upload File">
          <h2 style={modalTitleStyle}>Upload File</h2>
          <form onSubmit={handleUpload} style={modalFormStyle}>
            <input type="file" onChange={handleFileChange} style={inputStyle} />
            <button type="submit" style={primaryButtonStyle}>Upload</button>
          </form>
        </Modal>
        <Modal isOpen={showShare} onRequestClose={() => setShowShare(false)} contentLabel="Share File">
          <h2 style={modalTitleStyle}>Share a File</h2>
          <form onSubmit={handleShare} style={modalFormStyle}>
            <select value={shareTargetId} onChange={e => setShareTargetId(e.target.value)} style={inputStyle}>
              <option value="">Select file</option>
              {files.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <input type="email" placeholder="Recipient's email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} style={inputStyle} />
            <select value={sharePermission} onChange={e => setSharePermission(e.target.value)} style={inputStyle}>
              <option value="read">Read</option>
              <option value="write">Write</option>
            </select>
            <button type="submit" style={primaryButtonStyle}>Share</button>
          </form>
        </Modal>
        {token && (
          <>
            <section style={{ marginBottom: 32 }}>
              <h2 style={sectionTitleStyle}>Your Files</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {files.map(f => (
                  <li key={f.id} style={fileItemStyle}>
                    <span style={{ flex: 1 }}>{f.name}</span>
                    <button style={iconButtonStyle} title="Download" onClick={() => handleDownload(f.id, f.name)}>{Icon(FaIcons.FaCloudDownloadAlt)}</button>
                    <button style={iconButtonStyle} title="Show Versions" onClick={() => fetchVersions(f.name)}>Versions</button>
                  </li>
                ))}
              </ul>
            </section>
            <section style={{ marginBottom: 32 }}>
              <h2 style={sectionTitleStyle}>Files Shared With You</h2>
              <button style={{ ...primaryButtonStyle, marginBottom: 8 }} onClick={fetchSharedFiles}>Refresh Shared Files</button>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {sharedFiles.map(f => (
                  <li key={f.id} style={fileItemStyle}>
                    <span style={{ flex: 1 }}>{f.name}</span>
                    <button style={iconButtonStyle} title="Download" onClick={() => handleDownload(f.id, f.name)}>{Icon(FaIcons.FaCloudDownloadAlt)}</button>
                  </li>
                ))}
              </ul>
            </section>
            {versions.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h3 style={sectionTitleStyle}>Versions for {selectedFileName}</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {versions.map(v => (
                    <li key={v.id} style={fileItemStyle}>
                      <span style={{ flex: 1 }}>v{v.version}</span>
                      <button style={iconButtonStyle} title="Download" onClick={() => handleDownload(v.id, v.name)}>{Icon(FaIcons.FaCloudDownloadAlt)}</button>
                    </li>
                  ))}
                </ul>
                <button style={primaryButtonStyle} onClick={() => { setVersions([]); setSelectedFileName(''); }}>Hide Versions</button>
              </section>
            )}
          </>
        )}
        <div style={{ color: message.includes('failed') ? 'red' : 'green', marginTop: 10, minHeight: 24, textAlign: 'center' }}>{message}</div>
      </main>
    </div>
  );
}

// Button and style objects
// Fix for React.CSSProperties: use string values for style props
const buttonStyle: React.CSSProperties = { background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', margin: '0 4px', cursor: 'pointer', fontWeight: 500, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: '6px' };
const primaryButtonStyle: React.CSSProperties = { ...buttonStyle, background: '#388e3c' };
const iconButtonStyle: React.CSSProperties = { ...buttonStyle, background: '#eee', color: '#1976d2', padding: '6px 10px', fontSize: 18 };
const modalTitleStyle: React.CSSProperties = { marginBottom: 16, textAlign: 'center' as const, color: '#1976d2' };
const modalFormStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' as const, gap: '16px' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 16 };
const sectionTitleStyle: React.CSSProperties = { color: '#1976d2', marginBottom: 12 };
const fileItemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 6, background: '#f9fafd', borderRadius: 4 };

// Helper for react-icons v5+ compatibility
function Icon(Component: any, props = {}) {
  return Component ? <Component {...props} /> : null;
}

export default App;
