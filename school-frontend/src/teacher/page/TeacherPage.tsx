import React, { useEffect, useState } from 'react';
import { getTeachersByAcademicYear, getSubjectTeachersByTeacher, updateTeacher, type Teacher } from '../api/teacherApi';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useAcademicYearStore } from '../../academic-year/store/useAcademicYearStore';
import axios from 'axios';

export const TeacherPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [showAddTeacherModal, setShowAddTeacherModal] = useState<boolean>(false);
  const [newTeacherData, setNewTeacherData] = useState({
    fullName: '',
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    degree: '',
    position: 'PRIMARY_SCHOOL_TEACHER',
  });

  const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [teacherSubjectsMap, setTeacherSubjectsMap] = useState<{ [key: string]: any[] }>({});
  const [academicYearsList, setAcademicYearsList] = useState<any[]>([]);

  const { username: currentUsername, role } = useAuthStore();
  const { selectedYearId } = useAcademicYearStore();
  
  const isPrincipal = role === 'ROLE_PRINCIPAL' || role === 'PRINCIPAL';

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/academic-years', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAcademicYearsList(res.data || []);
      } catch (err) {
        console.error('Failed to fetch academic years', err);
      }
    };
    fetchAcademicYears();
  }, []);

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
        } catch (err) {
          console.error(`Error fetching subjects for teacher ${teacher.fullName}:`, err);
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

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [gradeRes, subjectRes] = await Promise.all([
        axios.get('http://localhost:8080/api/grades', { headers }).catch(() => ({ data: [] })),
        axios.get('http://localhost:8080/api/subjects', { headers }).catch(() => ({ data: [] }))
      ]);

      setGrades(Array.isArray(gradeRes.data) ? gradeRes.data : (gradeRes.data?.content || gradeRes.data?.data || []));
      setSubjects(Array.isArray(subjectRes.data) ? subjectRes.data : (subjectRes.data?.content || subjectRes.data?.data || []));
    } catch (err) {
      console.error('Failed to fetch grades or subjects', err);
    }
  };

  useEffect(() => {
    if (selectedYearId) {
      fetchTeachers(selectedYearId);
    }
  }, [selectedYearId]);

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/teachers', {
        ...newTeacherData,
        academicYearId: selectedYearId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Teacher successfully registered.');
      setShowAddTeacherModal(false);
      setNewTeacherData({
        fullName: '',
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        degree: '',
        position: 'PRIMARY_SCHOOL_TEACHER',
      });
      if (selectedYearId) fetchTeachers(selectedYearId);
    } catch (error: any) {
      console.error('Add Teacher Error:', error);
      const msg = error.response?.data?.message || 'Failed to register new teacher.';
      alert(typeof msg === 'string' ? msg : 'Failed to register new teacher.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    try {
      const updatePayload = {
        fullName: editingTeacher.fullName,
        username: editingTeacher.username,
        email: editingTeacher.email,
        phoneNumber: editingTeacher.phoneNumber,
        degree: editingTeacher.degree,
        position: editingTeacher.position,
        active: editingTeacher.active ?? true,
        password: null
      };

      const updated = await updateTeacher(editingTeacher.id, updatePayload);

      setTeachers((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setEditingTeacher(null);
      alert(`Updated information for ${updated.fullName} successfully.`);
    } catch (error: any) {
      console.error('Update Error Detail:', error.response?.data || error);
      const serverError = error.response?.data?.message || error.response?.data?.error || error.response?.data;
      alert(typeof serverError === 'string' ? serverError : 'Failed to update information.');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTeacher || !selectedGradeId || !selectedSubjectId || !selectedYearId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/subject-teachers', {
        teacherId: assigningTeacher.id,
        academicYearId: selectedYearId,
        gradeId: selectedGradeId,
        subjectId: selectedSubjectId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Assignment successful.');
      setAssigningTeacher(null);
      setSelectedGradeId('');
      setSelectedSubjectId('');
      fetchTeachers(selectedYearId);
    } catch (error: any) {
      console.error('Assign Error:', error.response?.data || error);
      const msg = error.response?.data?.message || 'Failed to assign teacher.';
      alert(typeof msg === 'string' ? msg : 'Failed to assign teacher.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-900">Teachers List & Assignments</h2>
          <p className="text-xs text-gray-500">Teachers' grade and subject assignments for the selected academic year</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200">
            Total Teachers: {teachers.length}
          </span>

          {isPrincipal && isCurrentYear && (
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <span>+ Add New Teacher</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-xl shadow-sm">
          Loading data...
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm">
          No teachers found for this academic year.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => {
            const isSelf = currentUsername === teacher.username;
            const canEdit = isCurrentYear && (isSelf || isPrincipal);
            const assignedSubjects = teacherSubjectsMap[teacher.id];

            return (
              <div 
                key={teacher.id} 
                className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600"></div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{teacher.fullName}</h3>
                      <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-md border border-emerald-200">
                        {teacher.position || 'Teacher'}
                      </span>
                    </div>
                    {canEdit ? (
                      <button
                        onClick={() => setEditingTeacher(teacher)}
                        className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                      >
                        Edit
                      </button>
                    ) : !isCurrentYear ? (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md border font-medium">Past Year</span>
                    ) : null}
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                    <p><span className="font-semibold text-gray-700">Degree:</span> {teacher.degree || '-'}</p>
                    <p><span className="font-semibold text-gray-700">Email:</span> {teacher.email || '-'}</p>
                    <p><span className="font-semibold text-gray-700">Phone:</span> {teacher.phoneNumber || '-'}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-100 space-y-2">
                  <div className="text-xs font-bold text-emerald-900 flex justify-between items-center">
                    <span>📖 Assigned Classes & Subjects</span>
                    
                    {isPrincipal && isCurrentYear && (
                      <button 
                        onClick={() => {
                          setAssigningTeacher(teacher);
                          fetchDropdownData();
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline"
                      >
                        + Edit Assignment
                      </button>
                    )}
                  </div>
                  
                  {!Array.isArray(assignedSubjects) || assignedSubjects.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No assignments yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedSubjects.map((item: any, idx: number) => (
                        <span key={idx} className="inline-flex items-center text-xs bg-white text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs font-medium">
                          🏫 {item.gradeName} : <span className="text-gray-700 ml-1">{item.subjectName}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 border-b pb-2">
              Register New Teacher
            </h3>
            <form onSubmit={handleAddTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newTeacherData.fullName}
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={newTeacherData.username}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, username: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newTeacherData.password}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Position</label>
                  <select
                    value={newTeacherData.position}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="PRIMARY_SCHOOL_TEACHER">Primary School Teacher</option>
                    <option value="MIDDLE_SCHOOL_TEACHER">Middle School Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={newTeacherData.degree}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, degree: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newTeacherData.email}
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newTeacherData.phoneNumber}
                  onChange={(e) => setNewTeacherData({ ...newTeacherData, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 border-b pb-2">
              Edit Teacher Information
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={editingTeacher.position || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    disabled={!isPrincipal}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={editingTeacher.degree || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, degree: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingTeacher.phoneNumber || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Grade & Subject Modal */}
      {assigningTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-emerald-900 border-b pb-2">
              Assign Grade & Subject for {assigningTeacher.fullName}
            </h3>
            
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Grade</label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  required
                >
                  <option value="">-- Select Grade --</option>
                  {grades.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.gradeName || g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.subjectName || s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setAssigningTeacher(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};