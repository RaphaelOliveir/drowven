import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './login';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../api/axios-instance', () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn() }
}));

describe('Login Component', () => {
  it('renders branding and login form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Drowven/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
  
  it('displays validation messages on empty submit', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });
});
