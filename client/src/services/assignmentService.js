import api from './api';

export const assignmentService = {
  // Create new assignment
  createAssignment: async (assignmentData) => {
    const formData = new FormData();
    
    // Append form fields
    formData.append('title', assignmentData.title);
    formData.append('description', assignmentData.description);
    formData.append('dueDate', assignmentData.dueDate);
    formData.append('totalPoints', assignmentData.totalPoints);
    formData.append('courseId', assignmentData.courseId);
    
    // Append files if any
    if (assignmentData.files && assignmentData.files.length > 0) {
      for (let file of assignmentData.files) {
        formData.append('files', file);
      }
    }

    const response = await api.post('/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all assignments for a course
  getCourseAssignments: async (courseId) => {
    const response = await api.get(`/assignments/course/${courseId}`);
    return response.data;
  },

  // Get a single assignment
  getAssignment: async (assignmentId) => {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data;
  },

  // Submit assignment (for students)
  submitAssignment: async (assignmentId, submissionData) => {
    const formData = new FormData();
    
    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }
    
    if (submissionData.files && submissionData.files.length > 0) {
      for (let file of submissionData.files) {
        formData.append('files', file);
      }
    }

    const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all submissions for an assignment (for teachers)
  getAssignmentSubmissions: async (assignmentId) => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  // Grade submission (for teachers)
  gradeSubmission: async (submissionId, gradeData) => {
    const response = await api.post(`/assignments/submissions/${submissionId}/grade`, gradeData);
    return response.data;
  },

  // Get all assignments for the logged-in user
  getUserAssignments: async () => {
    const response = await api.get('/assignments/user/all');
    return response.data;
  },

  // Get assignments dashboard data
  getAssignmentsDashboard: async () => {
    const response = await api.get('/assignments/dashboard');
    return response.data;
  },

  // Upload assignment
  uploadAssignment: async (formData) => {
    return api.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Get assignments by course
  getAssignmentsByCourse: async (courseId) => {
    return api.get(`/courses/${courseId}/assignments`);
  }
};

export default assignmentService;