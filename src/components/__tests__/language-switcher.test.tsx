import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from '../language-switcher';

const mockPush = vi.fn();

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  usePathname: () => '/en/dashboard',
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/dashboard',
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders without errors', () => {
    const { container } = render(<LanguageSwitcher />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders the language button with current locale', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText(/EN/)).toBeInTheDocument();
  });

  it('contains the Languages icon', () => {
    render(<LanguageSwitcher />);
    const icon = document.querySelector('.lucide-languages');
    expect(icon).toBeInTheDocument();
  });

  it('button has correct attributes', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('button has aria-haspopup attribute', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });
});
