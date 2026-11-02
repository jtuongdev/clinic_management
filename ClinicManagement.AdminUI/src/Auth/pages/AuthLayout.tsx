// ClinicManagement.AdminUl › sc › Auth › pages ›
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import './AuthLayout.css';

export default function AuthLayout() {
  const { login, loading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await login({
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    });
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      alert(result.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        <h1 className="login-title">Clinic Management</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input id="username" name="username" type="text" placeholder="Nhập username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" placeholder="Nhập mật khẩu" required />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </main>
    </div>
  );
}