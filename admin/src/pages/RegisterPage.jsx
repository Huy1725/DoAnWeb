import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Tạo tài khoản thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-2xl font-bold text-gray-900">Tạo tài khoản</h1>

        {error ? <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Họ và tên"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mật khẩu"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Xác nhận mật khẩu"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#d70018] px-4 py-3 font-bold text-white disabled:opacity-70"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-[#d70018] hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
