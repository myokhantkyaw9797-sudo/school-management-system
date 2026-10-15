import React, { useEffect, useState } from 'react';
import { useAcademicYearStore } from '../academic-year/store/useAcademicYearStore';
import { useAuthStore } from '../auth/store/useAuthStore';
import { saveOrUpdateExamMark, getMarksByEnrollment } from './examMarkApi';
import axios from 'axios';

interface Grade {
  id: string;
  name?: string;
  gradeName?: string;
}

interface Subject {
  id: string;
  name?: string;
  subjectName?: string;
}

interface StudentEnrollment {
  id: string;
  studentCode?: number | string;
  code?: number | string;
  rollNumber?: string | number;
  student: {
    id: string;
    studentCode?: number | string;
    code?: number | string;
    name: string;
  };
}

export const ExamMarkPage: React.FC = () => {
  const { selectedYearId } = useAcademicYearStore();
  const { token } = useAuthStore();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examMonth, setExamMonth] = useState<string>('JULY');
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  
  const [allMarks, setAllMarks] = useState<{ [enrollmentId: string]: { [subjectId: string]: number | string } }>({});
  const [loading, setLoading] = useState(false);
  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);

  const getSubjectAbbreviation = (name: string = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('myanmar')) return 'MYAN';
    if (lower.includes('english')) return 'ENG';
    if (lower.includes('math')) return 'MATH';
    if (lower.includes('social')) return 'SOC';
    if (lower.includes('geo')) return 'GEO';
    if (lower.includes('hist')) return 'HIST';
    if (lower.includes('sci')) return 'SCI';
    return name.toUpperCase();
  };

  // 🟢 ၁။ Academic Years စာရင်းခေါ်ယူခြင်း (လက်ရှိနှစ် ဟုတ်မဟုတ် စစ်ဆေးရန်)
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/academic-years', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAcademicYearsList(res.data || []);
      } catch (err) {
        console.error('Failed to fetch academic years', err);
      }
    };
    if (token) {
      fetchAcademicYears();
    }
  }, [token]);

  // လက်ရှိရွေးချယ်ထားသော နှစ်သည် လက်ရှိနှစ် (Current Year) ဟုတ်မဟုတ် စစ်ဆေးခြင်း
  const currentYearObj = academicYearsList.find((y: any) => y.id === selectedYearId);
  const isCurrentYear = currentYearObj ? Boolean(currentYearObj.isCurrent) : true;

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:8080/api/grade/find', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setGrades(res.data))
      .catch(err => console.error('Failed to fetch grades', err));
    }
  }, [token]);

  useEffect(() => {
    if (selectedYearId && selectedGradeId && token) {
      setLoading(true);
      
      axios.get(`http://localhost:8080/api/enrollments/filter`, {
        params: { academicYearId: selectedYearId, gradeId: selectedGradeId },
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        let fetchedStudents: StudentEnrollment[] = res.data;

        fetchedStudents.sort((a, b) => {
          const r1 = Number(a.rollNumber) || 0;
          const r2 = Number(b.rollNumber) || 0;
          return r1 - r2;
        });

        setStudents(fetchedStudents);

        fetchedStudents.forEach((st) => {
          getMarksByEnrollment(st.id, examMonth, token)
            .then(marksData => {
              const studentSubjectMarks: { [subId: string]: number } = {};
              marksData.forEach((m: any) => {
                studentSubjectMarks[m.subjectId] = m.score;
              });
              setAllMarks(prev => ({
                ...prev,
                [st.id]: studentSubjectMarks
              }));
            })
            .catch(err => console.error('Error fetching marks for student', err));
        });
      })
      .catch(err => {
        console.error('Failed to fetch students', err);
        setStudents([]);
      })
      .finally(() => setLoading(false));

      axios.get(`http://localhost:8080/api/subject/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const allSubs: Subject[] = res.data;
        const selectedGradeObj = grades.find(g => g.id === selectedGradeId);
        const gradeName = (selectedGradeObj?.name || selectedGradeObj?.gradeName || '').toLowerCase();

        let orderedTargetNames: string[] = [];

        if (gradeName.includes('grade-1') || gradeName.includes('grade-2') || gradeName.includes('grade-3') || gradeName.includes('grade-4') || gradeName.includes('grade-5') || gradeName.includes('g1') || gradeName.includes('g2') || gradeName.includes('g3') || gradeName.includes('g4') || gradeName.includes('g5')) {
          orderedTargetNames = ['myanmar', 'english', 'mathematics', 'social studies', 'scientist'];
        } else if (gradeName.includes('grade-6') || gradeName.includes('grade-7') || gradeName.includes('grade-8') || gradeName.includes('g6') || gradeName.includes('g7') || gradeName.includes('g8')) {
          orderedTargetNames = ['myanmar', 'english', 'mathematics', 'geography', 'history', 'scientist'];
        } else {
          orderedTargetNames = ['myanmar', 'english', 'mathematics', 'social studies', 'geography', 'history', 'scientist'];
        }

        const orderedSubs: Subject[] = [];
        orderedTargetNames.forEach(target => {
          const found = allSubs.find(s => (s.name || s.subjectName || '').toLowerCase().includes(target));
          if (found) orderedSubs.push(found);
        });

        setSubjects(orderedSubs.length > 0 ? orderedSubs : allSubs);
      })
      .catch(err => console.error('Failed to fetch subjects', err));
    } else {
      setStudents([]);
      setSubjects([]);
      setAllMarks({});
    }
  }, [selectedYearId, selectedGradeId, examMonth, token, grades]);

  const handleScoreChange = (enrollmentId: string, subjectId: string, value: string) => {
    setAllMarks(prev => ({
      ...prev,
      [enrollmentId]: {
        ...(prev[enrollmentId] || {}),
        [subjectId]: value
      }
    }));
  };

  const handleSaveStudentMarks = async (enrollmentId: string) => {
    const studentMarks = allMarks[enrollmentId];
    if (!studentMarks) return;

    try {
      const promises = Object.entries(studentMarks).map(([subjectId, score]) => {
        if (score === '' || score === undefined) return Promise.resolve();
        return saveOrUpdateExamMark({
          examMonth: examMonth,
          score: Number(score),
          enrollmentId: enrollmentId,
          subjectId: subjectId
        }, token!);
      });

      await Promise.all(promises);
      alert('Marks saved successfully!');
    } catch (error: any) {
      console.error('Error saving mark:', error);
      alert('Failed to save marks. Please check your permissions and data.');
    }
  };

  const calculateTotal = (enrollmentId: string) => {
    const studentMarks = allMarks[enrollmentId];
    if (!studentMarks) return 0;
    return Object.values(studentMarks).reduce((sum: number, val) => {
      const num = Number(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const getPassFailStatus = (enrollmentId: string) => {
    const studentMarks = allMarks[enrollmentId] || {};
    const filledCount = subjects.filter(sub => studentMarks[sub.id] !== undefined && studentMarks[sub.id] !== '').length;

    if (filledCount < subjects.length) {
      return <span className="text-gray-400 text-xs">Incomplete</span>;
    }

    let hasFailedSubject = false;
    for (const sub of subjects) {
      const scoreNum = Number(studentMarks[sub.id]);
      if (scoreNum < 40) {
        hasFailedSubject = true;
        break;
      }
    }

    if (hasFailedSubject) {
      return <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Fail</span>;
    } else {
      return <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Pass</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto">
      <h2 className="text-xl font-bold text-emerald-900 mb-4">Exam Marks Management</h2>

      <div className="bg-white p-4 rounded-xl shadow-md border border-emerald-100">
        
        <div className="flex flex-wrap justify-between items-center mb-6 px-2 py-2 text-sm font-bold text-emerald-900 border-b border-gray-200 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-semibold">Grade:</span>
            <select
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              className="bg-emerald-50 text-emerald-900 border border-emerald-300 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:border-emerald-600"
            >
              <option value="">-- Select Grade --</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>{grade.name || grade.gradeName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-semibold">Exam Month:</span>
            <select
              value={examMonth}
              onChange={(e) => setExamMonth(e.target.value)}
              className="bg-emerald-50 text-emerald-900 border border-emerald-300 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:border-emerald-600"
            >
              <option value="JULY">July</option>
              <option value="OCTOBER">October</option>
              <option value="DECEMBER">December</option>
              <option value="FEBRUARY">February</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max text-xs">
            <thead>
              <tr className="bg-emerald-800 text-white uppercase tracking-wider text-center">
                <th className="py-2.5 px-2 border border-emerald-700 w-10">No</th>
                <th className="py-2.5 px-3 border border-emerald-700">Student Code</th>
                <th className="py-2.5 px-3 border border-emerald-700">Roll No</th>
                <th className="py-2.5 px-4 border border-emerald-700 text-left">Student Name</th>
                
                {subjects.map(sub => (
                  <th key={sub.id} className="py-2.5 px-2 border border-emerald-700 w-20 text-center font-bold">
                    {getSubjectAbbreviation(sub.name || sub.subjectName)}
                  </th>
                ))}

                <th className="py-2.5 px-2 border border-emerald-700 w-16 bg-emerald-900">Total</th>
                <th className="py-2.5 px-2 border border-emerald-700 w-20">Result</th>
                <th className="py-2.5 px-2 border border-emerald-700 w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7 + subjects.length} className="text-center py-8 text-gray-500">
                    Loading data...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st, index) => (
                  <tr key={st.id} className="hover:bg-emerald-50/50 transition text-center">
                    <td className="py-2 px-2 border border-gray-200">{index + 1}</td>
                    
                    <td className="py-2 px-3 border border-gray-200 font-medium text-gray-700">
                      {st.studentCode ?? st.student?.studentCode ?? st.code ?? st.student?.code ?? '-'}
                    </td>
                    
                    <td className="py-2 px-3 border border-gray-200 text-gray-500">{st.rollNumber || '-'}</td>
                    <td className="py-2 px-4 border border-gray-200 font-semibold text-emerald-900 text-left">{st.student?.name}</td>

                    {subjects.map(sub => {
                      const val = allMarks[st.id]?.[sub.id] ?? '';
                      const numVal = Number(val);
                      const isLowScore = val !== '' && numVal < 40;

                      return (
                        <td key={sub.id} className="py-1.5 px-1 border border-gray-200">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!isCurrentYear}
                            value={val}
                            onChange={(e) => handleScoreChange(st.id, sub.id, e.target.value)}
                            className={`w-16 text-center border rounded px-1 py-1 text-xs focus:outline-none ${
                              isLowScore ? 'text-red-600 font-bold border-red-400 bg-red-50' : 'border-gray-300'
                            } ${!isCurrentYear ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          />
                        </td>
                      );
                    })}

                    <td className="py-2 px-2 border border-gray-200 font-bold text-emerald-800 bg-emerald-50/30">
                      {calculateTotal(st.id)}
                    </td>

                    <td className="py-2 px-2 border border-gray-200">
                      {getPassFailStatus(st.id)}
                    </td>

                    {/* 🟢 နှစ်ဟောင်းဖြစ်ပါက Save ခလုတ်မပေါ်ဘဲ View Only ဟုသာပြမည် */}
                    <td className="py-2 px-2 border border-gray-200">
                      {isCurrentYear ? (
                        <button
                          onClick={() => handleSaveStudentMarks(st.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] px-2.5 py-1 rounded transition shadow-sm font-medium"
                        >
                          Save
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[10px] font-medium">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7 + subjects.length} className="text-center py-8 text-gray-400">
                    Please select a grade or no student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};