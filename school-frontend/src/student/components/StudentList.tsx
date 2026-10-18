import React, { useState, useEffect } from 'react';
import { useStudent } from '../hooks/useStudent';
import { updateEnrollment, createEnrollment } from '../api/enrollmentApi';
import { useLanguageStore } from '../../store/useLanguageStore';
import { translations } from '../../utils/translations';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useAcademicYearStore } from '../../academic-year/store/useAcademicYearStore';
import axios from 'axios';

export default function StudentList() {
  const { enrollments, loading, selectedGrade, setSelectedGrade, reloadEnrollments } = useStudent();
  const { language } = useLanguageStore();
  const t = translations[language];

  const { username: currentUsername, role, token } = useAuthStore();
  const { selectedYearId } = useAcademicYearStore();

  const isPrincipal = role === 'ROLE_PRINCIPAL' || role === 'PRINCIPAL';

  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // ကျောင်းသားအသစ်ထည့်မည့် Modal (ဓာတ်ပုံ URL ပါဝင်သည်)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    studentCode: '',
    rollNumber: '',
    gender: 'MALE',
    dob: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    photoUrl: '',
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Academic Years နှင့် Grades များကို API မှ ခေါ်ယူခြင်း
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = token || localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${storedToken}` };

        // Academic Years
        const yearRes = await axios.get('http://localhost:8080/api/academic-years', { headers });
        setAcademicYearsList(yearRes.data || []);

        // Grades
        const gradeRes = await axios.get('http://localhost:8080/api/grade/find', { headers });
        setGradesList(gradeRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, [token]);

  const currentYearObj = academicYearsList.find((y: any) => y.id === selectedYearId);
  const isCurrentYear = currentYearObj ? Boolean(currentYearObj.isCurrent) : true;

  const filteredEnrollments = enrollments.filter((item: any) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const studentName = String(item.student?.name || '').toLowerCase();
    const studentCode = String(item.student?.studentCode || '').toLowerCase();
    return studentName.includes(query) || studentCode.includes(query);
  });

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    const rollA = Number(a.rollNumber) || 0;
    const rollB = Number(b.rollNumber) || 0;
    return rollA - rollB;
  });

  const headTeacherName =
    sortedEnrollments.length > 0 && selectedGrade !== 'ALL'
      ? sortedEnrollments[0]?.headTeacher?.fullName || '-'
      : null;

  const headTeacherUsername =
    sortedEnrollments.length > 0 && selectedGrade !== 'ALL'
      ? sortedEnrollments[0]?.headTeacher?.username || ''
      : '';

  const isHeadTeacherOfThisGrade = headTeacherUsername === currentUsername;
  const canAddOrEdit = isPrincipal || isHeadTeacherOfThisGrade;

  // 🟢 ပြီးသွားသောနှစ်ဖြစ်ပါက Edit ခွင့်မပြုပါ
  const canEditStudent = (item: any) => {
    if (!isCurrentYear) return false;
    if (isPrincipal) return true;
    return item.headTeacher?.username === currentUsername;
  };

  const handleEditClick = (item: any) => {
    setSelectedEnrollment({
      ...item,
      studentName: item.student?.name || '',
      gender: item.student?.gender || 'MALE',
      dob: item.student?.dob || '',
      guardianName: item.student?.guardianName || '',
      guardianPhone: item.student?.guardianPhone || '',
      address: item.student?.address || '',
      rollNumber: item.rollNumber || '',
    });
    setIsModalOpen(true); // 🟢 Modal ပွင့်စေရန် သေချာထည့်သွင်းပြီးပါပြီ
  };

  // ကျောင်းသားအချက်အလက် ပြင်ဆင်မှုကို Save လုပ်ရန် Submit Function
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    try {
      await updateEnrollment(selectedEnrollment.id, {
        rollNumber: selectedEnrollment.rollNumber,
        studentName: selectedEnrollment.studentName,
        gender: selectedEnrollment.gender,
        dob: selectedEnrollment.dob,
        guardianName: selectedEnrollment.guardianName,
        guardianPhone: selectedEnrollment.guardianPhone,
        address: selectedEnrollment.address,
      });

      alert(language === 'mm' ? 'ကျောင်းသားအချက်အလက်များ အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။' : 'Student successfully updated.');
      setIsModalOpen(false);
      await reloadEnrollments();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update student.';
      alert(typeof msg === 'string' ? msg : 'Failed to update student.');
    }
  };

  // ကျောင်းသားအသစ် ထည့်သွင်းခြင်း
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentHeadTeacherId = sortedEnrollments.length > 0 
        ? sortedEnrollments[0]?.headTeacher?.id 
        : null;

      if (!currentHeadTeacherId && !isPrincipal) {
        alert(language === 'mm' ? 'ဤအတန်းအတွက် အတန်းပိုင်ဆရာ မရှိသေးပါ။' : 'Head teacher not found for this grade.');
        return;
      }

      const foundGrade = gradesList.find((g: any) => g.name === selectedGrade || g.gradeName === selectedGrade);
      const gradeUuid = foundGrade ? foundGrade.id : selectedGrade;

      await createEnrollment({
        studentName: newStudentData.name,
        studentCode: newStudentData.studentCode,
        rollNumber: newStudentData.rollNumber,
        gender: newStudentData.gender,
        dob: newStudentData.dob,
        guardianName: newStudentData.guardianName,
        guardianPhone: newStudentData.guardianPhone,
        address: newStudentData.address,
        photoUrl: newStudentData.photoUrl,
        academicYearId: selectedYearId,
        gradeId: gradeUuid,
        headTeacherId: currentHeadTeacherId,
      });

      alert(language === 'mm' ? 'ကျောင်းသားအသစ် ထည့်သွင်းပြီးပါပြီ။' : 'New student successfully added.');
      setIsAddModalOpen(false);
      setNewStudentData({
        name: '',
        studentCode: '',
        rollNumber: '',
        gender: 'MALE',
        dob: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
        photoUrl: '',
      });
      await reloadEnrollments();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to add new student.';
      alert(typeof msg === 'string' ? msg : 'Failed to add new student.');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600 font-medium">Loading data...</div>;

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <label htmlFor="gradeFilter" className="text-sm font-bold text-emerald-800">
              {t.filterByGrade}
            </label>
            <select
              id="gradeFilter"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border border-emerald-600 rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-900 bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t.allStudents}</option>
              {['Grade-1','Grade-2','Grade-3','Grade-4','Grade-5','Grade-6','Grade-7','Grade-8'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={t.searchPlaceholderList}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-emerald-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none w-64 bg-white"
            />
          </div>

          <div className="text-xs text-gray-500 font-medium">
            {t.totalStudents} <span className="font-bold text-emerald-700">{sortedEnrollments.length}</span>
          </div>
        </div>

        {selectedGrade !== 'ALL' && (
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-emerald-900">
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">{t.headTeacher}</span>
              <span className="text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                {headTeacherName}
              </span>
            </div>

            {/* 🟢 လက်ရှိနှစ်ဖြစ်မှသာ ကျောင်းသားအသစ် ထည့်ခွင့်ရှိမည် */}
            {isCurrentYear && canAddOrEdit && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                <span>{language === 'mm' ? '+ ကျောင်းသားအသစ်ထည့်ရန်' : '+ Add New Student'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="px-4 py-3 text-center font-semibold">{selectedGrade !== 'ALL' ? t.rollNo : t.no}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.studentCode}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.name}</th>
              <th className="px-4 py-3 text-center font-semibold">{t.gender}</th>
              <th className="px-4 py-3 text-center font-semibold">{t.dob}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.guardian}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.phone}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.address}</th>
              <th className="px-4 py-3 text-center font-semibold">{t.action}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEnrollments.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  {t.noStudentMatch}
                </td>
              </tr>
            ) : (
              sortedEnrollments.map((item: any, index: number) => (
                <tr key={item.id} className="hover:bg-emerald-50 transition">
                  <td className="px-4 py-3 text-center font-bold text-gray-800">{selectedGrade !== 'ALL' ? item.rollNumber || index + 1 : index + 1}</td>
                  <td className="px-4 py-3 font-bold text-red-600">{item.student?.studentCode || '-'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{item.student?.name || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{item.student?.gender || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">{item.student?.dob || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{item.student?.guardianName || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item.student?.guardianPhone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{item.student?.address || '-'}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {isCurrentYear && canEditStudent(item) ? (
                      <button onClick={() => handleEditClick(item)} className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition">
                        {t.edit}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        {!isCurrentYear ? 'Read-only' : 'No Access'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ကျောင်းသားအချက်အလက် ပြင်ဆင်သည့် Modal */}
      {isModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 border-b pb-2">
              {language === 'mm' ? 'ကျောင်းသားအချက်အလက် ပြင်ဆင်ရန်' : 'Edit Student Information'}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ကျောင်းသားအမည်' : 'Full Name'}</label>
                  <input
                    type="text"
                    value={selectedEnrollment.studentName}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, studentName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ခုံအမှတ်' : 'Roll Number'}</label>
                  <input
                    type="text"
                    value={selectedEnrollment.rollNumber}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, rollNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ကျား/မ' : 'Gender'}</label>
                  <select
                    value={selectedEnrollment.gender}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, gender: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'မွေးနေ့' : 'Date of Birth'}</label>
                  <input
                    type="date"
                    value={selectedEnrollment.dob}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, dob: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'အုပ်ထိန်းသူအမည်' : 'Guardian Name'}</label>
                  <input
                    type="text"
                    value={selectedEnrollment.guardianName}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, guardianName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ဆက်သွယ်ရန်ဖုန်း' : 'Guardian Phone'}</label>
                  <input
                    type="text"
                    value={selectedEnrollment.guardianPhone}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, guardianPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'နေရပ်လိပ်စာ' : 'Address'}</label>
                <input
                  type="text"
                  value={selectedEnrollment.address}
                  onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {t.cancel}
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

      {/* ကျောင်းသားအသစ်ထည့်မည့် Modal (ဓာတ်ပုံ URL ပါဝင်သည်) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 border-b pb-2">
              {language === 'mm' ? 'ကျောင်းသားအသစ် ထည့်သွင်းရန်' : 'Register New Student'}
            </h3>
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ကျောင်းသားအမည်' : 'Full Name'}</label>
                <input
                  type="text"
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ကျောင်းသားကုဒ်' : 'Student Code'}</label>
                  <input
                    type="text"
                    value={newStudentData.studentCode}
                    onChange={(e) => setNewStudentData({ ...newStudentData, studentCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ခုံအမှတ်' : 'Roll Number'}</label>
                  <input
                    type="text"
                    value={newStudentData.rollNumber}
                    onChange={(e) => setNewStudentData({ ...newStudentData, rollNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ဓာတ်ပုံလင့်ခ် (Photo URL)' : 'Photo URL'}</label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={newStudentData.photoUrl}
                  onChange={(e) => setNewStudentData({ ...newStudentData, photoUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ကျား/မ' : 'Gender'}</label>
                  <select
                    value={newStudentData.gender}
                    onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'မွေးနေ့' : 'Date of Birth'}</label>
                  <input
                    type="date"
                    value={newStudentData.dob}
                    onChange={(e) => setNewStudentData({ ...newStudentData, dob: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'အုပ်ထိန်းသူအမည်' : 'Guardian Name'}</label>
                  <input
                    type="text"
                    value={newStudentData.guardianName}
                    onChange={(e) => setNewStudentData({ ...newStudentData, guardianName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'ဆက်သွယ်ရန်ဖုန်း' : 'Guardian Phone'}</label>
                  <input
                    type="text"
                    value={newStudentData.guardianPhone}
                    onChange={(e) => setNewStudentData({ ...newStudentData, guardianPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'mm' ? 'နေရပ်လိပ်စာ' : 'Address'}</label>
                <input
                  type="text"
                  value={newStudentData.address}
                  onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
                >
                  {t.save || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}