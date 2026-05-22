import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import styles from './PollDetail.module.css'

export default function PollDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [poll, setPoll] = useState(null)
  const [myVote, setMyVote] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`/polls/${id}`).then(r => setPoll(r.data)).catch(() => navigate('/')).finally(() => setLoading(false))
    if (user) {
      api.get(`/polls/${id}/my-vote`).then(r => setMyVote(r.data.option_id)).catch(() => {})
    }
  }, [id, user])

  const handleVote = async () => {
    if (!selected) return
    setVoting(true)
    setError('')
    try {
      const { data } = await api.post(`/polls/${id}/vote`, { option_id: selected })
      setPoll(data)
      setMyVote(selected)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  const handleClose = async () => {
    if (!confirm('Close this poll? No more votes will be accepted.')) return
    const { data } = await api.patch(`/polls/${id}/close`)
    setPoll(data)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this poll permanently?')) return
    await api.delete(`/polls/${id}`)
    navigate('/')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasVoted = myVote !== null
  const showResults = hasVoted || !poll?.is_active

  if (loading) return <div className="page" style={{ color: 'var(--text-muted)', paddingTop: 60 }}>Loading poll...</div>
  if (!poll) return null

  const isOwner = user && user.id === poll.creator_id

  return (
    <div className="page">
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={poll.is_active ? styles.badgeActive : styles.badgeClosed}>
            {poll.is_active ? 'Active' : 'Closed'}
          </span>
          <span className={styles.by}>by @{poll.creator.username}</span>
        </div>
        <h1 className={styles.title}>{poll.title}</h1>
        {poll.description && <p className={styles.desc}>{poll.description}</p>}
        <div className={styles.stats}>
          <span>{poll.total_votes} total votes</span>
          <span>•</span>
          <span>{poll.options.length} options</span>
        </div>
      </div>

      <div className={styles.options}>
        {poll.options.map(opt => {
          const pct = poll.total_votes ? Math.round((opt.vote_count / poll.total_votes) * 100) : 0
          const isSelected = selected === opt.id
          const isMyVote = myVote === opt.id

          return (
            <div
              key={opt.id}
              className={`${styles.option} ${isSelected ? styles.optionSelected : ''} ${showResults ? styles.optionResult : styles.optionVotable}`}
              onClick={() => { if (!showResults && poll.is_active && user) setSelected(opt.id) }}
            >
              {showResults && (
                <div className={styles.bar} style={{ width: `${pct}%` }} />
              )}
              <div className={styles.optionContent}>
                <div className={styles.optionLeft}>
                  {!showResults && user && poll.is_active && (
                    <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ''}`} />
                  )}
                  <span className={styles.optionText}>{opt.text}</span>
                  {isMyVote && <span className={styles.yourVote}>✓ Your vote</span>}
                </div>
                {showResults && (
                  <div className={styles.optionRight}>
                    <span className={styles.pct}>{pct}%</span>
                    <span className={styles.count}>{opt.vote_count}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!user && poll.is_active && (
        <p className={styles.loginNote}><a href="/login">Log in</a> to vote on this poll.</p>
      )}

      {user && !hasVoted && poll.is_active && (
        <div className={styles.voteRow}>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" onClick={handleVote} disabled={!selected || voting}>
            {voting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      )}

      <div className={styles.footer}>
        <button className="btn btn-ghost" onClick={copyLink}>
          {copied ? '✓ Copied!' : '🔗 Share'}
        </button>
        {isOwner && (
          <>
            {poll.is_active && (
              <button className="btn btn-ghost" onClick={handleClose}>Close Poll</button>
            )}
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>
    </div>
  )
}
