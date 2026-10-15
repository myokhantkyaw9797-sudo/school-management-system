import axios from 'axios';

const API_URL = 'http://localhost:8080/api/teachers';

export interface Teacher {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  degree: string;
  position: string;
  active: boolean;
}

// Helper function to get token header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ၁။ Academic Year ID ဖြင့် ဆရာ/မများ ဆွဲထုတ်ရန်
export const getTeachersByAcademicYear = async (academicYearId: string): Promise<Teacher[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/by-year`, {
    params: { academicYearId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ၂။ ဆရာ/မ Profile ပြင်ဆင်ရန် (Update)
export const updateTeacher = async (id: string, teacherData: Partial<Teacher>): Promise<Teacher> => {
  const response = await axios.put(`${API_URL}/update/${id}`, teacherData, getAuthHeader());
  return response.data;
};

// 🟢 ၃။ ဆရာ/မ တစ်ဦးချင်းစီ၏ တာဝန်ကျ အတန်းနှင့် ဘာသာရပ်များ ဆွဲထုတ်ရန် API
export const getSubjectTeachersByTeacher = async (teacherId: string, academicYearId: string) => {
  const response = await axios.get(`http://localhost:8080/api/subject-teachers/by-teacher`, {
    params: {
      teacherId,
      academicYearId
    },
    ...getAuthHeader()
  });
  return response.data;
};