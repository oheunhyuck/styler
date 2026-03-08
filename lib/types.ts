export interface Style {
  id: string;
  name: string;
  description: string;
  css: string;
  author: string;
  likes: number;
  views: number;
  created_at: string;
}

export interface UploadStylePayload {
  name: string;
  description: string;
  css: string;
  author: string;
}
