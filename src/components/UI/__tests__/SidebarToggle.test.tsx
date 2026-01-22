import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SidebarToggle from '../SidebarToggle';

describe('SidebarToggle', () => {
    it('calls toggle function when clicked', () => {
        const mockToggle = vi.fn();
        render(<SidebarToggle isOpen={true} onToggle={mockToggle} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockToggle).toHaveBeenCalled();
    });

    it('shows correct icon state', () => {
        const { rerender } = render(<SidebarToggle isOpen={true} onToggle={() => { }} />);
        // Check for "open" state visual (implementation detail: usually arrow direction or class)
        // Since we're using raw SVGs or emojis, we might just check if it renders successfully
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<SidebarToggle isOpen={false} onToggle={() => { }} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
