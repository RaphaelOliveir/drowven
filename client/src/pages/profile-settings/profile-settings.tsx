import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppDispatch, RootState } from '../../store';
import { updateProfile } from '../../store/auth-slice';
import { axiosInstance } from '../../api/axios-instance';
import { Spinner } from '../../components/spinner/spinner';
import './profile-settings.css';
import '../home/home.css';

export function ProfileSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [description, setDescription] = useState(user?.description || '');
  const [projects, setProjects] = useState(user?.projects || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [selectedArea, setSelectedArea] = useState(user?.areas?.[0] || '');
  const [workAreas, setWorkAreas] = useState<{id: string, name: string}[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchWorkAreas = async () => {
      try {
        const response = await axiosInstance.get('/work-areas');
        setWorkAreas(response.data);
      } catch (err) {
        console.error('Failed to load work areas', err);
      }
    };
    fetchWorkAreas();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const payload = {
      description,
      projects,
      experience,
      areas: selectedArea ? [selectedArea] : []
    };

    const result = await dispatch(updateProfile({ id: user.id, data: payload }));
    if (updateProfile.fulfilled.match(result)) {
      navigate('/');
    } else {
      setSaveMessage('Failed to update profile.');
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <ArrowLeft size={24} style={{ marginRight: '10px' }} />
            <h1>Settings</h1>
          </Link>
        </div>
      </header>

      <div className="profile-settings-page">
        <div className="profile-settings-card">
          <h2>Edit Profile</h2>
          
          {saveMessage && <div className="save-message">{saveMessage}</div>}

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label>Work Area</label>
              <select 
                value={selectedArea} 
                onChange={(e) => setSelectedArea(e.target.value)}
                className="form-control"
              >
                <option value="">Select Work Area</option>
                {workAreas.map(wa => (
                  <option key={wa.id} value={wa.name}>{wa.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about yourself..."
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Projects</label>
              <textarea 
                value={projects} 
                onChange={(e) => setProjects(e.target.value)}
                placeholder="List some projects you worked on..."
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <textarea 
                value={experience} 
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Your work experience..."
                className="form-control"
                rows={3}
              />
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? <Spinner /> : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
