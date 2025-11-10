import React from 'react';

const DreamCompanionLogo: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-white"></div>
    </div>
);

export const Footer: React.FC = () => {
  return (
    <footer className="flex-shrink-0 bg-[#0d1117] border-t border-gray-800 px-6 py-4 text-xs text-gray-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
                <DreamCompanionLogo />
                <div>
                    <p className="font-bold text-gray-400">Dream Companion</p>
                    <p>Designed for immersive roleplay experiences, this platform provides the ability to sense and chat with AI companions.</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Links</h4>
                    <ul className="space-y-1">
                        <li><a href="#" className="hover:text-white">Home</a></li>
                        <li><a href="#" className="hover:text-white">Chat</a></li>
                        <li><a href="#" className="hover:text-white">Create Character</a></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Legal</h4>
                    <ul className="space-y-1">
                        <li><a href="#" className="hover:text-white">Legal Notice</a></li>
                        <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white">Terms and Policies</a></li>
                    </ul>
                </div>
            </div>
            <div className="flex items-center justify-end">
                {/* Placeholder for decorative elements */}
            </div>
        </div>
    </footer>
  );
};
