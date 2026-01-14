interface SidebarToggleProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
    return (
        <button
            onClick={onToggle}
            className="absolute top-4 left-4 z-20 lg:hidden p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
            </svg>
        </button>
    );
}
