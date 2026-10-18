import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../utils/translations';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="min-h-screen">
      {/* 1. Hero Banner Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat h-[520px] flex items-center justify-center text-center text-white px-4 shadow-md"
        style={{
          backgroundImage: `url('http://localhost:8080/images/other/picture1.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="text-emerald-300 text-sm md:text-base font-bold tracking-widest uppercase drop-shadow">
            Yellow Generation Wave
          </span>

          <h2 className="text-2xl md:text-4xl font-bold leading-relaxed tracking-wide drop-shadow-md text-white">
            "{t.schoolSlogan}"
          </h2>

          <div className="pt-2">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 inline-block text-base"
              >
                {t.loginToSystem}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 2. Photo Gallery Section */}
      <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            {t.galleryTitle}
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            {t.gallerySub}
          </p>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grid Layout (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Photo (1) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture2.jpg" alt="Photo 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (1)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#1</span>
            </div>
          </div>

          {/* Photo (2) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture3.jpg" alt="Photo 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (2)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#2</span>
            </div>
          </div>

          {/* Photo (3) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture4.jpg" alt="Photo 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (3)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#3</span>
            </div>
          </div>

          {/* Photo (4) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture5.jpg" alt="Photo 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (4)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#4</span>
            </div>
          </div>

          {/* Photo (5) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture6.jpg" alt="Photo 5" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (5)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#5</span>
            </div>
          </div>

          {/* Photo (6) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture7.jpg" alt="Photo 6" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (6)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#6</span>
            </div>
          </div>

          {/* Photo (7) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture8.jpg" alt="Photo 7" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (7)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#7</span>
            </div>
          </div>

          {/* Photo (8) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture9.jpg" alt="Photo 8" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (8)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#8</span>
            </div>
          </div>

          {/* Photo (9) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture10.jpg" alt="Photo 9" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (9)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#9</span>
            </div>
          </div>

          {/* Photo (10) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture11.jpg" alt="Photo 10" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (10)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#10</span>
            </div>
          </div>

          {/* Photo (11) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture12.jpg" alt="Photo 11" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (11)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#11</span>
            </div>
          </div>

          {/* Photo (12) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture13.jpg" alt="Photo 12" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (12)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#12</span>
            </div>
          </div>

          {/* Photo (13) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture14.jpg" alt="Photo 13" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (13)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#13</span>
            </div>
          </div>

          {/* Photo (14) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture15.jpg" alt="Photo 14" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (14)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#14</span>
            </div>
          </div>

          {/* Photo (15) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture16.jpg" alt="Photo 15" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (15)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#15</span>
            </div>
          </div>

          {/* Photo (16) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture17.jpg" alt="Photo 16" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (16)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#16</span>
            </div>
          </div>

          {/* Photo (17) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture18.jpg" alt="Photo 17" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (17)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#17</span>
            </div>
          </div>

          {/* Photo (18) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture19.jpg" alt="Photo 18" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (18)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#18</span>
            </div>
          </div>

          {/* Photo (19) */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10] bg-gray-200">
              <img src="http://localhost:8080/images/other/picture20.jpg" alt="Photo 19" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex items-center justify-between bg-white">
              <span className="text-base font-semibold text-gray-800">{t.schoolActivity} (19)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">#19</span>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-emerald-900 text-emerald-200 py-8 text-center text-sm border-t border-emerald-800">
        <p>© {new Date().getFullYear()} Yellow Generation Wave. All rights reserved.</p>
      </footer>
    </div>
  );
};