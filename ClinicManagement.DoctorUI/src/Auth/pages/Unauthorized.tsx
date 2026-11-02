export default function Unauthorized() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <h1>403</h1>

      <h2>Không có quyền truy cập</h2>

      <p>
        Tài khoản của bạn không được phép truy cập hệ thống này.
      </p>
    </div>
  );
}