import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import WmsuLogo from '../WmsuLogo';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="shadow-md bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <a href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                            <WmsuLogo className="h-10 w-10 mr-3" />
                            <span className="font-bold text-xl tracking-wide text-gray-800">WMSU DMTS</span>
                        </a>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-2 items-center">
                        <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-700 transition-colors duration-200">Dashboard</Link>
                        <Link href="/documents" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-700 transition-colors duration-200">Documents</Link>
                        <Link href="/profile" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-700 transition-colors duration-200">Profile</Link>
                        <Link href="/logout" method="post" className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-md hover:bg-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Logout</Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-red-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                            aria-expanded={menuOpen}
                            aria-controls="mobile-menu"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                id="mobile-menu"
                className={`md:hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
                    <a href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">Dashboard</a>
                    <a href="/documents" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">Documents</a>
                    <a href="/tracking" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">Tracking</a>
                    <a href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">Profile</a>
                    <a href="/logout" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-red-700 hover:bg-red-800 transition-colors duration-200">Logout</a>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
