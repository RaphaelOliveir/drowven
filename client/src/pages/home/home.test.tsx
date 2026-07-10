import { render, screen } from '@testing-library/react';
import { Home } from './home';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../api/axios-instance', () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn() }
}));

describe('Home Component', () => {
  it('renders header elements with icons and logo', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Drowven/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    expect(screen.getByTestId('lucide-bell')).toBeInTheDocument();
    expect(screen.getByTestId('lucide-user')).toBeInTheDocument();
  });

  it('renders conversations and suggested users areas', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Conversations/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested Users/i)).toBeInTheDocument();
  });
});
