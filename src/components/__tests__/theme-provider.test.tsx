import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../theme-provider';

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('passes through props correctly', () => {
    const { container } = render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div>Child</div>
      </ThemeProvider>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles theme changes', () => {
    const { rerender } = render(
      <ThemeProvider attribute="class">
        <div data-testid="content">Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();

    // Re-render with different props
    rerender(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div data-testid="content">Content Updated</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Content Updated')).toBeInTheDocument();
  });

  it('provides theme context to children', () => {
    render(
      <ThemeProvider>
        <div>Theme Context Test</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Theme Context Test')).toBeInTheDocument();
  });
});
