const { FacebookPage } = require("../../models")
const { success, error } = require("../../utils/response")
const claudeService = require("../webhooks/claude-messenger.service")
const axios = require("axios")

// Fetch profile picture from Facebook Graph API
async function fetchProfilePicture(page) {
  try {
    const url = `https://graph.facebook.com/${page.page_id}/picture?redirect=false&type=square&access_token=${page.access_token}`
    const res = await axios.get(url)
    if (res.data?.data?.url) {
      await page.update({ profile_picture_url: res.data.data.url })
      return res.data.data.url
    }
  } catch (e) {
    console.error("Failed to fetch profile pic:", e.message)
  }
  return null
}

// GET /api/facebook-pages
const list = async (req, res) => {
  try {
    const pages = await FacebookPage.findAll({
      attributes: ["id", "page_id", "page_name", "is_active", "ai_enabled", "ai_persona", "note", "profile_picture_url", "createdAt"],
      order: [["createdAt", "ASC"]],
    })
    return success(res, pages)
  } catch (err) {
    return error(res, err.message)
  }
}

// GET /api/facebook-pages/:id
const getOne = async (req, res) => {
  try {
    const page = await FacebookPage.findByPk(req.params.id, {
      attributes: { exclude: ["access_token"] },
    })
    if (!page) return error(res, "Page not found", 404)
    const pageData = page.toJSON()
    if (!pageData.ai_system_prompt) {
      pageData.ai_system_prompt = claudeService.getDefaultPrompt()
      pageData.using_default_prompt = true
    }
    // Auto-fetch profile picture if missing
    if (!pageData.profile_picture_url) {
      const fullPage = await FacebookPage.findByPk(req.params.id)
      if (fullPage) {
        const picUrl = await fetchProfilePicture(fullPage)
        if (picUrl) pageData.profile_picture_url = picUrl
      }
    }
    return success(res, pageData)
  } catch (err) {
    return error(res, err.message)
  }
}

// POST /api/facebook-pages
const create = async (req, res) => {
  try {
    const { page_id, page_name, access_token, ai_enabled, ai_persona, ai_system_prompt, note } = req.body
    if (!page_id || !page_name || !access_token) {
      return error(res, "page_id, page_name, and access_token are required", 400)
    }

    const existing = await FacebookPage.findOne({ where: { page_id } })
    if (existing) return error(res, "Page ID already exists", 409)

    const page = await FacebookPage.create({
      page_id,
      page_name,
      access_token,
      ai_enabled: ai_enabled !== false,
      ai_persona: ai_persona || "น้องแฮทซ์",
      ai_system_prompt: ai_system_prompt || null,
      note: note || null,
    })

    // Fetch profile picture in background
    fetchProfilePicture(page).catch(() => {})

    claudeService.clearPageCache()
    return success(res, { id: page.id, page_id: page.page_id, page_name: page.page_name }, "Page created")
  } catch (err) {
    return error(res, err.message)
  }
}

// PUT /api/facebook-pages/:id
const update = async (req, res) => {
  try {
    const page = await FacebookPage.findByPk(req.params.id)
    if (!page) return error(res, "Page not found", 404)

    const { page_name, access_token, is_active, ai_enabled, ai_persona, ai_system_prompt, note } = req.body
    const updates = {}
    if (page_name !== undefined) updates.page_name = page_name
    if (access_token !== undefined) updates.access_token = access_token
    if (is_active !== undefined) updates.is_active = is_active
    if (ai_enabled !== undefined) updates.ai_enabled = ai_enabled
    if (ai_persona !== undefined) updates.ai_persona = ai_persona
    if (ai_system_prompt !== undefined) updates.ai_system_prompt = ai_system_prompt
    if (note !== undefined) updates.note = note

    await page.update(updates)
    claudeService.clearPageCache()

    return success(res, { id: page.id, page_name: page.page_name }, "Page updated")
  } catch (err) {
    return error(res, err.message)
  }
}

// DELETE /api/facebook-pages/:id
const remove = async (req, res) => {
  try {
    const page = await FacebookPage.findByPk(req.params.id)
    if (!page) return error(res, "Page not found", 404)
    await page.destroy()
    claudeService.clearPageCache()
    return success(res, null, "Page deleted")
  } catch (err) {
    return error(res, err.message)
  }
}

// POST /api/facebook-pages/:id/toggle-ai
const toggleAi = async (req, res) => {
  try {
    const page = await FacebookPage.findByPk(req.params.id)
    if (!page) return error(res, "Page not found", 404)
    await page.update({ ai_enabled: !page.ai_enabled })
    claudeService.clearPageCache()
    return success(res, { ai_enabled: page.ai_enabled }, `AI ${page.ai_enabled ? "enabled" : "disabled"}`)
  } catch (err) {
    return error(res, err.message)
  }
}

// POST /api/facebook-pages/:id/refresh-avatar
const refreshAvatar = async (req, res) => {
  try {
    const page = await FacebookPage.findByPk(req.params.id)
    if (!page) return error(res, "Page not found", 404)
    const picUrl = await fetchProfilePicture(page)
    if (picUrl) {
      return success(res, { profile_picture_url: picUrl }, "Avatar refreshed")
    }
    return error(res, "Could not fetch profile picture from Facebook", 502)
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { list, getOne, create, update, remove, toggleAi, refreshAvatar }
