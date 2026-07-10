import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../store/auth-slice';
import { AppDispatch, RootState } from '../../store';
import { Spinner } from '../../components/spinner/spinner';
import './login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {email?: string, password?: string} = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        navigate('/');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-branding">
        <h1>Drowven</h1>
        <img src="/assets/images/wave.png" alt="Logo" className="login-logo" />
      </div>
      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Sign In</h2>
          {error && <div className="error-text global-error">{error}</div>}
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Sign In'}
          </button>
          <div className="auth-redirect">
            <Link to="/register">Don't have an account? Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
