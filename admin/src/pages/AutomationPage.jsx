import { useState, useEffect } from 'react'
import { n8n } from '../api/index.js'

const N8N_BASE_URL = 'https://automation.hatfixclean.com'

function ExternalLink({ href, children, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {children}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-60">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  )
}

const CRED_TYPE_LABELS = {
  openAiApi: 'OpenAI API',
  anthropicApi: 'Anthropic API',
  facebookGraphApi: 'Facebook Graph API',
  httpBasicAuth: 'HTTP Basic Auth',
  httpHeaderAuth: 'HTTP Header Auth',
}

const STATUS_COLORS = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  waiting: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

function StatusDot({ active }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
  )
}

function WorkflowCard({ workflow, credentials }) {
  const [expanded, setExpanded] = useState(false)

  // Match workflow credentials to actual credential objects
  const credDetails = workflow.requiredCredentials.map(rc => {
    const match = credentials.find(c => c.id === rc.id || c.name === rc.name)
    return { ...rc, configured: !!match, hasData: match?.hasData }
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusDot active={workflow.active} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{workflow.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">ID: {workflow.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink
              href={`${N8N_BASE_URL}/workflow/${workflow.id}`}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            >
              เปิดใน n8n
            </ExternalLink>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${workflow.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
              {workflow.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
            {workflow.nodeCount} nodes
          </span>
          {workflow.webhooks.length > 0 && (
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              {workflow.webhooks.length} webhook{workflow.webhooks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Credentials */}
        {credDetails.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Credentials</p>
            <div className="space-y-1.5">
              {credDetails.map((cred, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cred.configured ? 'bg-green-500' : 'bg-red-400'}`} />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{cred.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {CRED_TYPE_LABELS[cred.type] || cred.type}
                    </span>
                    {cred.id && (
                      <ExternalLink
                        href={`${N8N_BASE_URL}/credentials/${cred.id}`}
                        className="text-[10px] text-violet-500 hover:text-violet-700"
                      >
                        แก้ไข
                      </ExternalLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {credDetails.length === 0 && (
          <div className="mt-4 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-xs text-gray-400">ไม่ต้องใช้ credentials (ใช้ ENV หรือ hardcoded)</span>
          </div>
        )}
      </div>

      {/* Node details (expandable) */}
      <div className="border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-2.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <span>รายละเอียด Nodes</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {expanded && (
          <div className="px-5 pb-4 space-y-1">
            {workflow.nodes.map((node, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded text-xs">
                <span className="text-gray-400 w-5 text-right">{i + 1}.</span>
                <span className="text-gray-700 dark:text-gray-300 flex-1">{node.name}</span>
                <span className="text-gray-400 font-mono text-[10px] truncate max-w-[180px]">{node.type.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', 'langchain:')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CredentialCard({ credential }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${credential.hasData ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={credential.hasData ? 'text-green-600' : 'text-red-500'}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{credential.name}</p>
          <p className="text-xs text-gray-400">{CRED_TYPE_LABELS[credential.type] || credential.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ExternalLink
          href={`${N8N_BASE_URL}/credentials/${credential.id}`}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
        >
          แก้ไข
        </ExternalLink>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${credential.hasData ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
          {credential.hasData ? 'Configured' : 'Missing'}
        </span>
      </div>
    </div>
  )
}

function ExecutionRow({ execution, workflowMap }) {
  const name = workflowMap[execution.workflowId] || execution.workflowId
  const statusClass = STATUS_COLORS[execution.status] || STATUS_COLORS.error
  const date = execution.startedAt ? new Date(execution.startedAt).toLocaleString('th-TH') : '-'

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
      <td className="px-4 py-3 text-xs text-gray-500">#{execution.id}</td>
      <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{name}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
          {execution.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">{execution.mode}</td>
      <td className="px-4 py-3 text-xs text-gray-400">{date}</td>
      <td className="px-4 py-3">
        <ExternalLink
          href={`${N8N_BASE_URL}/workflow/${execution.workflowId}/executions/${execution.id}`}
          className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300"
        >
          ดู
        </ExternalLink>
      </td>
    </tr>
  )
}

export default function AutomationPage() {
  const [tab, setTab] = useState('workflows')
  const [workflows, setWorkflows] = useState([])
  const [credentials, setCredentials] = useState([])
  const [executions, setExecutions] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [st, wf, cr, ex] = await Promise.all([
        n8n.getStatus(),
        n8n.getWorkflows(),
        n8n.getCredentials(),
        n8n.getExecutions(),
      ])
      setStatus(st.data)
      setWorkflows(wf.data || [])
      setCredentials(cr.data || [])
      setExecutions(ex.data || [])
    } catch (err) {
      console.error('Failed to load n8n data:', err)
    } finally {
      setLoading(false)
    }
  }

  const workflowMap = {}
  for (const wf of workflows) {
    workflowMap[wf.id] = wf.name
  }

  const tabs = [
    { id: 'workflows', label: 'Workflows', count: workflows.length },
    { id: 'credentials', label: 'Credentials', count: credentials.length },
    { id: 'executions', label: 'Executions', count: executions.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">n8n Workflow Management</p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className={`w-2 h-2 rounded-full ${status.running ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                n8n {status.running ? 'Running' : 'Offline'}
              </span>
            </div>
          )}
          <a
            href="https://automation.hatfixclean.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-red rounded-lg hover:bg-brand-red-dark transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            n8n Editor
          </a>
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === t.id ? 'bg-brand-red/10 text-brand-red' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-8 h-8 animate-spin mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Loading...
        </div>
      ) : (
        <>
          {/* Workflows Tab */}
          {tab === 'workflows' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {workflows.length === 0 ? (
                <p className="text-gray-400 text-sm col-span-2 text-center py-8">ไม่พบ workflows</p>
              ) : (
                workflows.map(wf => (
                  <WorkflowCard key={wf.id} workflow={wf} credentials={credentials} />
                ))
              )}
            </div>
          )}

          {/* Credentials Tab */}
          {tab === 'credentials' && (
            <div className="space-y-3 max-w-2xl">
              {credentials.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">ไม่พบ credentials</p>
              ) : (
                credentials.map(c => (
                  <CredentialCard key={c.id} credential={c} />
                ))
              )}
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> Credentials สามารถแก้ไขได้ผ่าน n8n Editor โดยตรง เพื่อความปลอดภัย ระบบจะไม่แสดงค่า secret ที่นี่
                </p>
              </div>
            </div>
          )}

          {/* Executions Tab */}
          {tab === 'executions' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {executions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">ไม่พบ executions</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">ID</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Workflow</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Mode</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Started</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map(ex => (
                      <ExecutionRow key={ex.id} execution={ex} workflowMap={workflowMap} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
