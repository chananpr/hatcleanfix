const n8nService = require('./n8n.service')
const { success, error } = require('../../utils/response')

const getWorkflows = async (req, res) => {
  try { return success(res, await n8nService.getWorkflows()) }
  catch (err) { return error(res, err.message) }
}

const getCredentials = async (req, res) => {
  try { return success(res, await n8nService.getCredentials()) }
  catch (err) { return error(res, err.message) }
}

const getExecutions = async (req, res) => {
  try { return success(res, await n8nService.getWorkflowExecutions()) }
  catch (err) { return error(res, err.message) }
}

const getStatus = async (req, res) => {
  try { return success(res, await n8nService.getStatus()) }
  catch (err) { return error(res, err.message) }
}

module.exports = { getWorkflows, getCredentials, getExecutions, getStatus }
