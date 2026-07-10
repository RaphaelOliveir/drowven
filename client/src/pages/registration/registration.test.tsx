import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Registration } from './registration';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../api/axios-instance', () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn() }
}));

describe('Registration Component', () => {
  it('renders branding and registration form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Registration />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Drowven/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });
  
  it('displays validation messages on empty submit', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Registration />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/^Name is required$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Email is required$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Password is required$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Confirm password is required$/i)).toBeInTheDocument();
    });
  });

  it('displays validation message when passwords do not match', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Registration />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'word' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
