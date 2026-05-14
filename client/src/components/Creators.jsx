import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setCreators(response.data);
      } catch (error) {
        console.error("Error fetching creators:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  return (
    <section className="creators" id="creators">
      <div className="container">
        <header className="section-header">
          <h2>Featured Creators</h2>
          <p>Meet members pushing boundaries in sound, visuals, and performance.</p>
        </header>
        {loading ? (
          <p>Loading creators...</p>
        ) : (
          <div className="creator-grid">
            {creators.map((creator) => (
              <article className="creator-card" key={creator._id}>
                {/* Fallback image if user doesn't have an avatar/portfolio set up yet */}
                <img 
                  src={creator.profilePicture || creator.avatar || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"} 
                  alt={`Portrait of ${creator.name}`} 
                  className="w-full h-48 object-cover"
                  loading="lazy" 
                />
                <div className="creator-info">
                  <h3>{creator.name}</h3>
                  <span className="creator-discipline">
                    {creator.skills && creator.skills.length > 0 ? creator.skills.join(', ') : 'Artist'}
                  </span>
                  <p>{creator.email}</p>
                  
                  {creator.availabilityStatus && creator.availabilityStatus !== 'Unavailable' && (
                    <span className="badge badge-status" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                      {creator.availabilityStatus}
                    </span>
                  )}

                  <div className="creator-actions">
                    <Link to={`/profile/${creator._id}`} className="text-link">
                      View profile →
                    </Link>
                    {creator.availabilityStatus === 'Open to Work' && (
                      <Link to={`/messages/${creator._id}`} className="cta tertiary no-underline text-center">
                        Hire
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
