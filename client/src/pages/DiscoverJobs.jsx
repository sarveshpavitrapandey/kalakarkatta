import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscoverJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  
  // Application Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (job) => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      alert("Please login to apply.");
      return;
    }
    const loggedUser = JSON.parse(userString);
    
    // Check if user is "Open to Work"
    if (loggedUser.user?.availabilityStatus !== 'Open to Work' && loggedUser.availabilityStatus !== 'Open to Work') {
      alert("You must set your status to 'Open to Work' in your profile to apply for jobs.");
      return;
    }

    setSelectedJob(job);
    setCoverLetter('');
    setResumeFile(null);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      alert("Please upload your resume.");
      return;
    }

    setIsApplying(true);
    const userString = localStorage.getItem('user');
    const loggedUser = JSON.parse(userString);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('coverLetter', coverLetter);

    try {
      await axios.post(`http://localhost:5000/api/jobs/${selectedJob._id}/apply`, 
        formData,
        { headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${loggedUser.token}` 
        } }
      );
      alert("Application submitted successfully! You will be notified if you are shortlisted.");
      setSelectedJob(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to apply.");
    } finally {
      setIsApplying(false);
    }
  };

  const filteredJobs = filterType ? jobs.filter(j => j.jobType === filterType) : jobs;
  const jobTypes = ['Full-time', 'Part-time', 'Internship'];
  const typeColors = { 'Full-time': 'text-green-400 bg-green-400/10 border-green-400/20', 'Part-time': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', 'Internship': 'text-blue-400 bg-blue-400/10 border-blue-400/20' };

  return (
    <div className="min-h-screen bg-gradient-main pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header & Filter */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent mb-4">
            Find Jobs
          </h1>
          <p className="text-textMuted mb-8">Discover opportunities for artists and creators</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setFilterType('')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${!filterType ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border hover:bg-white/10'}`}
            >
              All Roles
            </button>
            {jobTypes.map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${filterType === type ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border hover:bg-white/10'}`}
              >
                {type === 'Full-time' ? '🏢' : type === 'Part-time' ? '⏰' : '🎓'} {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-center text-textMuted mt-10">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center mt-16">
            <span className="text-5xl mb-4 block">💼</span>
            <h2 className="text-xl text-textMuted">No jobs found</h2>
          </div>
        ) : (
          <motion.div 
            className="flex flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {filteredJobs.map(job => (
              <motion.div 
                key={job._id}
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="bg-surface/50 border border-border rounded-2xl p-6 backdrop-blur-md hover:border-primary/50 transition duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 rounded border ${typeColors[job.jobType] || 'text-primary bg-primary/10 border-primary/20'}`}>
                        {job.jobType || 'Full-time'}
                      </span>
                      {job.category && <span className="text-textMuted bg-black/20 px-2 py-0.5 rounded border border-white/5">{job.category}</span>}
                      <span className="text-textMuted">• {job.experienceLevel}</span>
                      {job.internshipDuration && <span className="text-blue-300 text-xs">({job.internshipDuration})</span>}
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right">
                    {(job.budgetMin || job.budgetMax) && (
                      <div className="text-green-400 font-bold text-lg">
                        ₹{job.budgetMin?.toLocaleString() || '?'} – ₹{job.budgetMax?.toLocaleString() || '?'}
                      </div>
                    )}
                    <div className="text-textMuted text-sm">{job.salaryType}</div>
                  </div>
                </div>

                <p className="text-textMuted text-sm line-clamp-2 mb-4">
                  {job.description}
                </p>

                {job.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.requiredSkills.map(s => (
                      <span key={s} className="text-xs bg-black/30 border border-white/10 text-white/70 px-2 py-1 rounded-md">{s}</span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end pt-4 border-t border-border">
                  <button 
                    onClick={() => handleOpenApply(job)}
                    className="bg-gradient-to-r from-primary to-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition"
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-2xl z-10"
            >
              <h2 className="text-2xl font-bold mb-2">Apply for {selectedJob.title}</h2>
              <p className="text-textMuted text-sm mb-6">Submit your resume and cover letter to apply.</p>
              
              <form onSubmit={handleSubmitApplication} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-textMuted mb-2">Cover Letter (Optional)</label>
                  <textarea 
                    placeholder="Tell us why you're a good fit..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition min-h-[100px] placeholder:text-white/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Upload Resume (PDF/DOC)</label>
                  <input 
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="w-full text-sm text-white/50
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/20 file:text-primary
                      hover:file:bg-primary/30 transition cursor-pointer"
                    required
                  />
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 px-6 py-3 border border-border rounded-xl text-sm font-bold hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isApplying}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/40 transition disabled:opacity-50"
                  >
                    {isApplying ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
