import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,test'),
}));

Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer),
    },
    randomUUID: jest.fn(() => '11111111-1111-4111-8111-111111111111'),
  },
  configurable: true,
});

test('renders the public home page and opens a tool page', async () => {
  window.history.pushState({}, '', '/');
  render(<App />);

  expect(screen.getByRole('button', { name: /payloadkit/i })).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /all your dev tools one clean workspace/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/client-first utilities with backend power where it helps\. no data stored/i)
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /why payloadkit/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /runtime tools/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /payload tools/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /generators and test helpers/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /runtime tools/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /payload tools/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /generators and test helpers/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /json formatter/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /python compiler/i }).length).toBeGreaterThan(0);
  expect(screen.queryByRole('button', { name: /qr generator/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /timestamp converter/i })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /payload tools/i }));

  expect(screen.getByRole('menuitem', { name: /url encoder/i })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: /hash generator/i })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('heading', { name: /why payloadkit/i }));

  expect(screen.queryByRole('menuitem', { name: /url encoder/i })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /payload tools/i }));

  await userEvent.click(screen.getByRole('menuitem', { name: /jwt decoder/i }));

  expect(screen.getByRole('heading', { name: /jwt decoder/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/jwt token/i)).toBeInTheDocument();
  expect(window.location.pathname).toBe('/jwt-decoder');
});
