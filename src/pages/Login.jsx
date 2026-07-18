import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Fingerprint } from 'lucide-react';

const Login = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '787898') {
      localStorage.setItem('auth_token', 'verified');
      navigate('/');
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d1117', // GitHub dark background
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
      padding: '24px'
    }}>
      
      {/* Logo Area */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ShieldCheck size={48} color="#c9d1d9" style={{ marginBottom: '16px' }} />
        <h1 style={{ 
          color: '#c9d1d9', 
          fontSize: '24px', 
          fontWeight: '300', 
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          Sign in to Lab Inventory
        </h1>
      </div>

      {/* Card Form */}
      <div style={{
        background: '#161b22', // GitHub dark card
        padding: '20px',
        borderRadius: '6px',
        width: '100%',
        maxWidth: '310px',
        border: '1px solid #30363d' // GitHub dark border
      }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
          
          <label style={{ 
            color: '#c9d1d9', 
            fontSize: '14px', 
            fontWeight: '400', 
            marginBottom: '8px',
            display: 'block'
          }}>
            Passcode / PIN
          </label>
          
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            style={{
              width: '100%',
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${error ? '#f85149' : '#30363d'}`, // GitHub red for error
              backgroundColor: '#0d1117',
              color: '#c9d1d9',
              fontSize: '14px',
              lineHeight: '20px',
              outline: 'none',
              boxShadow: error ? '0 0 0 1px #f85149' : 'inset 0 1px 0 rgba(255,255,255,0.01)',
              transition: '80ms cubic-bezier(0.33, 1, 0.68, 1)',
              marginBottom: '16px'
            }}
            autoFocus
          />

          <button 
            type="submit" 
            style={{ 
              padding: '5px 16px', 
              fontSize: '14px', 
              fontWeight: '500', 
              lineHeight: '20px',
              color: '#ffffff',
              backgroundColor: '#238636', // GitHub primary green
              border: '1px solid rgba(240,246,252,0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%',
              transition: '0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2ea043'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#238636'}
          >
            <Fingerprint size={16} /> Sign in
          </button>
        </form>
      </div>

      {/* Error Message outside card */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: 'rgba(248, 81, 73, 0.1)',
          border: '1px solid rgba(248, 81, 73, 0.4)',
          borderRadius: '6px',
          color: '#ff7b72',
          fontSize: '13px',
          width: '100%',
          maxWidth: '310px',
          textAlign: 'center'
        }}>
          Incorrect passcode or PIN.
        </div>
      )}

    </div>
  );
};

export default Login;
