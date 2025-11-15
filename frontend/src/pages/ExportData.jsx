import { useState } from 'react'
import { exportData } from '../api/weatherApi'
import './ExportData.css'

const ExportData = () => {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const handleExport = async (format) => {
    setLoading(format)
    setError(null)

    try {
      const data = await exportData(format)

      if (format === 'pdf') {
        // Handle PDF blob
        const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `weather_queries.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        // Handle text-based formats
        const blob = new Blob([data], {
          type: format === 'json' ? 'application/json' :
                format === 'csv' ? 'text/csv' :
                format === 'xml' ? 'application/xml' :
                'text/markdown'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `weather_queries.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to export as ${format.toUpperCase()}`)
    } finally {
      setLoading(null)
    }
  }

  const exportFormats = [
    { format: 'json', name: 'JSON', icon: '📄', description: 'JavaScript Object Notation format' },
    { format: 'csv', name: 'CSV', icon: '📊', description: 'Comma-separated values format' },
    { format: 'xml', name: 'XML', icon: '📋', description: 'Extensible Markup Language format' },
    { format: 'pdf', name: 'PDF', icon: '📑', description: 'Portable Document Format' },
    { format: 'markdown', name: 'Markdown', icon: '📝', description: 'Markdown format' }
  ]

  return (
    <div className="export-data">
      <div className="export-header">
        <h1>Export Data</h1>
        <p>Export all weather query records in various formats</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="export-grid">
        {exportFormats.map(({ format, name, icon, description }) => (
          <div key={format} className="export-card">
            <div className="export-icon">{icon}</div>
            <h3>{name}</h3>
            <p className="export-description">{description}</p>
            <button
              onClick={() => handleExport(format)}
              disabled={loading === format}
              className="export-button"
            >
              {loading === format ? 'Exporting...' : `Export as ${name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="export-info">
        <h2>Export Information</h2>
        <ul>
          <li>All exports include all weather query records from the database</li>
          <li>JSON format is best for programmatic access</li>
          <li>CSV format is ideal for spreadsheet applications</li>
          <li>XML format provides structured data representation</li>
          <li>PDF format is perfect for printing and sharing</li>
          <li>Markdown format is great for documentation</li>
        </ul>
      </div>
    </div>
  )
}

export default ExportData

