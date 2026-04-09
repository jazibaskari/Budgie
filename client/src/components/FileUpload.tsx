import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { Upload, Loader2 } from 'lucide-react';

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

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await api.post('/api/transactions/upload', formData);

      onUploadSuccess(res.data.transactions as DraftTransaction[]);
    } catch (err) {
      console.error("Upload Error:", err); 
      alert("Error parsing CSV. Ensure it has Date, Description, and Amount columns.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <label className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold cursor-pointer transition-all shadow-sm ${
      isUploading 
        ? 'bg-slate-100 text-slate-400' 
        : 'bg-white border border-[var(--border)] text-slate-700 hover:bg-slate-50'
    }`}>
      {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
      {isUploading ? 'AI Processing...' : 'Upload CSV'}
      <input 
        type="file" 
        className="hidden" 
        onChange={handleFileChange} 
        accept=".csv" 
        disabled={isUploading} 
      />
    </label>
  );
}