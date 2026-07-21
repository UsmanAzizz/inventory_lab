import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const Login = () => {
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d1117',
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
        background: '#161b22',
        padding: '30px 20px',
        borderRadius: '6px',
        width: '100%',
        maxWidth: '310px',
        border: '1px solid #30363d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', margin: 0 }}>
          Silakan masuk menggunakan akun Google Anda untuk mengakses sistem.
        </p>

        <button 
          onClick={loginWithGoogle}
          style={{ 
            fontFamily: '"Google Sans", Roboto, "Helvetica Neue", sans-serif',
            padding: '8px 16px', 
            fontSize: '14px', 
            fontWeight: '500', 
            lineHeight: '20px',
            color: '#000000',
            backgroundColor: '#ffffff',
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
            transition: '0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Masuk dengan Google
        </button>
      </div>

    </div>
  );
};

export default Login;
