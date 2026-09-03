export default function Unauthorized() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ maxWidth: 520, textAlign: 'center' }}>
        <h1>Không có quyền truy cập</h1>
        <p>Tài khoản hiện tại chưa được cấp quyền quản trị AdminUI.</p>
      </section>
    </main>
  );
}
