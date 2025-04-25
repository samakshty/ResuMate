import { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';
import AnalysisResults from './AnalysisResults';
import { useAuth } from '../context/AuthContext';

function ResumeUpload({ onAnalysis }) {
  const [parsedData, setParsedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'text'
  const { token } = useAuth();

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setError('Please select a valid file (PDF, PNG, or JPG)');
      return;
    }

    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size too large. Please upload a file smaller than 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    await uploadData(formData);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError('Please enter some text');
      return;
    }

    const formData = new FormData();
    formData.append('text', resumeText);
    await uploadData(formData);
  };

  const uploadData = async (formData) => {
    if (!token) {
      setError('Please log in to upload resumes');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5178/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000 // 30 second timeout
      });
      
      if (res.data.error) {
        throw new Error(res.data.error);
      }
      
      setParsedData(res.data);
      onAnalysis(res.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Error processing resume. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            setInputMethod('file');
            setError(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            inputMethod === 'file'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => {
            setInputMethod('text');
            setError(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            inputMethod === 'text'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Paste Text
        </button>
      </div>

      {inputMethod === 'file' ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <DocumentTextIcon className="h-12 w-12 text-gray-400" />
              <PhotoIcon className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop your file here...'
                  : 'Drag and drop your resume here, or click to browse'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports PDF, PNG, and JPG files (max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setError(null);
            }}
            placeholder="Paste your resume text here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Processing...' : 'Analyze Text'}
          </button>
        </form>
      )}

      {uploading && (
        <div className="text-center">
          <p className="text-gray-600">Processing your resume...</p>
        </div>
      )}
      {error && (
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {parsedData && <AnalysisResults data={parsedData} />}
    </div>
  );
}

export default ResumeUpload;