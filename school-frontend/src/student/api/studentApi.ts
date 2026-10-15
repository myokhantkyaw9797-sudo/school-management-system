import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/students';

const getAuthHeader = () => {
  // LocalStorage ထဲတွင် Save ထားသည့် Token ကို ယူပါ
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const fetchAllStudents = async () => {
  const response = await axios.get(`${API_BASE_URL}/all`, getAuthHeader());
  return response.data;
};

export const fetchStudentsByAcademicYear = async (academicYearId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/academic-year/${academicYearId}`,
    getAuthHeader()
  );
  return response.data;
};

export const updateStudent = async (id: string, studentData: any) => {
  const response = await axios.put(
    `${API_BASE_URL}/${id}`,
    studentData,
    getAuthHeader()
  );
  return response.data;
};