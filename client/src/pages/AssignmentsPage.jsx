import React from 'react';
import { useParams } from 'react-router-dom';
import AssignmentList from '../components/assignments/AssignmentList';

const AssignmentsPage = () => {
  const { courseId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AssignmentList />
    </div>
  );
};

export default AssignmentsPage;