import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../../services';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

const schema = z.object({ email: z.string().email('Enter a valid email') });

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Check your inbox</h3>
        <p className="text-sm text-gray-500 mb-6">
          If an account with that email exists, we've sent a reset link valid for 10 minutes.
        </p>
        <Link to="/login" className="text-sm text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Reset your password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com" required error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Send Reset Link
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
