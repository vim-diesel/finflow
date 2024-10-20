import { Heading } from '@/components/heading';
import { LoginForm } from './loginForm';

export default function LoginPage() {
  return (
    <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
      <Heading level={1}>Log in or sign up</Heading>
      <LoginForm />
    </div>
  );
}
