const { searchAddressByDistrict, searchAddressByAmphoe, searchAddressByProvince, searchAddressByZipcode } = require('thai-address-database')
const { success, error } = require('../../utils/response')

const search = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query
    if (!q || q.length < 2) return success(res, [])
    
    let results = []
    if (type === 'district' || type === 'all') {
      results.push(...searchAddressByDistrict(q))
    }
    if (type === 'amphoe' || type === 'all') {
      results.push(...searchAddressByAmphoe(q))
    }
    if (type === 'province' || type === 'all') {
      results.push(...searchAddressByProvince(q))
    }
    if (type === 'zipcode' || type === 'all') {
      results.push(...searchAddressByZipcode(q))
    }
    
    // Deduplicate and limit
    const unique = [...new Map(results.map(r => [r.district + r.amphoe + r.province + r.zipcode, r])).values()]
    return success(res, unique.slice(0, 20))
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { search }
