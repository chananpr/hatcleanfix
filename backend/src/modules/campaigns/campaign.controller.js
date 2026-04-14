const { SiteSetting } = require('../../models')
const { success, error } = require('../../utils/response')

const getNames = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ where: { key: 'campaign_names' } })
    return success(res, setting ? JSON.parse(setting.value) : {})
  } catch (err) { return error(res, err.message) }
}

const setName = async (req, res) => {
  try {
    const { id, name } = req.body
    if (!id) return error(res, 'id required', 400)
    let setting = await SiteSetting.findOne({ where: { key: 'campaign_names' } })
    let names = setting ? JSON.parse(setting.value) : {}
    names[id] = name || id
    if (setting) await setting.update({ value: JSON.stringify(names) })
    else await SiteSetting.create({ key: 'campaign_names', value: JSON.stringify(names) })
    return success(res, names)
  } catch (err) { return error(res, err.message) }
}

module.exports = { getNames, setName }
