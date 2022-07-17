import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

const Account = ({ session }) => {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

  useEffect(() => {
    getProfile()
  }, [session])

  useEffect(() => {
    console.log(`avatarurl changed:`, avatar_url)
    
  },[avatar_url])

  const getProfile = async () => {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      let { data, error, status } = await supabase
        .from('profiles')
        .select('username, website, avatar_url')
        .eq('id', user.id)
        .single()
      
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async ({ username, website, avatar_url}) => {
    // e.preventDefault()

    // console.log(`IN updateProfile beg, url:`, url)
    // console.log(`setting avatarurl...`, )
    // setAvatarUrl(url)
    console.log(`what is avatarurl:`, avatar_url)
    
    try {
      setLoading(true)
      const user = supabase.auth.user()

      console.log(`direct ax av url`, avatar_url)
      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,      // ! using passed arg instead of hook state
        updated_at: new Date(),
      }
      

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // * Don't return the val after inserting
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div aria-live="polite">
      {loading ? (
        'Saving ...'
      ):(
        <>
          <div className="form-widget">
            Hello {username}!
            <Avatar
              url={avatar_url}
              size={150}
              onUpload={(url) => {
                setAvatarUrl(url)
                updateProfile({ username, website, avatar_url: url })
              }}
            />
          </div>
          <form onSubmit={updateProfile} className="form-widget">
            <div>email: {session.user.email}</div>
            <div>
              <label htmlFor="username">name</label>
              <input
                id="username"
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="website">website</label>
              <input
                id="website"
                type="url"
                value={website || ''}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <button className="button block primary" disabled={loading}>
                {loading ? 'Loading...' : 'Update profile'}
              </button>
            </div>
          </form>
        </>
      )}
      <button type="button" className="button block" onClick={() => supabase.auth.signOut()}>
        Sign out
      </button>
    </div>
  )
}

export default Account