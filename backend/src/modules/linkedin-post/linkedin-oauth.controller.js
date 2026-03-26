const oauthService = require('./linkedin-oauth.service')

// In-memory store for tokens (production: use DB)
let linkedinTokens = {
  accessToken: null,
  personId: null,
  name: null,
  expiresAt: null,
}

const getAuthUrl = async (req, res) => {
  try {
    const url = oauthService.getAuthUrl()
    res.json({ success: true, data: { url } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

const handleCallback = async (req, res) => {
  try {
    const { code, error } = req.query
    if (error) {
      return res.send('<html><body><h1>LinkedIn Auth Failed</h1><p>' + error + '</p></body></html>')
    }

    const tokenData = await oauthService.getAccessToken(code)
    const profile = await oauthService.getProfile(tokenData.access_token)

    linkedinTokens = {
      accessToken: tokenData.access_token,
      personId: profile.sub,
      name: profile.name || profile.given_name,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    }

    console.log('[LinkedIn] Connected as:', linkedinTokens.name, '| Person ID:', linkedinTokens.personId)

    const html = [
      '<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:white">',
      '<div style="text-align:center">',
      '<h1>LinkedIn Connected!</h1>',
      '<p>Connected as: <strong>' + linkedinTokens.name + '</strong></p>',
      '<p style="color:#4ade80">You can now post to LinkedIn from the admin panel.</p>',
      '<p style="color:#888;margin-top:20px">This window will close automatically...</p>',
      '<script>setTimeout(function(){ window.close() }, 3000)</script>',
      '</div></body></html>',
    ].join('')

    res.send(html)
  } catch (err) {
    console.error('[LinkedIn] OAuth error:', err.message)
    res.send('<html><body><h1>Error</h1><p>' + err.message + '</p></body></html>')
  }
}

const getAuthStatus = async (req, res) => {
  const connected = !!(linkedinTokens.accessToken && linkedinTokens.expiresAt > Date.now())
  res.json({
    success: true,
    data: {
      connected,
      name: connected ? linkedinTokens.name : null,
      expiresAt: connected ? new Date(linkedinTokens.expiresAt).toISOString() : null,
    }
  })
}

const postToLinkedIn = async (req, res) => {
  try {
    if (!linkedinTokens.accessToken || linkedinTokens.expiresAt < Date.now()) {
      return res.status(401).json({ success: false, error: 'LinkedIn not connected. Please authorize first.' })
    }

    const { content } = req.body
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' })
    }

    const result = await oauthService.postToLinkedIn(
      linkedinTokens.accessToken,
      linkedinTokens.personId,
      content
    )

    console.log('[LinkedIn] Posted successfully:', result.id)
    res.json({ success: true, data: { postId: result.id, message: 'Posted to LinkedIn!' } })
  } catch (err) {
    console.error('[LinkedIn] Post error:', err.response?.data || err.message)
    res.status(500).json({ success: false, error: err.response?.data?.message || err.message })
  }
}

module.exports = { getAuthUrl, handleCallback, getAuthStatus, postToLinkedIn }
