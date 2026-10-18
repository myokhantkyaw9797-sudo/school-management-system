import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAcademicYearStore } from '../academic-year/store/useAcademicYearStore';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../utils/translations';
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
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language];

  const navigate = useNavigate();
  const location = useLocation();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getYearName = (year: AcademicYear) => {
    // 🛑 ဒေတာဘေ့စ်ထဲကအတိုင်း မူရင်းနှစ်နာမည်ကိုပဲ တိုက်ရယူမည် (ဂဏန်းမပြောင်းပါ)
    return year.name || year.yearName || year.year_name || '';
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      axios
        .get('http://localhost:8080/api/academic-years', {
          headers: { Authorization: `Bearer ${token}` },
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
            Yellow Generation Wave 89/5
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-2 md:space-x-3 text-sm font-medium">
          <Link to="/" className={`px-3 py-1.5 rounded-lg transition ${isActive('/') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'}`}>
            {t.home}
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/teacher/dashboard" className={`px-3 py-1.5 rounded-lg transition ${isActive('/teacher/dashboard') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'}`}>
                {t.teacher}
              </Link>
              <Link to="/students" className={`px-3 py-1.5 rounded-lg transition ${isActive('/students') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'}`}>
                {t.student}
              </Link>
              <Link to="/exam-marks" className={`px-3 py-1.5 rounded-lg transition ${isActive('/exam-marks') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'}`}>
                {t.examMarks}
              </Link>
              <Link to="/student-profile" className={`px-3 py-1.5 rounded-lg transition ${isActive('/student-profile') ? 'bg-emerald-900 text-white' : 'hover:bg-emerald-600 text-emerald-100'}`}>
                {t.recordForm}
              </Link>
            </>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Pill Style Language Switcher */}
          <div className="bg-emerald-900/60 p-0.5 rounded-lg border border-emerald-600 flex items-center shadow-inner">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                language === 'en' 
                  ? 'bg-white text-emerald-900 shadow-sm' 
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('mm')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                language === 'mm' 
                  ? 'bg-white text-emerald-900 shadow-sm' 
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              မြန်မာ
            </button>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              {/* Academic Year Selector */}
              <div className="flex items-center space-x-1.5 bg-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-600">
                <span className="text-xs text-emerald-100 hidden sm:inline">
                  {language === 'mm' ? 'ပညာသင်နှစ်:' : 'Year:'}
                </span>
                <select
                  id="academicYear"
                  value={selectedYearId || ''}
                  onChange={(e) => {
                    const selected = academicYears.find((y) => y.id === e.target.value);
                    if (selected) setSelectedYear(selected.id, getYearName(selected));
                  }}
                  className="bg-white text-emerald-900 text-xs font-semibold px-2 py-1 rounded focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    {language === 'mm' ? '-- သင်နှစ်ရွေးပါ --' : '-- Select Year --'}
                  </option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {getYearName(year)}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-900 px-2 py-1.5 rounded-lg border border-emerald-600 transition focus:outline-none shadow-sm text-white"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-950 flex items-center justify-center font-bold text-xs border border-emerald-400 text-white">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-emerald-100 py-3 px-4 z-50 space-y-3">
                    <div className="border-b border-gray-100 pb-3 space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        {language === 'mm' ? 'အမည်:' : 'Name:'} <span className="text-sm font-bold text-emerald-900">{username}</span>
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {language === 'mm' ? 'ရာထူး:' : 'Role:'} <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">{role}</span>
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2.5 rounded-lg transition flex items-center justify-between"
                    >
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <Link to="/login" className="bg-white text-emerald-800 hover:bg-emerald-100 font-semibold text-xs px-3 py-1.5 rounded-lg transition">
              {t.login}
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};