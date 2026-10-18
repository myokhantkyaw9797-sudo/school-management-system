import React, { useState, useEffect } from 'react';
import { useAcademicYearStore } from '../../academic-year/store/useAcademicYearStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { translations } from '../../utils/translations';
import { getMarksByEnrollment } from '../../exam-mark/examMarkApi';
import axios from 'axios';

export const StudentProfileForm: React.FC = () => {
  const { selectedYearId, selectedYearName } = useAcademicYearStore();
  const { token } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [studentMarksMap, setStudentMarksMap] = useState<{ [month: string]: { [subId: string]: number } }>({});
  const [loading, setLoading] = useState(false);

  // 🔄 စာမျက်နှာ ၁ နဲ့ ၂ ပြောင်းရန် State (true = Page 1, false = Page 2)
  const [isPageOne, setIsPageOne] = useState(true);

  useEffect(() => {
    const fetchEnrollmentsAndSubjects = async () => {
      const storedToken = token || localStorage.getItem('token');
      if (!storedToken) return;

      try {
        let data = [];
        try {
          const res = await axios.get(`http://localhost:8080/api/enrollments/filter`, {
            params: selectedYearId ? { academicYearId: selectedYearId } : {},
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          data = res.data || [];
        } catch (filterErr) {
          const allRes = await axios.get(`http://localhost:8080/api/enrollments/all`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          const allData = allRes.data || [];
          data = selectedYearId 
            ? allData.filter((item: any) => item.academicYear?.id === selectedYearId)
            : allData;
        }

        setEnrollments(data);
        setSelectedStudent(null);
      } catch (err) {
        console.error('Failed to fetch enrollments completely:', err);
        setEnrollments([]);
        setSelectedStudent(null);
      }

      try {
        const subRes = await axios.get('http://localhost:8080/api/subject/all', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setSubjects(subRes.data || []);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      }
    };

    fetchEnrollmentsAndSubjects();
  }, [selectedYearId, token]);

  useEffect(() => {
    const fetchMarks = async () => {
      const storedToken = token || localStorage.getItem('token');
      if (selectedStudent && storedToken) {
        setLoading(true);
        const months = ['JULY', 'OCTOBER', 'DECEMBER', 'FEBRUARY'];
        const marksDataMap: { [month: string]: { [subId: string]: number } } = {};

        await Promise.all(
          months.map(async (month) => {
            try {
              const marks = await getMarksByEnrollment(selectedStudent.id, month, storedToken);
              const subMap: { [subId: string]: number } = {};
              (marks || []).forEach((m: any) => {
                subMap[m.subjectId] = m.score;
              });
              marksDataMap[month] = subMap;
            } catch (e) {
              marksDataMap[month] = {};
            }
          })
        );
        setStudentMarksMap(marksDataMap);
        setLoading(false);
      }
    };

    fetchMarks();
  }, [selectedStudent, token]);

  const filteredStudents = enrollments.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;

    const name = String(item.student?.name || '').toLowerCase();
    const studentCode = String(item.student?.studentCode || item.studentCode || item.code || item.student?.code || '').toLowerCase();
    const rollNo = String(item.rollNumber || '').toLowerCase();

    return name.includes(q) || studentCode.includes(q) || rollNo === q;
  });

  const getSubjectAbbr = (name: string = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('myanmar')) return language === 'mm' ? 'မြန်မာစာ' : 'Myanmar';
    if (lower.includes('english')) return language === 'mm' ? 'အင်္ဂလိပ်စာ' : 'English';
    if (lower.includes('math')) return language === 'mm' ? 'သင်္ချာ' : 'Mathematics';
    if (lower.includes('social')) return language === 'mm' ? 'လူမှုရေး' : 'Social Studies';
    if (lower.includes('geo')) return language === 'mm' ? 'ပထဝီ' : 'Geography';
    if (lower.includes('hist')) return language === 'mm' ? 'သမိုင်း' : 'History';
    if (lower.includes('sci')) return language === 'mm' ? 'သိပ္ပံ' : 'Science';
    return name;
  };

  const calculateMonthTotal = (month: string) => {
    const subMarks = studentMarksMap[month] || {};
    return Object.values(subMarks).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  };

  const getMonthStatus = (month: string) => {
    const subMarks = studentMarksMap[month] || {};
    const scores = Object.values(subMarks);
    if (scores.length === 0) return '-';
    const hasFail = scores.some((s: any) => Number(s) < 40);
    return hasFail ? 'Fail' : 'Pass';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-900">{t.cumulativeFormTitle}</h2>
          <p className="text-xs text-gray-500">{t.cumulativeFormSub}</p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={t.searchPlaceholderProfile}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-emerald-600 rounded-lg px-3 py-1.5 text-sm w-full md:w-72 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-emerald-900 mr-2">{t.searchResults}</span>
          {filteredStudents.length === 0 ? (
            <span className="text-xs text-red-600 font-semibold px-2 py-1">{t.noStudentFound}</span>
          ) : (
            filteredStudents.map(st => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStudent(st);
                  setIsPageOne(true); // ကျောင်းသားသစ်ရွေးတိုင်း Page 1 ကို အလိုအလျောက်ပြမည်
                }}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold transition shadow-sm ${
                  selectedStudent?.id === st.id 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {st.student?.name} ({t.studentCode}: {st.student?.studentCode || st.student?.code || '-'}, Roll: {st.rollNumber || '-'})
              </button>
            ))
          )}
        </div>
      )}

      {selectedStudent ? (
        <div className="relative">
          
          {/* 🔄 ညာဘက်အပေါ်ထောင့်ရှိ အဝိုင်းပုံစံ လှည့်သည့်ခလုတ် (Floating Flip Button) */}
          <div className="absolute -top-5 right-4 z-20">
            <button
              onClick={() => setIsPageOne(!isPageOne)}
              className="w-12 h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-2xl border-2 border-white flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
              title={isPageOne ? "Switch to Exam Marks Record" : "Switch to Student Profile"}
            >
              <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-[9px] font-bold">{isPageOne ? 'Page 2' : 'Page 1'}</span>
            </button>
          </div>

          {/* ================= PAGE 1: Student Bio Profile ================= */}
          {isPageOne && (
            <div className="bg-white border-2 border-emerald-800 rounded-2xl p-8 shadow-xl relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-16 bg-emerald-700 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                {t.page1Title}
              </div>

              {/* Header: Left Logo (Circular), Center Text, Right Student Photo */}
              <div className="flex justify-between items-center border-b-2 border-emerald-700 pb-6 mb-8 gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-emerald-700 bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src="http://localhost:8080/images/other/EducationFlag .png" 
                    alt="School Logo" 
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=YGW';
                    }}
                  />
                </div>

                <div className="space-y-1 text-center flex-1">
                  <h3 className="text-xs md:text-sm font-bold text-gray-600 uppercase">{t.ministry}</h3>
                  <h3 className="text-xs md:text-sm font-bold text-gray-600 uppercase">{t.department}</h3>
                  <h1 className="text-base md:text-xl font-extrabold text-emerald-900">
                    {t.schoolName}
                  </h1>
                  <h2 className="text-sm font-bold text-emerald-700">{t.cumulativeFormTitle}</h2>
                </div>

                <div className="w-24 h-32 md:w-28 md:h-36 border-2 border-dashed border-emerald-600 rounded-lg flex flex-col items-center justify-center bg-emerald-50/50 p-1.5 shrink-0 shadow-inner overflow-hidden">
                  {selectedStudent.student?.photoUrl || selectedStudent.student?.imageUrl ? (
                    <img 
                      src={selectedStudent.student.photoUrl || selectedStudent.student.imageUrl} 
                      alt="Student" 
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-emerald-800 mb-1">Student Photo</span>
                      <div className="w-full h-full bg-emerald-200/60 rounded flex items-center justify-center text-emerald-900 font-bold text-sm">
                        {selectedStudent.student?.name?.charAt(0) || 'Photo'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <img src="http://localhost:8080/images/other/YGWFlag.png" alt="Logo Watermark" className="w-80 h-80 object-contain" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.studentName}:</span>
                    <span className="font-bold text-emerald-900">{selectedStudent.student?.name || '-'}</span>
                  </div>
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.studentCode}:</span>
                    <span className="font-bold text-red-600">{selectedStudent.student?.studentCode || selectedStudent.student?.code || '-'}</span>
                  </div>
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.gradeAndRoll}:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedStudent.grade?.gradeName || selectedStudent.grade?.name || '-'} (Roll No: {selectedStudent.rollNumber || '-'})
                    </span>
                  </div>
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.academicYear}:</span>
                    <span className="font-semibold text-emerald-800">{selectedYearName || '-'}</span>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.gender}:</span>
                    <span className="text-gray-800">{selectedStudent.student?.gender || '-'}</span>
                  </div>
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.dob}:</span>
                    <span className="text-gray-800">{selectedStudent.student?.dob || '-'}</span>
                  </div>
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.guardianName}:</span>
                    <span className="text-gray-800">{selectedStudent.student?.guardianName || '-'}</span>
                  </div>
                  <div className="flex border-b border-gray-200 pb-2">
                    <span className="w-40 font-bold text-gray-600">{t.contactPhone}:</span>
                    <span className="text-gray-800">{selectedStudent.student?.guardianPhone || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <span>Yellow Generation Wave Management System</span>
                <span className="italic">Principal Signature: ______________________</span>
              </div>
            </div>
          )}


          {/* ================= PAGE 2: Exam Marks Record ================= */}
          {!isPageOne && (
            <div className="bg-white border-2 border-emerald-800 rounded-2xl p-8 shadow-xl relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-16 bg-emerald-700 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                {t.page2Title}
              </div>

              <div className="border-b-2 border-emerald-700 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-emerald-900">{t.examResultsSummary}</h3>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500 font-medium">Loading examination scores...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse border border-emerald-800 text-xs">
                    <thead>
                      <tr className="bg-emerald-800 text-white font-bold">
                        <th className="border border-emerald-700 py-3 px-2 w-12">{t.no || 'No'}</th>
                        <th className="border border-emerald-700 py-3 px-3">{t.examMonth}</th>
                        {subjects.map((sub: any) => (
                          <th key={sub.id} className="border border-emerald-700 py-3 px-2">
                            {getSubjectAbbr(sub.name || sub.subjectName)}
                          </th>
                        ))}
                        <th className="border border-emerald-700 py-3 px-2 bg-emerald-900 w-16">{t.total}</th>
                        <th className="border border-emerald-700 py-3 px-2 w-20">{t.result}</th>
                        <th className="border border-emerald-700 py-3 px-3">{t.remark}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {[
                        { key: 'JULY', label: language === 'mm' ? 'ဇူလိုင်လ စာမေးပွဲ' : 'July Exam' },
                        { key: 'OCTOBER', label: language === 'mm' ? 'အောက်တိုဘာလ စာမေးပွဲ' : 'October Exam' },
                        { key: 'DECEMBER', label: language === 'mm' ? 'ဒီဇင်ဘာလ စာမေးပွဲ' : 'December Exam' },
                        { key: 'FEBRUARY', label: language === 'mm' ? 'ဖေဖော်ဝါရီလ စာမေးပွဲ' : 'February Exam' }
                      ].map((exam, idx) => {
                        const monthMarks = studentMarksMap[exam.key] || {};
                        const total = calculateMonthTotal(exam.key);
                        const status = getMonthStatus(exam.key);

                        return (
                          <tr key={exam.key} className="hover:bg-emerald-50/50 transition">
                            <td className="border border-gray-300 py-2.5 font-bold">{idx + 1}</td>
                            <td className="border border-gray-300 py-2.5 font-bold text-emerald-900 text-left px-3">{exam.label}</td>
                            
                            {subjects.map((sub: any) => {
                              const score = monthMarks[sub.id];
                              const isFail = score !== undefined && Number(score) < 40;
                              return (
                                <td key={sub.id} className={`border border-gray-300 py-2.5 font-semibold ${isFail ? 'text-red-600 bg-red-50' : 'text-gray-800'}`}>
                                  {score !== undefined ? score : '-'}
                                </td>
                              );
                            })}

                            <td className="border border-gray-300 py-2.5 font-extrabold text-emerald-900 bg-emerald-50/40">
                              {total > 0 ? total : '-'}
                            </td>
                            <td className="border border-gray-300 py-2.5 font-bold">
                              {status === 'Pass' ? (
                                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{t.pass}</span>
                              ) : status === 'Fail' ? (
                                <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded">{t.fail}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="border border-gray-300 py-2.5 text-gray-500 italic">
                              {status === 'Pass' ? t.satisfactory : status === 'Fail' ? t.needsImprovement : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <span>Form Format: Student Cumulative Record & Exam Grades</span>
                <span>Yellow Generation Wave 89/5</span>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-600">{t.cumulativeFormSub}</p>
        </div>
      )}
    </div>
  );
};