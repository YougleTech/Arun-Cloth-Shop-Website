import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LoginForm from '../components/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;