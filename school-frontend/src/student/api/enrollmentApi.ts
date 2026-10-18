import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/enrollments';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Academic Year အလိုက် စာရင်းအားလုံးဆွဲမည်
export const fetchAllEnrollments = async () => {
  const response = await axios.get(`${API_BASE_URL}/all`, getAuthHeader());
  return response.data;
};

// Grade အလိုက် သီးသန့် Filter လုပ်မည်
export const fetchEnrollmentsByYearAndGrade = async (academicYearId: string, gradeId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/filter?academicYearId=${academicYearId}&gradeId=${gradeId}`,
    getAuthHeader()
  );
  return response.data;
};

// 🟢 ကျောင်းသားအသစ် အချက်အလက်အသစ် ထည့်သွင်းရန် (အသစ်တိုးရန်)
export const createEnrollment = async (enrollmentData: any) => {
  const response = await axios.post(
    `${API_BASE_URL}`, // သို့မဟုတ် Backend endpoint ပုံစံအတိုင်း
    enrollmentData,
    getAuthHeader()
  );
  return response.data;
};

// Enrollment ပြင်ဆင်မည်
export const updateEnrollment = async (id: string, enrollmentData: any) => {
  const response = await axios.put(
    `${API_BASE_URL}/update/${id}`,
    enrollmentData,
    getAuthHeader()
  );
  return response.data;
};