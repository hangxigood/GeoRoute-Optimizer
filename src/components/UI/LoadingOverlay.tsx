interface LoadingOverlayProps {
    message?: string;
}

export default function LoadingOverlay({ message = 'Calculating...' }: LoadingOverlayProps) {
    return (
        <div className="absolute inset-0 z-30 bg-black/20 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span className="text-gray-700">{message}</span>
            </div>
        </div>
    );
}
