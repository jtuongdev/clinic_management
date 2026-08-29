import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../context/AuthProvider';

import './AuthLayout.css';

export default function AuthLayout() {
  const { login, loading } = useLogin();
  const { logout } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const result = await login({
        username,
        password,
      });

      if (!result.success) {
        alert(result.message || 'Đăng nhập thất bại');
        return;
      }

      // ==========================
      // KIỂM TRA QUYỀN BÁC SĨ
      // ==========================

      const roles = result.data.user.roles;

      if (!roles.includes('BacSi')) {
        logout();

        alert(
          'Tài khoản không có quyền truy cập hệ thống Bác sĩ.'
        );

        return;
      }

      // ==========================
      // ĐÚNG QUYỀN
      // ==========================

      navigate('/dashboard', {
        replace: true,
      });

    } catch (error: any) {
      console.error('Login error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';

      alert(message);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">

        <h1 className="login-title">
          Clinic Management
        </h1>

        <p className="login-role">
          Cổng dành cho Bác sĩ
        </p>

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >
          <div className="form-group">
            <label htmlFor="username">
              Tên đăng nhập
            </label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nhập username"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Mật khẩu
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? 'Đang đăng nhập...'
              : 'Đăng nhập'}
          </button>
        </form>

      </main>
    </div>
  );
}