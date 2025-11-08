import request from '@/utils/request';

/**
 * 任务提交相关API
 */

/**
 * 提交任务
 * @param {number} taskId - 任务ID
 * @param {object} data - 提交数据
 * @returns {Promise}
 */
export function submitTask(taskId, data) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/${taskId}/submit`,
    method: 'post',
    data
  });
}

/**
 * 审核任务提交
 * @param {number} submissionId - 提交记录ID
 * @param {object} data - 审核数据
 * @returns {Promise}
 */
export function reviewSubmission(submissionId, data) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/${submissionId}/review`,
    method: 'put',
    data
  });
}

/**
 * 撤回提交
 * @param {number} submissionId - 提交记录ID
 * @returns {Promise}
 */
export function revokeSubmission(submissionId) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/${submissionId}/revoke`,
    method: 'put'
  });
}

/**
 * 获取提交记录详情
 * @param {number} submissionId - 提交记录ID
 * @returns {Promise}
 */
export function getSubmissionDetail(submissionId) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/${submissionId}`,
    method: 'get'
  });
}

/**
 * 获取任务的所有提交记录
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function getTaskSubmissions(taskId) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/task/${taskId}`,
    method: 'get'
  });
}

/**
 * 获取任务的最新提交
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function getLatestSubmission(taskId) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/task/${taskId}/latest`,
    method: 'get'
  });
}

/**
 * 获取待审核的提交列表
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getPendingSubmissions(params) {
  return request({
    url: '/zhiyan/api/projects/tasks/submissions/pending',
    method: 'get',
    params
  });
}

/**
 * 获取项目的待审核提交列表
 * @param {number} projectId - 项目ID
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getProjectPendingSubmissions(projectId, params) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/project/${projectId}/pending`,
    method: 'get',
    params
  });
}

/**
 * 获取我的提交历史
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getMySubmissions(params) {
  return request({
    url: '/zhiyan/api/projects/tasks/submissions/my-submissions',
    method: 'get',
    params
  });
}

/**
 * 统计待审核的提交数量
 * @returns {Promise}
 */
export function countPendingSubmissions() {
  return request({
    url: '/zhiyan/api/projects/tasks/submissions/count/pending',
    method: 'get'
  });
}

/**
 * 统计项目的待审核提交数量
 * @param {number} projectId - 项目ID
 * @returns {Promise}
 */
export function countProjectPendingSubmissions(projectId) {
  return request({
    url: `/zhiyan/api/projects/tasks/submissions/count/project/${projectId}/pending`,
    method: 'get'
  });
}

/**
 * 上传单个附件
 * @param {File} file - 文件对象
 * @returns {Promise}
 */
export function uploadSubmissionFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/zhiyan/api/projects/tasks/submissions/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 批量上传附件
 * @param {FileList} files - 文件列表
 * @returns {Promise}
 */
export function uploadSubmissionFiles(files) {
  const formData = new FormData();
  
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  return request({
    url: '/zhiyan/api/projects/tasks/submissions/files/upload-batch',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 删除附件
 * @param {string} fileUrl - 文件URL
 * @returns {Promise}
 */
export function deleteSubmissionFile(fileUrl) {
  return request({
    url: '/zhiyan/api/projects/tasks/submissions/files',
    method: 'delete',
    params: { fileUrl }
  });
}

/**
 * 批量删除附件
 * @param {Array<string>} fileUrls - 文件URL列表
 * @returns {Promise}
 */
export function deleteSubmissionFiles(fileUrls) {
  return request({
    url: '/zhiyan/api/projects/tasks/submissions/files/batch',
    method: 'delete',
    data: fileUrls
  });
}

/**
 * 获取文件临时访问URL
 * @param {string} fileUrl - 文件URL
 * @returns {Promise}
 */
export function getPresignedUrl(fileUrl) {
  return request({
    url: '/zhiyan/api/projects/tasks/submissions/files/presigned-url',
    method: 'get',
    params: { fileUrl }
  });
}

