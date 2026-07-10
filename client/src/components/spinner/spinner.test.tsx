import { render, screen } from '@testing-library/react';
import { Spinner } from './spinner';


describe('Spinner Component', () => {
  it('renders correctly', () => {
    render(<Spinner />);
    expect(screen.getByTestId('spinner-container')).toBeInTheDocument();
  });
});
