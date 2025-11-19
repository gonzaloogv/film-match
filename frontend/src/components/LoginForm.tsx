import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLogin as useGoogleLoginHook } from '@/hooks/auth/useGoogleLogin';
import { useEmailAuth } from '@/hooks/auth/useEmailAuth';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { handleGoogleSuccess: processGoogleToken, handleGoogleError, isLoading: isGoogleLoading } = useGoogleLoginHook();
  const { register, login, isLoading: isEmailLoading, error: emailError, clearError } = useEmailAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form states
  const [nickname, setNickname] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isLoading = isGoogleLoading || isEmailLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    try {
      if (isRegister) {
        // Validar que los emails coincidan
        if (registerEmail !== confirmEmail) {
          setFormError('Los correos electrónicos no coinciden');
          return;
        }
        // Validar que las contraseñas coincidan
        if (registerPassword !== confirmPassword) {
          setFormError('Las contraseñas no coinciden');
          return;
        }
        // Validar longitud de contraseña
        if (registerPassword.length < 8) {
          setFormError('La contraseña debe tener al menos 8 caracteres');
          return;
        }

        // Intentar registro
        const result = await register(registerEmail, registerPassword, nickname || undefined);

        if (result.success) {
          console.log('✅ Registro exitoso:', result.user);
          navigate('/home');
        } else {
          setFormError(result.error || 'Error al registrarse');
        }
      } else {
        // Intentar login
        const result = await login(email, password);

        if (result.success) {
          console.log('✅ Login exitoso:', result.user);
          navigate('/home');
        } else {
          setFormError(result.error || 'Error al iniciar sesión');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setFormError(error instanceof Error ? error.message : 'Error en la autenticación');
    }
  };

  const onGoogleSuccess = (credentialResponse: any) => {
    console.log('✅ Google login success:', credentialResponse);
    try {
      // Extract JWT token from Google response
      const token = credentialResponse.credential;
      if (token) {
        // Call the hook's handler with the token
        processGoogleToken(token);
        // Navigate to home on success
        navigate('/home');
      } else {
        setGoogleError('No credential received from Google');
      }
    } catch (error) {
      console.error('Error processing Google login:', error);
      setGoogleError('Error logging in with Google');
    }
  };

  const onGoogleError = () => {
    console.error('❌ Google login failed');
    setGoogleError('Failed to login with Google. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 xs:px-4 sm:px-6 py-6 xs:py-8">
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-4 xs:mb-6 sm:mb-8">
          <div className="w-14 xs:w-20 h-14 xs:h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mb-2 xs:mb-4 shadow-lg">
            <Film className="w-8 xs:w-12 h-8 xs:h-12 text-white" />
          </div>
          <h1 className="text-xl xs:text-3xl sm:text-4xl font-bold mb-1 text-center">FILM-MATCH</h1>
          <p className="text-gray-400 text-xs sm:text-base text-center">Desliza. Matchea. Mira.</p>
        </div>

        {/* Form Card */}
        <div className="card">
          {/* Google Sign-In Button */}
          <div className="flex justify-center mb-3 xs:mb-6">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              useRefreshToken
              locale="es_ES"
            />
          </div>

          {/* Error messages */}
          {(googleError || formError) && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-3 xs:mb-6 text-xs xs:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{googleError || formError}</span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center my-3 xs:my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <div className="px-2 xs:px-4 text-gray-500 text-xs xs:text-sm">o</div>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
            {isRegister ? (
              <>
                {/* Register Form */}
                <div>
                  <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Apodo</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Tu apodo"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="tu@ejemplo.com"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Confirmar Correo</label>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="tu@ejemplo.com"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* Login Form */}
                <div>
                  <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@ejemplo.com"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-3 xs:mt-6 py-2 text-xs xs:text-sm sm:text-base rounded-lg xs:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isRegister ? 'Registrando...' : 'Iniciando sesión...'}
                </span>
              ) : (
                isRegister ? 'Registrarse' : 'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="text-center mt-3 xs:mt-6">
            <span className="text-gray-400 text-xs xs:text-sm">
              {isRegister ? '¿Ya tienes cuenta?' : "¿No tienes cuenta?"}{' '}
            </span>
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-primary-purple hover:underline font-semibold text-xs xs:text-sm"
            >
              {isRegister ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
