import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../store/auth-slice';
import { AppDispatch, RootState } from '../../store';
import { Spinner } from '../../components/spinner/spinner';
import '../login/login.css'; 

export function Registration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{name?: string, email?: string, password?: string, confirmPassword?: string}>({});

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {name?: string, email?: string, password?: string, confirmPassword?: string} = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const resultAction = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(resultAction)) {
        navigate('/login');
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
          <h2>Register</h2>
          {error && <div className="error-text global-error">{error}</div>}
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
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
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Register'}
          </button>
          <div className="auth-redirect">
            <Link to="/login">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
