import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLoginModal.module.css';

const AdminLoginModal = ({ isOpen, onClose }) => {
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // First useEffect - handle modal open/close and authentication check
  useEffect(() => {
    if (isOpen) {
      // If user is already authenticated, close the modal immediately
      if (isAuthenticated) {
        onClose();
        return;
      }
      
      document.body.style.overflow = 'hidden';
      // Reset form when modal opens
      setFormData({ email: '', password: '' });
      setErrors({});
      setLoginError('');
      setLoginSuccess(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isAuthenticated, onClose]);

  // Second useEffect - handle escape key
  useEffect(() => {
    if (isOpen) {
      const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, onClose]);

  // If user is authenticated or modal is not open, don't render
  if (isAuthenticated || !isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (loginError) {
      setLoginError('');
    }
    if (loginSuccess) {
      setLoginSuccess(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');
    setLoginSuccess(false);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Login successful - show success message and close
        setLoginSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Login failed
        setLoginError(getErrorMessage(result.errorCode));
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      default:
        return 'Login failed. Please check your credentials and try again.';
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <div className={styles.modalCard}>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
          
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <FaShieldAlt className={styles.logo} />
            </div>
            <h1 className={styles.title}>Admin Login</h1>
            <p className={styles.subtitle}>Access your dashboard</p>
          </div>

          {loginSuccess && (
            <div className={styles.successAlert}>
              <FaCheckCircle className={styles.successIcon} />
              <span>Login successful!</span>
            </div>
          )}

          {loginError && (
            <div className={styles.errorAlert}>
              <FaShieldAlt className={styles.errorIcon} />
              <span>{loginError}</span>
            </div>
          )}

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            <div className={styles.options}>
              <label className={styles.rememberMe}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checkmark}></span>
                Remember me
              </label>
              <a href="#" className={styles.forgotPassword}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className={`${styles.loginButton} ${isLoading ? styles.loading : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Secure access to admin dashboard
            </p>
            <div className={styles.securityInfo}>
              <FaShieldAlt className={styles.securityIcon} />
              <span>Firebase Authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal; 