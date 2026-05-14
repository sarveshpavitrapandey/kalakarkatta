import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchMyJobs(); }, []);

  const fetchMyJobs = async () => {
    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.get('http://localhost:5000/api/jobs?mine=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // filter to only my jobs using creator field
      const myId = user?._id || user?.user?._id;
      setJobs(res.data.filter(j => j.creator?._id === myId || j.creator === myId));
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobs.filter(j => j._id !== id));
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const jobTypeColor = { 'Full-time': '#34d399', 'Part-time': '#fbbf24', 'Internship': '#60a5fa' };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)',
      padding: '4rem 1rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{
              margin: 0, fontSize: '2rem', fontWeight: 800,
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>💼 My Jobs</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Job postings you have created</p>
          </div>
          <Link to="/create-job" style={{
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            color: '#0f0c29', padding: '0.7rem 1.4rem',
            borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
          }}>
            + Post a Job
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '4rem' }}>Loading...</p>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '6rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ color: 'rgba(255,255,255,0.6)' }}>No job postings yet</h2>
            <Link to="/create-job" style={{
              display: 'inline-block', marginTop: '1.5rem',
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
              color: '#0f0c29', padding: '0.8rem 2rem',
              borderRadius: 10, textDecoration: 'none', fontWeight: 700,
            }}>🚀 Post First Job</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {jobs.map(job => (
              <div key={job._id} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '1.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(167,139,250,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.6rem', alignItems: 'center' }}>
                      <span style={{ background: `${jobTypeColor[job.jobType] || '#a78bfa'}22`, border: `1px solid ${jobTypeColor[job.jobType] || '#a78bfa'}55`, color: jobTypeColor[job.jobType] || '#a78bfa', borderRadius: 20, padding: '0.2rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        {job.jobType || 'Full-time'}
                      </span>
                      {job.category && (
                        <span style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', borderRadius: 20, padding: '0.2rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          {job.category}
                        </span>
                      )}
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 20, padding: '0.2rem 0.8rem', fontSize: '0.75rem' }}>
                        {job.experienceLevel}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', fontWeight: 700 }}>{job.title}</h3>
                    {job.internshipDuration && (
                      <p style={{ margin: '0 0 0.4rem', color: '#60a5fa', fontSize: '0.85rem' }}>⏱️ Duration: {job.internshipDuration}</p>
                    )}
                    {(job.budgetMin || job.budgetMax) && (
                      <p style={{ margin: '0 0 0.4rem', color: '#34d399', fontSize: '0.9rem', fontWeight: 600 }}>
                        💰 ₹{job.budgetMin?.toLocaleString() || '?'} – ₹{job.budgetMax?.toLocaleString() || '?'} · {job.salaryType}
                      </p>
                    )}
                    {job.requiredSkills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                        {job.requiredSkills.map(s => (
                          <span key={s} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteJob(job._id)}
                    style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
