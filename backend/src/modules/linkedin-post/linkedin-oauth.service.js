const axios = require('axios')

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'
const LINKEDIN_POST_URL = 'https://api.linkedin.com/v2/ugcPosts'

const getAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI || 'https://api.hatfixclean.com/api/linkedin-posts/callback',
    scope: 'openid profile w_member_social',
    state: 'hatfixclean-linkedin'
  })
  return LINKEDIN_AUTH_URL + '?' + params.toString()
}

const getAccessToken = async (code) => {
  const res = await axios.post(LINKEDIN_TOKEN_URL, new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI || 'https://api.hatfixclean.com/api/linkedin-posts/callback',
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return res.data
}

const getProfile = async (accessToken) => {
  const res = await axios.get(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: 'Bearer ' + accessToken }
  })
  return res.data
}

const postToLinkedIn = async (accessToken, personId, content) => {
  const res = await axios.post(LINKEDIN_POST_URL, {
    author: 'urn:li:person:' + personId,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  }, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    }
  })
  return res.data
}

module.exports = { getAuthUrl, getAccessToken, getProfile, postToLinkedIn }
