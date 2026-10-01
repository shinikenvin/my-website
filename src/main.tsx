import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept harmless cross-origin frame access warnings in sandboxed iframe previews
if (typeof window !== 'undefined') {
  const isSecurityWarning = (msg: unknown) => {
    const s = String(msg || '');
    return (
      s.includes('Blocked a frame with origin') || 
      s.includes('cross-origin frame') ||
      s.includes('SecurityError')
    );
  };

  const prevOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (isSecurityWarning(message) || isSecurityWarning(error?.message)) {
      return true;
    }
    if (typeof prevOnError === 'function') {
      return prevOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    const msg = event?.message || event?.error?.message || '';
    if (isSecurityWarning(msg)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      console.warn('Suppressed cross-origin iframe security warning:', msg);
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason?.message || String(event?.reason || '');
    if (isSecurityWarning(reason)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      console.warn('Suppressed cross-origin iframe rejection:', reason);
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(<App />);

