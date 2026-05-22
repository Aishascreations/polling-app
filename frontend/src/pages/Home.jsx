import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import styles from './Home.module.css'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/polls').then(r => setPolls(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className={styles.hero}>
        <h1>What does everyone think?</h1>
        <p>Create polls, share them, and see live results in real time.</p>
        <Link to="/create" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '12px 28px' }}>
          Create a Poll
        </Link>
      </div>

      <div className={styles.grid}>
        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading polls...</p>}
        {!loading && polls.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No polls yet. Be the first to create one!</p>
        )}
        {polls.map(poll => (
          <Link to={`/polls/${poll.id}`} key={poll.id} className={styles.pollCard}>
            <div className={styles.cardTop}>
              <span className={poll.is_active ? styles.badgeActive : styles.badgeClosed}>
                {poll.is_active ? 'Active' : 'Closed'}
              </span>
              <span className={styles.voteCount}>{poll.total_votes} votes</span>
            </div>
            <h3 className={styles.pollTitle}>{poll.title}</h3>
            {poll.description && <p className={styles.pollDesc}>{poll.description}</p>}
            <div className={styles.cardFooter}>
              <span>by @{poll.creator.username}</span>
              <span>{poll.options.length} options</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
