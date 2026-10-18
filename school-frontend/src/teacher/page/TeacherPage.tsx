import React, { useEffect, useState } from 'react';
import { getTeachersByAcademicYear, getSubjectTeachersByTeacher, updateTeacher, type Teacher } from '../api/teacherApi';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useAcademicYearStore } from '../../academic-year/store/useAcademicYearStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { translations } from '../../utils/translations';
import axios from 'axios';

export const TeacherPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // ဆရာကိုယ်တိုင် ကိုယ်ရေးအချက်အလက်ပြင်ရန် State
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // ကျောင်းအုပ်မှ အတန်းနှင့် ဘာသာတွဲ စီမံရန် State များ
  const [managingAssignmentTeacher, setManagingAssignmentTeacher] = useState<any | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // 🟢 Academic Years စာရင်း သိမ်းရန် State (လက်ရှိနှစ် ဟုတ်မဟုတ် စစ်ဆေးရန်)
  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);

  const { language } = useLanguageStore();
  const t = translations[language];

  const [teacherSubjectsMap, setTeacherSubjectsMap] = useState<{ [key: string]: any[] }>({});
  const { username: currentUsername, role } = useAuthStore();
  const { selectedYearId } = useAcademicYearStore();
  
  const isPrincipal = role === 'ROLE_PRINCIPAL' || role === 'PRINCIPAL';

  // Academic Years များကို ခေါ်ယူခြင်း
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/academic-years', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setAcademicYearsList(res.data || []);
      } catch (err) {
        console.error('Failed to fetch academic years', err);
      }
    };
    fetchAcademicYears();
  }, []);

  // ရွေးချယ်ထားသော ပညာသင်နှစ်သည် လက်ရှိနှစ် (Current Year) ဟုတ်မဟုတ် စစ်ဆေးခြင်း
  const currentYearObj = academicYearsList.find((y: any) => y.id === selectedYearId);
  const isCurrentYear = currentYearObj ? Boolean(currentYearObj.isCurrent) : true;

  const fetchTeachers = async (yearId: string) => {
    setLoading(true);
    try {
      const data = await getTeachersByAcademicYear(yearId);
      setTeachers(data || []);
      const subjectsMap: { [key: string]: any[] } = {};
      for (const teacher of (data || [])) {
        try {
          const resData = await getSubjectTeachersByTeacher(teacher.id, yearId);
          subjectsMap[teacher.id] = Array.isArray(resData) ? resData : [];
        } catch {
          subjectsMap[teacher.id] = [];
        }
      }
      setTeacherSubjectsMap(subjectsMap);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYearId) fetchTeachers(selectedYearId);
  }, [selectedYearId]);

  // ဆရာကိုယ်တိုင် Profile နှိပ်ပြင်ရန်
  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher({ ...teacher });
    setIsEditModalOpen(true);
  };

  // ဆရာကိုယ်တိုင် Profile သိမ်းရန်
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    try {
      await updateTeacher(editingTeacher.id, editingTeacher);
      alert(language === 'mm' ? 'ကိုယ်ရေးအချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။' : 'Profile successfully updated.');
      setIsEditModalOpen(false);
      if (selectedYearId) fetchTeachers(selectedYearId);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      alert(typeof msg === 'string' ? msg : 'Failed to update profile.');
    }
  };

  // ကျောင်းအုပ်မှ Manage နှိပ်သည့်အခါ Grade နှင့် Subject များကို ခေါ်ယူခြင်း
  const handleManageAssignment = async (teacher: Teacher) => {
    setManagingAssignmentTeacher(teacher);
    setIsAssignmentModalOpen(true);
    setGradesList([]);
    setSubjectsList([]);

    try {
      const storedToken = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${storedToken}` };

      // Grades များကို ယူခြင်း
      const gradeRes = await axios.get('http://localhost:8080/api/grade/find', { headers });
      const gradesData = Array.isArray(gradeRes.data) ? gradeRes.data : gradeRes.data?.content || [];
      setGradesList(gradesData);

      // Subjects များကို ယူခြင်း
      const subjectRes = await axios.get('http://localhost:8080/api/subject/all', { headers });
      const subjectsData = Array.isArray(subjectRes.data) ? subjectRes.data : subjectRes.data?.content || [];
      setSubjectsList(subjectsData);

    } catch (err) {
      console.error('Failed to fetch grades or subjects', err);
    }
  };

  // အတန်းနှင့် ဘာသာရပ် ချိတ်ဆက်မှုကို သိမ်းဆည်းရန်
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGradeId || !selectedSubjectId || !managingAssignmentTeacher) return;

    try {
      const storedToken = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/subject-teachers', {
        teacherId: managingAssignmentTeacher.id,
        gradeId: selectedGradeId,
        subjectId: selectedSubjectId,
        academicYearId: selectedYearId
      }, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      alert(language === 'mm' ? 'အတန်းနှင့် ဘာသာရပ် ချိတ်ဆက်မှု အောင်မြင်ပါသည်။' : 'Successfully assigned subject to teacher.');
      setIsAssignmentModalOpen(false);
      setSelectedGradeId('');
      setSelectedSubjectId('');
      if (selectedYearId) fetchTeachers(selectedYearId);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to assign.';
      alert(typeof msg === 'string' ? msg : 'Failed to assign.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-900">{t.teacherListTitle}</h2>
          <p className="text-xs text-gray-500">
            {isCurrentYear ? t.teacherListSub : (language === 'mm' ? 'ဟောင်းနေသော ပညာသင်နှစ် (ကြည့်ရှုရန်သာ)' : 'Past Academic Year (Read-only)')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200">
            {t.totalTeachersCount} {teachers.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-xl shadow-sm">
          Loading data...
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm">
          {t.noTeachersFound}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => {
            const assignedSubjects = teacherSubjectsMap[teacher.id];
            
            // ဆရာကိုယ်တိုင်မှသာ Edit ခလုတ်ပေါ်မည် (လက်ရှိနှစ်ဖြစ်မှသာ)
            const isOwnerTeacher = teacher.username === currentUsername;

            return (
              <div key={teacher.id} className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{teacher.fullName}</h3>
                      <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-md border border-emerald-200">
                        {teacher.position || 'Teacher'}
                      </span>
                    </div>

                    {/* ဆရာကိုယ်တိုင်မှသာ Edit ခလုတ်ပေါ်မည် (လက်ရှိနှစ်တွင်သာ ပြင်ခွင့်ရှိမည်) */}
                    {isCurrentYear && isOwnerTeacher && (
                      <button
                        onClick={() => handleEditClick(teacher)}
                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
                      >
                        {t.edit || 'Edit Profile'}
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                    <p><span className="font-semibold text-gray-700">{t.degree}:</span> {teacher.degree || '-'}</p>
                    <p><span className="font-semibold text-gray-700">{t.email}:</span> {teacher.email || '-'}</p>
                    <p><span className="font-semibold text-gray-700">{t.phone}:</span> {teacher.phoneNumber || '-'}</p>
                  </div>

                  {/* အတန်းနှင့် ဘာသာတွဲ (လက်ရှိနှစ်ဖြစ်ပြီး ကျောင်းအုပ်မှသာ စီမံခန့်ခွဲခွင့်ရှိသည်) */}
                  <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-100 space-y-2">
                    <div className="text-xs font-bold text-emerald-900 flex justify-between items-center">
                      <span>📖 {t.assignedClasses}</span>
                      {isPrincipal && isCurrentYear && (
                        <button
                          onClick={() => handleManageAssignment(teacher)}
                          className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded transition font-bold shadow-sm"
                        >
                          + Manage
                        </button>
                      )}
                    </div>
                    {!Array.isArray(assignedSubjects) || assignedSubjects.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No assignments yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedSubjects.map((item: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center text-xs bg-white text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
                            🏫 {item.gradeName} : <span className="text-gray-700 ml-1">{item.subjectName}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ဆရာကိုယ်တိုင် ကိုယ်ရေးအချက်အလက်ပြင်ဆင်သည့် Modal */}
      {isEditModalOpen && editingTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 border-b pb-2">
              {language === 'mm' ? 'ကိုယ့်ကိုယ်ပိုင် အချက်အလက် ပြင်ဆင်ရန်' : 'Edit My Profile'}
            </h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                <input
                  type="text"
                  value={editingTeacher.fullName || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ဘွဲ့ဒီဂရီ' : 'Degree'}</label>
                  <input
                    type="text"
                    value={editingTeacher.degree || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, degree: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ရာထူး (မပြင်နိုင်ပါ)' : 'Position (Read-only)'}</label>
                  <input
                    type="text"
                    value={editingTeacher.position || ''}
                    disabled
                    className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg p-2.5 text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                  <input
                    type="email"
                    value={editingTeacher.email || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={editingTeacher.phoneNumber || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phoneNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {t.cancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
                >
                  {t.save || 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ကျောင်းအုပ်အတွက် အတန်းနှင့် ဘာသာတွဲ ချိတ်ဆက်မည့် Modal */}
      {isAssignmentModalOpen && managingAssignmentTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-emerald-900 border-b pb-2">
              {language === 'mm' ? 'အတန်းနှင့် ဘာသာတွဲ ချိတ်ရန်' : 'Assign Class & Subject'}
            </h3>
            <p className="text-xs text-gray-600">
              Teacher: <span className="font-bold text-emerald-800">{managingAssignmentTeacher.fullName}</span>
            </p>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'အတန်းရွေးချယ်ရန်' : 'Select Grade'}</label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">{language === 'mm' ? '-- အတန်းရွေးပါ --' : '-- Select Grade --'}</option>
                  {gradesList.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.name || g.gradeName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ဘာသာရပ်ရွေးချယ်ရန်' : 'Select Subject'}</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">{language === 'mm' ? '-- ဘာသာရပ်ရွေးပါ --' : '-- Select Subject --'}</option>
                  {subjectsList.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.subjectName || s.title || 'Unnamed Subject'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {t.cancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
                >
                  {language === 'mm' ? 'ချိတ်ဆက်မည်' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};