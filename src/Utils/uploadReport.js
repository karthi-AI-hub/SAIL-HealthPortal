export const uploadReport = async (file, patientId, fileName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientId', patientId);
  formData.append('fileName', fileName);

  const response = await fetch('https://sail-backend.onrender.com/upload-report', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload file');
  }

  const data = await response.json();
  return data.path;
};