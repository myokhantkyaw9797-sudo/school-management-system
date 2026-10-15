import axios from "axios";


const API_BASE_URL ='http://localhost:8080/api/exam-marks';

export const saveOrUpdateExamMark = async (
    data: {
        examMonth: string;
        score: number;
        enrollmentId: string;
        subjectId: string;
    },
    token: string
) => {
    const response = await axios.post(API_BASE_URL, data,{
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getMarksByEnrollment = async (enrollmentId: string, examMonth: string, token: string) => {
    const response = await axios.get(`${API_BASE_URL}/enrollment/${enrollmentId}`, {
        params: { examMonth },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};