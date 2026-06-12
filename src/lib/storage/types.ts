export interface UploadResult {
  ok: boolean;
  path: string;
  url?: string;
  error?: string;
}

export interface SignedUrlResult {
  ok: boolean;
  url?: string;
  error?: string;
}
