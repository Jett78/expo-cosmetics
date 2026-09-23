import { File, UploadType } from 'expo-file-system';

import { ApiError } from '../../lib/api-client';
import { API_BASE_URL } from '../../lib/config';

export type UploadImageFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadImageUrls = {
  original: string;
  '480'?: string;
  '768'?: string;
  '1024'?: string;
  '1280'?: string;
  '1600'?: string;
  '1920'?: string;
};

export type UploadedImage = {
  urls: UploadImageUrls;
  keys: UploadImageUrls;
  metadata?: {
    originalName?: string;
    mimetype?: string;
  };
};

export type UploadImagesResponse = {
  success: boolean;
  statusCode: number | string;
  message?: string;
  data: UploadedImage[];
};

export async function uploadImages(
  files: UploadImageFile[],
  folder: string,
  token: string
): Promise<UploadImagesResponse> {
  const uploaded: UploadedImage[] = [];

  for (const file of files) {
    const uri = file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`;
    const localFile = new File(uri);

    const result = await localFile.upload(`${API_BASE_URL}/upload`, {
      uploadType: UploadType.MULTIPART,
      fieldName: 'images',
      mimeType: file.type || 'image/jpeg',
      headers: { Authorization: `Bearer ${token}` },
      parameters: { folder },
    });

    if (result.status < 200 || result.status >= 300) {
      let message = `Upload failed (${result.status})`;
      try {
        const parsed = JSON.parse(result.body);
        message = parsed?.message ?? parsed?.error ?? message;
      } catch {
        // keep default message
      }
      throw new ApiError(String(message), result.status);
    }

    try {
      const parsed: UploadImagesResponse = JSON.parse(result.body);
      uploaded.push(...(parsed.data ?? []));
    } catch {
      throw new ApiError('Invalid upload response', result.status);
    }
  }

  return { success: true, statusCode: 200, data: uploaded };
}
