import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [internshipDuration, setInternshipDuration] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [salaryType, setSalaryType] = useState('Monthly');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");
    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
      return alert("Minimum budget cannot be greater than maximum budget.");
    }
    try {
      setLoading(true);
      const payload = {
        title,
        category,
        jobType,
        internshipDuration: jobType === 'Internship' ? internshipDuration : undefined,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        salaryType,
        experienceLevel,
        description,
      };
      await axios.post('http://localhost:5000/api/jobs', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("Job posted successfully!");
      navigate('/my-jobs');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const field = {
    background: 'rgba(255,255,255,0.07)',
    padding: '0.85rem 1rem',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '0.95rem',
    outline: 'none',
  };

  const label = {
    fontWeight: 600,
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '0.4rem',
  };

  const opt = { background: '#1e1a2e', color: 'white' };

  const jobTypes = ['Full-time', 'Part-time', 'Internship'];

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '4rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💼</div>
          <h2 style={{
            margin: 0, fontSize: '2rem', fontWeight: 800,
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Post a Job
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Find the right artist or collaborator for your project
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Title */}
          <div>
            <label style={label}>Job Title *</label>
            <input
              type="text"
              placeholder="e.g. Need a VFX Artist for Short Film"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={field}
            />
          </div>

          {/* Job Type toggle */}
          <div>
            <label style={label}>Job Type *</label>
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              {jobTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setJobType(type)}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: 30,
                    border: '1px solid',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    borderColor: jobType === type ? '#a78bfa' : 'rgba(255,255,255,0.15)',
                    background: jobType === type
                      ? 'linear-gradient(90deg, rgba(167,139,250,0.25), rgba(96,165,250,0.25))'
                      : 'rgba(255,255,255,0.05)',
                    color: jobType === type ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {type === 'Full-time' ? '🏢' : type === 'Part-time' ? '⏰' : '🎓'} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Internship duration — only shown when Internship is selected */}
          {jobType === 'Internship' && (
            <div>
              <label style={label}>Internship Duration *</label>
              <select value={internshipDuration} onChange={(e) => setInternshipDuration(e.target.value)} required={jobType === 'Internship'} style={field}>
                <option value="" disabled style={opt}>Select duration</option>
                <option value="1 month" style={opt}>1 month</option>
                <option value="2 months" style={opt}>2 months</option>
                <option value="3 months" style={opt}>3 months</option>
                <option value="6 months" style={opt}>6 months</option>
                <option value="1 year" style={opt}>1 year</option>
              </select>
            </div>
          )}

          {/* Category + Experience */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required style={field}>
                <option value="" disabled style={opt}>Select…</option>
                <option value="VFX" style={opt}>🎬 VFX</option>
                <option value="Painting" style={opt}>🎨 Painting</option>
                <option value="Acting" style={opt}>🎭 Acting</option>
                <option value="Music" style={opt}>🎵 Music</option>
                <option value="Photography" style={opt}>📷 Photography</option>
                <option value="Dance" style={opt}>💃 Dance</option>
                <option value="Writing" style={opt}>✍️ Writing</option>
                <option value="Other" style={opt}>✨ Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Experience Level</label>
              <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} style={field}>
                <option value="Beginner" style={opt}>🌱 Beginner</option>
                <option value="Intermediate" style={opt}>⚡ Intermediate</option>
                <option value="Expert" style={opt}>🏆 Expert</option>
              </select>
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label style={label}>Budget / Compensation (₹)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  placeholder="Min (e.g. 10,000)"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  min="0"
                  style={field}
                />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>to</span>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  placeholder="Max (e.g. 50,000)"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  min="0"
                  style={field}
                />
              </div>
            </div>
            {/* Salary type selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', flexWrap: 'wrap' }}>
              {['Monthly', 'Annual', 'Fixed (Project)'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSalaryType(type)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 20,
                    border: '1px solid',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    borderColor: salaryType === type ? '#60a5fa' : 'rgba(255,255,255,0.15)',
                    background: salaryType === type ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
                    color: salaryType === type ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {type === 'Monthly' ? '📅 Monthly' : type === 'Annual' ? '📆 Annual' : '🗂️ Fixed (Project)'}
                </button>
              ))}
            </div>
            {(budgetMin || budgetMax) && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'rgba(167,139,250,0.8)', fontWeight: 600 }}>
                💰 ₹{budgetMin || '?'} – ₹{budgetMax || '?'} · {salaryType}
              </p>
            )}
          </div>

          {/* Required Skills */}
          <div>
            <label style={label}>Required Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. AfterEffects, Blender, Premiere Pro"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              style={field}
            />
          </div>

          {/* Description */}
          <div>
            <label style={label}>Job Description *</label>
            <textarea
              placeholder="Describe the role, deliverables, timeline, and anything else relevant..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              style={{ ...field, resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              borderRadius: 12,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.04em',
              background: loading
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)',
              color: loading ? '#888' : '#0f0c29',
              boxShadow: loading ? 'none' : '0 6px 24px rgba(167,139,250,0.45)',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? '⏳ Posting...' : '🚀 Post Job'}
          </button>
        </form>
      </div>
    </main>
  );
}
