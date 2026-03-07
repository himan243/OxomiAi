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
  const contributor = formData.get('contributor') as string || 'Guest User';
  const parentId = formData.get('parentId') as string | null;

  console.log("Starting upload for:", file ? file.name : "suggestion");

  let publicUrl = null;
  let type = 'image';

  if (file) {
    // 1. Upload file to Supabase Storage (bucket named 'media')
    // Sanitize filename: Remove special characters that might cause 400 errors
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${Date.now()}-${sanitizedName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      throw uploadError;
    }

    // 2. Get Public URL
    const { data: { publicUrl: url } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);
    
    publicUrl = url;
    type = file.type.startsWith('video') ? 'video' : 'image';
  }

  // 3. Insert metadata into Database
  const insertData: any = {
    title,
    description,
    category,
    district: district.toLowerCase(),
    contributor,
    media_url: publicUrl,
    type,
    status: 'pending'
  };

  // Only add parent_id if it's provided to avoid errors if the column doesn't exist yet
  if (parentId) {
    insertData.parent_id = parentId;
  }

  const { data, error } = await supabase
    .from('cultural_content')
    .insert([insertData]);

  if (error) {
    console.error("Supabase Database Error:", error);
    throw error;
  }
  
  return data;
};

export const suggestEdit = async (id: string, title: string, description: string) => {
  console.log("api.ts: suggestEdit called with:", { id, title, description });
  const { data, error } = await supabase
    .from('content_suggestions')
    .insert([
      {
        content_id: id,
        suggested_title: title,
        suggested_description: description,
        status: 'pending'
      }
    ])
    .select();
  
  if (error) {
    console.error("api.ts: suggestEdit error:", error);
    throw error;
  }
  console.log("api.ts: suggestEdit success:", data);
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
