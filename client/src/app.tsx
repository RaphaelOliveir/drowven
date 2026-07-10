import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Registration } from './pages/registration/registration';
import { ProtectedRoute } from './components/protected-route/protected-route';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  );
}
