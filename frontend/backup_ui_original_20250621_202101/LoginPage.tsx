import React, { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Camera } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Efeito para animação de fundo
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Limpar erros anteriores
    
    try {
      await authService.login(username, password);
      window.location.href = '/';
    } catch (error) {
      console.error("Erro no login:", error);
      setIsLoading(false);
      
      // Verificar o tipo de erro e mostrar mensagem apropriada
      if (error.response && error.response.status === 401) {
        setError('Credenciais inválidas. Por favor, verifique o nome de utilizador e senha.');
      } else if (error.message === 'Network Error') {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão ou se o servidor está em execução.');
      } else {
        setError('Ocorreu um erro durante o login. Por favor, tente novamente mais tarde.');
      }
    }
  };

  // Função para simular login para testes
  const handleSimulateLogin = () => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      localStorage.setItem('auth_token', 'token_simulado_para_testes');
      localStorage.setItem('user_data', JSON.stringify({
        id: '1',
        name: 'Utilizador Teste',
        username: username || 'admin',
        role: 'admin'
      }));
      
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 p-4 relative overflow-hidden">
      {/* Efeito de luz lateral */}
      <div className="absolute right-0 top-1/4 w-20 h-96 bg-blue-400/30 blur-3xl rounded-full"></div>
      <div className="absolute left-0 bottom-1/4 w-20 h-96 bg-blue-400/20 blur-3xl rounded-full"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-blue-800/20 backdrop-blur-xl rounded-3xl overflow-hidden border border-blue-400/30 shadow-[0_0_15px_rgba(0,149,255,0.15)]">
          {/* Logo central */}
          <div className="flex justify-center mt-10 mb-8">
            <div className="w-24 h-24 rounded-full border-2 border-blue-400/50 flex items-center justify-center">
              <Camera size={40} className="text-blue-400" />
            </div>
          </div>
          
          <div className="px-8 pb-8">
            {/* Mensagem de erro */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-300 text-center text-sm mb-4"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Formulário de login */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Campo de username */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-blue-300" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-blue-900/50 border-0 rounded-md text-white placeholder-blue-300/70 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Username"
                    required
                  />
                </div>
                
                {/* Campo de senha */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-blue-300" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-blue-900/50 border-0 rounded-md text-white placeholder-blue-300/70 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="************"
                    required
                  />
                </div>
                
                {/* Opções adicionais */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-blue-500 bg-blue-900/50 text-blue-400 focus:ring-blue-400 focus:ring-offset-blue-900"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-200">
                      Remember me
                    </label>
                  </div>
                  <div>
                    <a href="#" className="text-sm text-blue-300 hover:text-blue-200">
                      Forgot Password?
                    </a>
                  </div>
                </div>
                
                {/* Botão de login */}
                <div className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-md text-white font-medium uppercase tracking-wider transition-all ${
                      isLoading 
                        ? 'bg-blue-700/50 cursor-not-allowed' 
                        : 'bg-blue-700 hover:bg-blue-600'
                    }`}
                  >
                    {isLoading ? 'Carregando...' : 'LOGIN'}
                  </motion.button>
                </div>
                
                {/* Botão para login simulado (apenas para testes) */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSimulateLogin}
                    className="w-full text-center text-xs text-blue-400/70 hover:text-blue-300 transition-colors"
                  >
                    Modo de demonstração
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
      
      {/* CSS para efeitos visuais - Corrigido para remover o atributo jsx */}
      <style>{`
        .login-page {
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
        }
        
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
