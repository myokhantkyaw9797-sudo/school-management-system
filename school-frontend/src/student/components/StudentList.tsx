import React, { useState } from 'react';
import { useStudent } from '../hook/useStudent';
import { updateEnrollment } from '../api/enrollmentApi';

export default function StudentList() {
  const { enrollments, loading, selectedGrade, setSelectedGrade, reloadEnrollments } = useStudent();
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentUsername = localStorage.getItem('username');
  const currentUserRole = localStorage.getItem('role');

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

  const canEditStudent = (item: any) => {
    if (currentUserRole === 'ROLE_PRINCIPAL' || currentUserRole === 'PRINCIPAL') {
      return true;
    }
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
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    try {
      const payload = {
        studentId: selectedEnrollment.student?.id,
        headTeacherId: selectedEnrollment.headTeacher?.id,
        academicYearId: selectedEnrollment.academicYear?.id,
        gradeId: selectedEnrollment.grade?.id,
        rollNumber: selectedEnrollment.rollNumber,
        name: selectedEnrollment.studentName,
        gender: selectedEnrollment.gender,
        dob: selectedEnrollment.dob,
        guardianName: selectedEnrollment.guardianName,
        guardianPhone: selectedEnrollment.guardianPhone,
        address: selectedEnrollment.address,
      };

      await updateEnrollment(selectedEnrollment.id, payload);
      setIsModalOpen(false);
      await reloadEnrollments();
      alert('Student information updated successfully.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update student information.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600 font-medium">Loading data...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter & Search Header Section */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <label htmlFor="gradeFilter" className="text-sm font-bold text-emerald-800">
              Filter by Grade:
            </label>
            <select
              id="gradeFilter"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border border-emerald-600 rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Students</option>
              <option value="Grade-1">G-1</option>
              <option value="Grade-2">G-2</option>
              <option value="Grade-3">G-3</option>
              <option value="Grade-4">G-4</option>
              <option value="Grade-5">G-5</option>
              <option value="Grade-6">G-6</option>
              <option value="Grade-7">G-7</option>
              <option value="Grade-8">G-8</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-emerald-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 bg-white"
            />
            <button
              type="button"
              className="px-3 py-1.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
            >
              Search
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Total Students: <span className="font-bold text-emerald-700">{sortedEnrollments.length}</span>
          </div>
        </div>

        {selectedGrade !== 'ALL' && (
          <div className="pt-2 border-t border-gray-100 flex items-center text-sm font-semibold text-emerald-900">
            <span className="text-gray-600 mr-2">Head Teacher:</span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              {headTeacherName}
            </span>
          </div>
        )}
      </div>

      {/* Student List Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="px-4 py-3 text-center font-semibold">
                {selectedGrade !== 'ALL' ? 'Roll No' : 'No'}
              </th>
              <th className="px-4 py-3 text-left font-semibold">Student Code</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-center font-semibold">Gender</th>
              <th className="px-4 py-3 text-center font-semibold">DOB</th>
              <th className="px-4 py-3 text-left font-semibold">Guardian</th>
              <th className="px-4 py-3 text-left font-semibold">Phone</th>
              <th className="px-4 py-3 text-left font-semibold">Address</th>
              <th className="px-4 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEnrollments.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  No students found matching your search.
                </td>
              </tr>
            ) : (
              sortedEnrollments.map((item: any, index: number) => (
                <tr key={item.id} className="hover:bg-emerald-50 transition">
                  <td className="px-4 py-3 text-center font-bold text-gray-800">
                    {selectedGrade !== 'ALL' ? item.rollNumber || index + 1 : index + 1}
                  </td>
                  <td className="px-4 py-3 font-bold text-red-600">
                    {item.student?.studentCode || '-'}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {item.student?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {item.student?.gender || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">
                    {item.student?.dob || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.student?.guardianName || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {item.student?.guardianPhone || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {item.student?.address || '-'}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {canEditStudent(item) ? (
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition"
                      >
                        Edit
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No Access</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Edit Modal Popup */}
        {isModalOpen && selectedEnrollment && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 text-emerald-800 border-b pb-2">
                Edit Student Information
              </h3>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Student Code (Read-only)</label>
                  <input
                    type="text"
                    disabled
                    value={selectedEnrollment.student?.studentCode || ''}
                    className="mt-1 w-full border border-gray-200 bg-gray-100 rounded px-3 py-1.5 text-sm text-gray-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">Roll Number</label>
                  <input
                    type="number"
                    value={selectedEnrollment.rollNumber}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, rollNumber: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">Student Name</label>
                  <input
                    type="text"
                    value={selectedEnrollment.studentName}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, studentName: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Gender</label>
                    <select
                      value={selectedEnrollment.gender}
                      onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, gender: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={selectedEnrollment.dob}
                      onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, dob: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Guardian Name</label>
                    <input
                      type="text"
                      value={selectedEnrollment.guardianName}
                      onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, guardianName: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Guardian Phone</label>
                    <input
                      type="text"
                      value={selectedEnrollment.guardianPhone}
                      onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, guardianPhone: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">Address</label>
                  <textarea
                    rows={2}
                    value={selectedEnrollment.address}
                    onChange={(e) => setSelectedEnrollment({ ...selectedEnrollment, address: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}