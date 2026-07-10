import './spinner.css';

export function Spinner() {
  return (
    <div data-testid="spinner-container" className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
}
