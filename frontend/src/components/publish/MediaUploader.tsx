import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image, Video, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

export interface UploadedMedia {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
}

interface Props {
  onUploaded: (media: UploadedMedia) => void;
}

export default function MediaUploader({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<{ url: string; type: 'image' | 'video'; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setError(null);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview({ url: localUrl, type: file.type.startsWith('video') ? 'video' : 'image', name: file.name });

    // Upload to Cloudinary via backend
    try {
      setUploading(true);
      setProgress(0);
      const formData = new FormData();
      formData.append('media', file);

      const res = await api.post('/publish/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      onUploaded(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Upload failed. Check Cloudinary credentials.');
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
  });

  const clearMedia = () => {
    setPreview(null);
    setProgress(0);
    setError(null);
  };

  if (preview) {
    return (
      <div className="relative">
        <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
          {preview.type === 'image' ? (
            <img src={preview.url} alt="preview" className="max-h-full max-w-full object-contain" />
          ) : (
            <video src={preview.url} controls className="max-h-full max-w-full" />
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <div className="w-48 bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-white text-sm font-medium">{progress}% uploading…</span>
          </div>
        )}

        {!uploading && (
          <button
            onClick={clearMedia}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          {preview.type === 'image' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          <span className="truncate">{preview.name}</span>
          {!uploading && <span className="text-green-600 font-medium ml-auto">✓ Uploaded</span>}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center"
          >
            <Upload className="w-8 h-8 text-indigo-600" />
          </motion.div>
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {isDragActive ? 'Drop it here!' : 'Drop your photo or video'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse · Images & videos up to 100MB</p>
          </div>
          <div className="flex gap-3">
            {[['image', 'Photos'], ['video', 'Videos']].map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                {type === 'image' ? <Image className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
