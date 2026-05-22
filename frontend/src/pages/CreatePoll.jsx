import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import styles from './CreatePoll.module.css'

export default function CreatePoll() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const addOption = () => setOptions([...options, ''])
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i))
  const updateOption = (i, val) => setOptions(options.map((o, idx) => idx === i ? val : o))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const filled = options.filter(o => o.trim())
    if (filled.length < 2) { setError('Add at least 2 options'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/polls', {
        title: title.trim(),
        description: description.trim() || null,
        options: filled.map(text => ({ text }))
      })
      navigate(`/polls/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <h1>Create a Poll</h1>
        <p>Ask a question and add your options below</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Question *</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you want to ask?" required />
        </div>
        <div className={styles.field}>
          <label>Description (optional)</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add some context..." rows={3} style={{ resize: 'vertical' }} />
        </div>
        <div className={styles.field}>
          <label>Options *</label>
          <div className={styles.options}>
            {options.map((opt, i) => (
              <div key={i} className={styles.optionRow}>
                <input
                  className="input"
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)} className={styles.removeBtn}>✕</button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button type="button" onClick={addOption} className="btn btn-ghost" style={{ marginTop: 8, alignSelf: 'flex-start' }}>
              + Add Option
            </button>
          )}
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className={styles.actions}>
          <button type="button" onClick={() => navigate('/')} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  )
}
