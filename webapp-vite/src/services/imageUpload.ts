/**
 * Image Upload Service
 * Uploads images to ImgBB
 */

import axios from 'axios';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '579b3523bfa02cc28a4e66d47fc7c66e';

export interface ImageUploadResponse {
  success: boolean;
  data: {
    url: string;
    display_url: string;
    thumb: {
      url: string;
    };
  };
}

export const imageUploadService = {
  /**
   * Upload image to ImgBB
   * @param file - Image file to upload
   * @returns Promise with image URL
   */
  async uploadImage(file: File): Promise<string> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);

      // Remove data:image/...;base64, prefix
      const base64Data = base64.split(',')[1];

      // Create form data
      const formData = new FormData();
      formData.append('image', base64Data);

      // Upload to ImgBB
      const response = await axios.post<ImageUploadResponse>(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds
        }
      );

      if (!response.data.success) {
        throw new Error('Upload failed');
      }

      return response.data.data.url;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(error.response?.data?.error?.message || 'Erreur lors de l\'upload de l\'image');
    }
  },

  /**
   * Convert file to base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  /**
   * Validate image file
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Format d\'image non valide. Utilisez JPG, PNG, GIF ou WebP.' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'L\'image est trop grande. Taille maximale: 5MB.' };
    }

    return { valid: true };
  },
};
