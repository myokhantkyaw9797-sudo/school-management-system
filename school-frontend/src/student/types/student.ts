export type Gender = 'MALE' | 'FEMALE';
export type StudentStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'INACTIVE';

export interface StudentResponseDto {
  id: string; // UUID (String အဖြစ် လက်ခံမည်)
  studentCode: number;
  name: string;
  photoUrl?: string;
  dob?: string; // LocalDate (YYYY-MM-DD)
  gender?: Gender;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  status: StudentStatus;
}

export interface StudentRequestDto {
  studentCode: number;
  name: string;
  photoUrl?: string;
  dob?: string;
  gender?: Gender;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  status?: StudentStatus;
}