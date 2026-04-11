import React, { useState } from 'react';
import api from '../api/axiosConfig'; 
import { Upload } from 'lucide-react';

interface DraftTransaction {
  date: string;
  description: string;
  amount: number;
  merchant: string;
  category: string;
}


interface FileUploadProps {
  onUploadSuccess: (data: DraftTransaction[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
   
      const response = await api.post('/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.transactions) {
        onUploadSuccess(response.data.transactions);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setError(err.response?.data?.error || 'Upload failed. Check server connection.');
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="relative">
      <input 
        type="file" 
        id="file-upload"
        className="hidden"
        accept=".csv,.xlsx,.xls,.pdf" 
        onChange={handleFileChange} 
        disabled={uploading}
      />
      <label 
        htmlFor="file-upload" 
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer
          ${uploading 
            ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' 
            : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95'
          }`}
      >
        <Upload size={16} />
        {uploading ? 'AI ANALYSING...' : 'UPLOAD STATEMENT'}
      </label>

      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] px-3 py-1 rounded-md whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;