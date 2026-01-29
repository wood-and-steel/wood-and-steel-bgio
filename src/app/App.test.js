import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import App from './App';

test('renders lobby screen on initial load', async () => {
  await act(async () => {
    render(<App />);
  });
  
  // App starts in lobby mode when no current game is set
  await waitFor(() => {
    expect(screen.getByText(/wood and steel lobby/i)).toBeInTheDocument();
  });
  
  // Lobby shows storage tabs
  expect(screen.getByRole('button', { name: /local/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cloud/i })).toBeInTheDocument();
});
