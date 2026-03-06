import { supabase } from './supabase';
export { supabase }; // Add this line

export const fetchAllContent = async () => {
  const { data, error } = await supabase
    .from('cultural_content')
    .select('*')
    .eq('status', 'approved');
  
  if (error) throw error;
  return data;
};

export const fetchDistrictContent = async (districtId: string) => {
  const { data, error } = await supabase
    .from('cultural_content')
    .select('*')
    .eq('district', districtId.toLowerCase())
    .eq('status', 'approved');
  
  if (error) throw error;
  return data;
};

export const submitContent = async (formData: FormData) => {
  const file = formData.get('media') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const district = formData.get('district') as string;
  const contributor = formData.get('contributor') as string;

  console.log("Starting upload for:", file.name);

  // 1. Upload file to Supabase Storage (bucket named 'media')
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file);

  if (uploadError) {
    console.error("Supabase Storage Error:", uploadError);
    throw uploadError;
  }

  console.log("Upload successful:", uploadData);

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  console.log("Public URL generated:", publicUrl);

  // 3. Insert metadata into Database
  const { data, error } = await supabase
    .from('cultural_content')
    .insert([
      {
        title,
        description,
        category,
        district: district.toLowerCase(),
        contributor,
        media_url: publicUrl,
        type: file.type.startsWith('video') ? 'video' : 'image',
        status: 'pending'
      }
    ]);

  if (error) {
    console.error("Supabase Database Error:", error);
    throw error;
  }
  
  return data;
};

// Admin operations
export const adminFetchAllContent = async () => {
  const { data, error } = await supabase
    .from('cultural_content')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchPendingContent = async () => {
  const { data, error } = await supabase
    .from('cultural_content')
    .select('*')
    .eq('status', 'pending');
  
  if (error) throw error;
  return data;
};

export const approveContent = async (id: string) => {
  const { data, error } = await supabase
    .from('cultural_content')
    .update({ status: 'approved' })
    .eq('id', id);
  
  if (error) throw error;
  return data;
};

export const rejectContent = async (id: string) => {
  const { data, error } = await supabase
    .from('cultural_content')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return data;
};
