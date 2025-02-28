import { supabase } from './supabaseClient';

export const getReports = async (patientId) => {
  const { data, error } = await supabase.storage.from('reports').list(patientId);

  if (error) {
    throw new Error(error.message);
  }

  const reportUrls = await Promise.all(
    data.map(async (file) => {
      const { signedURL } = await supabase.storage.from('reports').createSignedUrl(`${patientId}/${file.name}`, 60);
      return { name: file.name, url: signedURL };
    })
  );

  return reportUrls;
};