import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService } from '../../services';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Set new password</h2>
      <p className="text-sm text-gray-500 mb-6">Your new password must meet strength requirements.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="New Password" type="password" placeholder="Min. 8 chars" required error={errors.password?.message} {...register('password')} />
        <Input label="Confirm Password" type="password" placeholder="Re-enter" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Reset Password
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

export default ResetPasswordPage;
