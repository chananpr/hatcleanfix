const userService = require('./user.service')
const { success, error } = require('../../utils/response')

const list = async (req, res) => {
  try { return success(res, await userService.list()) }
  catch (err) { return error(res, err.message) }
}

const get = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id)
    if (!user) return error(res, 'User not found', 404)
    return success(res, user)
  } catch (err) { return error(res, err.message) }
}

const create = async (req, res) => {
  try { return success(res, await userService.create(req.body), 'User created', null, 201) }
  catch (err) { return error(res, err.message, err.statusCode || 500) }
}

const update = async (req, res) => {
  try {
    const user = await userService.update(req.params.id, req.body, req.user)
    if (!user) return error(res, 'User not found', 404)
    return success(res, user, 'User updated')
  } catch (err) { return error(res, err.message, err.statusCode || 500) }
}

const remove = async (req, res) => {
  try {
    await userService.remove(req.params.id, req.user.id)
    return success(res, null, 'User deactivated')
  } catch (err) { return error(res, err.message, err.statusCode || 500) }
}

const listRoles = async (req, res) => {
  try { return success(res, await userService.listRoles()) }
  catch (err) { return error(res, err.message) }
}



// ── Profile (current user) ──────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const { User, Role } = require("../../models")
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role_id", "is_active", "last_login", "facebook_psid", "facebook_name", "facebook_picture", "is_tester", "createdAt"],
      include: [{ model: Role, as: "role", attributes: ["name"] }]
    })
    if (!user) return error(res, "User not found", 404)
    return success(res, user)
  } catch (err) { return error(res, err.message) }
}

const updateMyProfile = async (req, res) => {
  try {
    const { User } = require("../../models")
    const user = await User.findByPk(req.user.id)
    if (!user) return error(res, "User not found", 404)
    const { name, email } = req.body
    if (name) user.name = name
    if (email) user.email = email
    await user.save()
    return success(res, { id: user.id, name: user.name, email: user.email }, "Profile updated")
  } catch (err) { return error(res, err.message) }
}

const changePassword = async (req, res) => {
  try {
    const bcrypt = require("bcryptjs")
    const { User } = require("../../models")
    const user = await User.findByPk(req.user.id)
    if (!user) return error(res, "User not found", 404)
    const { current_password, new_password } = req.body
    if (!current_password || !new_password) return error(res, "Both passwords required", 400)
    const valid = await bcrypt.compare(current_password, user.password)
    if (!valid) return error(res, "Current password is incorrect", 400)
    user.password = await bcrypt.hash(new_password, 10)
    await user.save()
    return success(res, null, "Password changed")
  } catch (err) { return error(res, err.message) }
}

const linkFacebook = async (req, res) => {
  try {
    const { User } = require("../../models")
    const user = await User.findByPk(req.user.id)
    if (!user) return error(res, "User not found", 404)
    const { facebook_psid, facebook_name, facebook_picture } = req.body
    user.facebook_psid = facebook_psid || null
    user.facebook_name = facebook_name || null
    user.facebook_picture = facebook_picture || null
    user.is_tester = !!facebook_psid
    await user.save()
    return success(res, { facebook_psid: user.facebook_psid, facebook_name: user.facebook_name, facebook_picture: user.facebook_picture, is_tester: user.is_tester }, facebook_psid ? "Facebook linked" : "Facebook unlinked")
  } catch (err) { return error(res, err.message) }
}


const generateLinkCode = async (req, res) => {
  try {
    const { User, SiteSetting } = require("../../models")
    const user = await User.findByPk(req.user.id)
    if (!user) return error(res, "User not found", 404)
    
    // สร้าง code 6 หลัก
    const code = "LINK-" + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // เก็บใน SiteSetting
    let setting = await SiteSetting.findOne({ where: { key: "linking_codes" } })
    let codes = setting ? JSON.parse(setting.value) : {}
    
    // ลบ code เก่าของ user นี้
    for (const k in codes) {
      if (codes[k].user_id === req.user.id) delete codes[k]
    }
    
    // เพิ่ม code ใหม่ (หมดอายุ 30 นาที)
    codes[code] = { user_id: req.user.id, user_name: user.name, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() }
    
    if (setting) {
      await setting.update({ value: JSON.stringify(codes) })
    } else {
      await SiteSetting.create({ key: "linking_codes", value: JSON.stringify(codes) })
    }
    
    return success(res, { code, expires_in: "30 นาที" }, "Linking code generated")
  } catch (err) { return error(res, err.message) }
}

module.exports = { list, get, create, update, remove, listRoles, getMyProfile, updateMyProfile, changePassword, linkFacebook, generateLinkCode }
