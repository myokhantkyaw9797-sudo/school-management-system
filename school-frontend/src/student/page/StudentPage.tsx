
import StudentList from '../components/StudentList';

export default function StudentPage() {
  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">

        {/* Student List Component ခေါ်ယူပြသခြင်း */}
        <StudentList />
      </div>
    </div>
  );
}