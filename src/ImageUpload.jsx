import { useState, useRef } from 'react'
import { supabase } from './services/supabaseClient'

function ImageUpload({ onUploadComplete, currentImage = null }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Validasi file
  function validateFile(file) {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Format file harus JPG, PNG, atau WebP')
      return false
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      setError('Ukuran file maksimal 2MB')
      return false
    }

    setError('')
    return true
  }

  // Upload file ke Supabase Storage
  async function uploadFile(file) {
    try {
      setUploading(true)
      setError('')

      // Validasi file
      if (!validateFile(file)) {
        setUploading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Silakan login terlebih dahulu')
        setUploading(false)
        return
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath)

      // Set preview
      setPreview(publicUrl)

      // Callback dengan URL
      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }

      setUploading(false)
    } catch (error) {
      console.error('Error uploading file:', error)
      setError(error.message || 'Gagal upload gambar')
      setUploading(false)
    }
  }

  // Handle file select
  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  // Handle drag & drop
  function handleDrag(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  // Handle remove image
  function handleRemove() {
    setPreview(null)
    if (onUploadComplete) {
      onUploadComplete(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      {/* Preview Image */}
      {preview ? (
        <div className="relative group">
          <img 
            src={preview} 
            alt="Thumbnail preview" 
            className="w-full h-64 object-cover rounded-2xl border-2 border-slate-200"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all"
            >
              Ganti Gambar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'
          }`}
        >
          {uploading ? (
            /* Loading State */
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Mengupload gambar...</p>
            </div>
          ) : (
            /* Upload Prompt */
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <p className="text-lg font-semibold text-slate-900 mb-1">
                  {dragActive ? 'Drop gambar di sini' : 'Upload Thumbnail'}
                </p>
                <p className="text-sm text-slate-500 mb-3">
                  Drag & drop atau klik untuk pilih gambar
                </p>
                <p className="text-xs text-slate-400">
                  JPG, PNG, atau WebP • Max 2MB
                </p>
              </div>

              <button
                type="button"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Pilih Gambar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Tips */}
      {!preview && !uploading && (
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-xs text-purple-700">
            💡 <strong>Tips:</strong> Gunakan gambar landscape (16:9) untuk hasil terbaik
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
