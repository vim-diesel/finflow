'use client';

import { Input } from '@/components/input';
import { login } from './actions';
import { Button } from '@/components/button';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const res = await login(email, password);
    setResult(res?.message ?? '');
  };

  return (
    <form onSubmit={handleLogin}>
      <label htmlFor='email'>Email:</label>
      <Input
        id='email'
        name='email'
        type='email'
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor='password'>Password:</label>
      <Input
        id='password'
        name='password'
        type='password'
        onChange={(e) => {
          setResult('');
          setPassword(e.target.value);
        }}
        required
      />
      <Button type='submit'>Log in</Button>
      {result && <p>{result}</p>}
      {/* <button formAction={signup}>Sign up</button> */}
    </form>
  );
}
