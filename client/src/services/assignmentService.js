import api from './api';

export const assignmentService = {
  // Get all assignments for a course
  getCourseAssignments: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/assignments`);
    return response.data;
  },

  // Get a single assignment
  getAssignment: async (courseId, assignmentId) => {
    const response = await api.get(`/courses/${courseId}/assignments/${assignmentId}`);
    return response.data;
  },

  // Create new assignment
  createAssignment: async (courseId, assignmentData) => {
    const response = await api.post(`/courses/${courseId}/assignments`, assignmentData);
    return response.data;
  },

  // Update assignment
  updateAssignment: async (courseId, assignmentId, assignmentData) => {
    const response = await api.put(
      `/courses/${courseId}/assignments/${assignmentId}`,
      assignmentData
    );
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (courseId, assignmentId) => {
    const response = await api.delete(`/courses/${courseId}/assignments/${assignmentId}`);
    return response.data;
  },

  // Submit assignment
  submitAssignment: async (courseId, assignmentId, submissionData) => {
    const formData = new FormData();
    if (submissionData.files) {
      for (let file of submissionData.files) {
        formData.append('files', file);
      }
    }
    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }

    const response = await api.post(
      `/courses/${courseId}/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get assignment submission
  getSubmission: async (courseId, assignmentId) => {
    const response = await api.get(
      `/courses/${courseId}/assignments/${assignmentId}/submission`
    );
    return response.data;
  },

  // Grade submission
  gradeSubmission: async (courseId, assignmentId, submissionId, gradeData) => {
    const response = await api.post(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      gradeData
    );
    return response.data;
  },
};