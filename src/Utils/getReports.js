export const getReports = async (patientId) => {
  const response = await fetch('https://sail-backend.onrender.com/get-reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ patientId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch reports');
  }

  const data = await response.json();
  return data;
};