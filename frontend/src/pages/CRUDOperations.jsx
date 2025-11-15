import { useState, useEffect } from 'react'
import {
  getAllWeatherQueries,
  createWeatherQuery,
  updateWeatherQuery,
  deleteWeatherQuery
} from '../api/weatherApi'
import './CRUDOperations.css'

const CRUDOperations = () => {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    location: '',
    date_from: '',
    date_to: '',
    output_temperature: ''
  })

  useEffect(() => {
    loadQueries()
  }, [])

  const loadQueries = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllWeatherQueries()
      setQueries(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load queries')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const newQuery = {
        location: formData.location,
        date_from: formData.date_from,
        date_to: formData.date_to,
        output_temperature: parseFloat(formData.output_temperature)
      }
      await createWeatherQuery(newQuery)
      setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' })
      setShowCreateForm(false)
      loadQueries()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create query')
    }
  }

  const handleUpdate = async (id) => {
    setError(null)

    try {
      const updateData = {}
      if (formData.location) updateData.location = formData.location
      if (formData.date_from) updateData.date_from = formData.date_from
      if (formData.date_to) updateData.date_to = formData.date_to
      if (formData.output_temperature) updateData.output_temperature = parseFloat(formData.output_temperature)

      await updateWeatherQuery(id, updateData)
      setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' })
      setEditingId(null)
      loadQueries()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update query')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return
    }

    setError(null)
    try {
      await deleteWeatherQuery(id)
      loadQueries()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete query')
    }
  }

  const startEdit = (query) => {
    setEditingId(query.id)
    setFormData({
      location: query.location,
      date_from: query.date_from,
      date_to: query.date_to,
      output_temperature: query.output_temperature.toString()
    })
    setShowCreateForm(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' })
  }

  return (
    <div className="crud-operations">
      <div className="crud-header">
        <h1>CRUD Operations</h1>
        <p>Create, Read, Update, and Delete weather query records</p>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm)
            setEditingId(null)
            setFormData({ location: '', date_from: '', date_to: '', output_temperature: '' })
          }}
          className="btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Create New Query'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {(showCreateForm || editingId) && (
        <div className="form-card">
          <h2>{editingId ? 'Update Query' : 'Create New Query'}</h2>
          <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId) } : handleCreate}>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location (Zip, Postal, GPS, Landmark, Town, City)"
                required={!editingId}
              />
            </div>

            <div className="form-group">
              <label>Date From *</label>
              <input
                type="date"
                name="date_from"
                value={formData.date_from}
                onChange={handleInputChange}
                required={!editingId}
              />
            </div>

            <div className="form-group">
              <label>Date To *</label>
              <input
                type="date"
                name="date_to"
                value={formData.date_to}
                onChange={handleInputChange}
                required={!editingId}
              />
            </div>

            <div className="form-group">
              <label>Output Temperature *</label>
              <input
                type="number"
                name="output_temperature"
                value={formData.output_temperature}
                onChange={handleInputChange}
                step="0.1"
                placeholder="Temperature in Celsius"
                required={!editingId}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="queries-section">
        <div className="section-header">
          <h2>All Weather Queries</h2>
          <button onClick={loadQueries} className="btn-refresh" disabled={loading}>
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {loading && queries.length === 0 ? (
          <div className="loading">Loading queries...</div>
        ) : queries.length === 0 ? (
          <div className="empty-state">
            <p>No weather queries found. Create your first query!</p>
          </div>
        ) : (
          <div className="queries-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Date From</th>
                  <th>Date To</th>
                  <th>Temperature</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((query) => (
                  <tr key={query.id}>
                    <td>{query.id}</td>
                    <td>{query.location}</td>
                    <td>{query.date_from}</td>
                    <td>{query.date_to}</td>
                    <td>{query.output_temperature}°C</td>
                    <td>{new Date(query.created_at).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => startEdit(query)}
                          className="btn-edit"
                          disabled={editingId === query.id}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(query.id)}
                          className="btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CRUDOperations

