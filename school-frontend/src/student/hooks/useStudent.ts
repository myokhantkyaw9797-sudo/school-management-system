import { useState, useEffect } from 'react';
import { fetchAllEnrollments } from '../api/enrollmentApi';
import { useAcademicYearStore } from '../../academic-year/store/useAcademicYearStore';

export const useStudent = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL'); // ALL, G-1, G-2 ...

  const { selectedYearId } = useAcademicYearStore();

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await fetchAllEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [selectedYearId]); // Header Dropdown ပြောင်းတိုင်း API ပြန်ခေါ်မည်

  // Frontend Side Filtering logic (Academic Year & Grade)
  const filteredEnrollments = enrollments.filter((item) => {
    // 1. Academic Year စစ်ထုတ်ခြင်း
    const matchesYear = selectedYearId 
      ? item.academicYear?.id === selectedYearId 
      : true;

    // 2. Grade စစ်ထုတ်ခြင်း
    const matchesGrade = selectedGrade === 'ALL'
      ? true
      : item.grade?.gradeName === selectedGrade;

    return matchesYear && matchesGrade;
  });

  return {
    enrollments: filteredEnrollments,
    loading,
    selectedGrade,
    setSelectedGrade,
    reloadEnrollments: loadEnrollments,
  };
};