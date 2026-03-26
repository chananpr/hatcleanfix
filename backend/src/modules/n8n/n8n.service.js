const { execSync } = require('child_process')

const CONTAINER = 'hatfixclean-n8n'

const exec = (cmd) => {
  try {
    return execSync(`docker exec ${CONTAINER} ${cmd}`, {
      encoding: 'utf-8',
      timeout: 15000
    }).trim()
  } catch (err) {
    console.error('n8n exec error:', err.message)
    return null
  }
}

const getWorkflows = async () => {
  const raw = exec('n8n export:workflow --all --pretty')
  if (!raw) return []

  const data = JSON.parse(raw)
  const workflows = Array.isArray(data) ? data : [data]

  return workflows.map(wf => {
    const nodes = (wf.nodes || []).map(node => {
      const creds = node.credentials || {}
      const credList = Object.entries(creds).map(([type, val]) => ({
        type,
        name: val.name || '?',
        id: val.id || null
      }))
      return {
        name: node.name,
        type: node.type,
        credentials: credList
      }
    })

    // Collect all unique credentials needed by this workflow
    const requiredCredentials = []
    const seen = new Set()
    for (const node of nodes) {
      for (const cred of node.credentials) {
        if (!seen.has(cred.id || cred.name)) {
          seen.add(cred.id || cred.name)
          requiredCredentials.push(cred)
        }
      }
    }

    // Extract webhook paths
    const webhooks = nodes
      .filter(n => n.type === 'n8n-nodes-base.webhook')
      .map(n => n.name)

    return {
      id: wf.id,
      name: wf.name,
      active: wf.active,
      nodeCount: nodes.length,
      nodes,
      requiredCredentials,
      webhooks,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt
    }
  })
}

const getCredentials = async () => {
  const raw = exec('n8n export:credentials --all --pretty')
  if (!raw) return []

  const data = JSON.parse(raw)
  const creds = Array.isArray(data) ? data : [data]

  return creds.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    // Don't expose actual credential data for security
    hasData: !!(c.data && Object.keys(c.data).length > 0)
  }))
}

const getWorkflowExecutions = async () => {
  // n8n CLI doesn't have execution export, use sqlite query
  const raw = exec(`sh -c "sqlite3 /home/node/.n8n/database.sqlite \\"SELECT id, workflowId, finished, mode, startedAt, stoppedAt, status FROM execution_entity ORDER BY startedAt DESC LIMIT 20;\\" 2>/dev/null"`)
  if (!raw) return []

  return raw.split('\n').filter(Boolean).map(line => {
    const [id, workflowId, finished, mode, startedAt, stoppedAt, status] = line.split('|')
    return {
      id: parseInt(id),
      workflowId,
      finished: finished === '1',
      mode,
      startedAt,
      stoppedAt: stoppedAt || null,
      status: status || (finished === '1' ? 'success' : 'error')
    }
  })
}

const getStatus = async () => {
  const result = exec('echo ok')
  return { running: result !== null }
}

module.exports = { getWorkflows, getCredentials, getWorkflowExecutions, getStatus }
