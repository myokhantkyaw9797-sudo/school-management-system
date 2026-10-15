import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAcademicYearStore } from '../academic-year/store/useAcademicYearStore';
import { useAuthStore } from '../auth/store/useAuthStore';
import axios from 'axios';

interface AcademicYear {
  id: string;
  name?: string;
  yearName?: string;
  year_name?: string;
}

export const Header: React.FC = () => {
  const { selectedYearId, setSelectedYear } = useAcademicYearStore();
  const { isAuthenticated, logout, token, username, role } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getYearName = (year: AcademicYear) => {
    return year.name || year.yearName || year.year_name || '';
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      axios
        .get('http://localhost:8080/api/academic-years', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setAcademicYears(res.data);
          
          if (res.data.length > 0 && !selectedYearId) {
            const firstYear = res.data[0];
            const name = getYearName(firstYear);
            setSelectedYear(firstYear.id, name);
          }
        })
        .catch((err) => console.error('Academic Years fetching failed:', err));
    }
  }, [isAuthenticated, token, selectedYearId, setSelectedYear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-emerald-700 text-white shadow-md border-b-4 border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo & System Title */}
        <Link to="/" className="flex items-center space-x-3 group shrink-0">
          <img 
            src="http://localhost:8080/images/other/YGWFlag.png" 
            alt="YGW Logo" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=YGW';
            }}
            className="w-10 h-10 object-contain rounded-full bg-white p-0.5"
          />
          <h1 className="text-base md:text-xl font-bold tracking-wide group-hover:text-emerald-100 transition whitespace-nowrap">
            Yellow Generation Wave 89/5(ဘ.က)
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-2 md:space-x-4 text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition ${
              isActive('/') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'
            }`}
          >
            Home
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/teacher/dashboard"
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive('/teacher/dashboard') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'
                }`}
              >
                Teacher
              </Link>

              <Link
                to="/students"
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive('/students') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'
                }`}
              >
                Student
              </Link>

              <Link
                to="/exam-marks"
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive('/exam-marks') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'
                }`}
              >
                Exam Marks
              </Link>
            </>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              {/* Academic Year Selector */}
              <div className="flex items-center space-x-1.5 bg-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-600">
                <span className="text-xs text-emerald-100 hidden sm:inline">Year:</span>
                <select
                  id="academicYear"
                  value={selectedYearId || ''}
                  onChange={(e) => {
                    const selected = academicYears.find((y) => y.id === e.target.value);
                    if (selected) {
                      setSelectedYear(selected.id, getYearName(selected));
                    }
                  }}
                  className="bg-white text-emerald-900 text-xs font-semibold px-2 py-1 rounded focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Select Year --</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {getYearName(year)}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Avatar & Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 px-2 py-1.5 rounded-lg border border-emerald-600 transition focus:outline-none shadow-sm text-white"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-950 flex items-center justify-center font-bold text-xs border border-emerald-400 text-white">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Box */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-emerald-100 py-3 px-4 z-50 space-y-3">
                    <div className="border-b border-gray-100 pb-3 space-y-1">
                      <p className="text-xs text-gray-500 font-medium">Name: <span className="text-sm font-bold text-emerald-900">{username}</span></p>
                      <p className="text-xs text-gray-500 font-medium">Role: <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">{role}</span></p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2.5 rounded-lg transition flex items-center justify-between"
                    >
                      <span>Logout</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-white text-emerald-800 hover:bg-emerald-100 font-semibold text-xs px-3 py-1.5 rounded-lg transition"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};