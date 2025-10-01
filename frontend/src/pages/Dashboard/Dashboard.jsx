import { useAuth } from '../../store/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Claude Code burayı güzelleştirecek */}
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Çıkış Yap
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hoş geldin, {user?.fullName}!</h2>
          <p className="text-gray-600">Sınav Türü: {user?.examType}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO: Stats kartları buraya gelecek */}
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Toplam Çalışma</p>
            <p className="text-3xl font-bold mt-2">-- saat</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Toplam Soru</p>
            <p className="text-3xl font-bold mt-2">-- soru</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Başarı Oranı</p>
            <p className="text-3xl font-bold mt-2">--%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;