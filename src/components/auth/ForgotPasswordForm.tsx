import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  
  // Faire défiler vers le haut lorsque le composant est monté
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }
    
    try {
      setLoading(true);
      const success = await resetPassword(email);
      
      if (success) {
        setMessage('Un email de réinitialisation a été envoyé à votre adresse email.');
      } else {
        setError('Aucun compte associé à cette adresse email.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Mot de passe oublié</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <p className="mb-6 text-gray-600">
        Entrez votre adresse email ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="votre@email.com"
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          <Link to="/login" className="text-primary hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;