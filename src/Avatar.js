import { useEffect, useState } from "react"
import { supabase } from './supabaseClient'
import VisuallyHidden from '@reach/visually-hidden'

export default function Avatar({ url, size, onUpload }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  const downloadImage = async (path) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (err) {
      console.log(`Error downloading image: `, err.message)
    }
  }

  const uploadAvatar = async (e) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload')
      }

      const file = e.target.files[0]
      // const fileExt = file.name.split('.').pop()
      // const fileName = `${Math.random()}.${fileExt}`
      // const filePath = `${fileName}`
      console.log(`file`, file)
      
      const filePath = file.name

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
      
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ width: size }} aria-live="polite">
      <img
        src={avatarUrl ? avatarUrl : `https://place-hold.it/${size}x${size}`}
        alt={avatarUrl ? 'Avatar' : 'No image'}
        className="avatar image"
        style={{ height: size, width: size }}
      />
      {uploading ? (
        "Uploading..."
      ) : (
        <>
          <label className="button primary block" htmlFor="single">
            Upload an avatar
          </label>
          <VisuallyHidden>
            <input
              type="file"
              id="single"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </VisuallyHidden>
        </>
      )}
    </div>
  )
}