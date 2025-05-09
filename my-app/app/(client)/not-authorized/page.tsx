export default function NotAuthorized() {
    return (
      <div className="text-center p-10">
        <h1 className="text-3xl text-red-600 font-bold">🚫 Không đủ quyền</h1>
        <p className="mt-4 text-gray-700">Bạn cần quyền <strong>admin</strong> để truy cập trang này.</p>
      </div>
    );
  }
  