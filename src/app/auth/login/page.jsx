'use client'
import { useEffect } from 'react';
import NProgress from 'nprogress';

import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  useEffect(() => {
    NProgress.done();
  }, []);
  return <LoginForm />
}