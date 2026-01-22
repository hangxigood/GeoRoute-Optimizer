import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingOverlay from '../LoadingOverlay';

describe('LoadingOverlay', () => {
    it('renders with default message', () => {
        render(<LoadingOverlay />);
        expect(screen.getByText('Calculating...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        render(<LoadingOverlay message="Processing..." />);
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
});
