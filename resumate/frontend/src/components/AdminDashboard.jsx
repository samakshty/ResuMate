import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5178/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserResumes = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5178/admin/users/${userId}/resumes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSelectedUser({
        ...users.find(u => u.id === userId),
        resumes: response.data
      });
    } catch (err) {
      setError('Failed to fetch user resumes');
      console.error('Error fetching user resumes:', err);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="space-y-4">
            {users.map(user => (
              <div
                key={user.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-indigo-100 border-indigo-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => fetchUserResumes(user.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{user.name || 'Unnamed User'}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Details and Resumes */}
        <div className="bg-white rounded-lg shadow p-6">
          {selectedUser ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Details</h2>
              <div className="mb-6">
                <p><span className="font-medium">Name:</span> {selectedUser.name || 'Unnamed User'}</p>
                <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                <p><span className="font-medium">Joined:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>

              <h3 className="text-lg font-semibold mb-4">Resumes</h3>
              <div className="space-y-4">
                {selectedUser.resumes?.map(resume => (
                  <div key={resume.id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{resume.name || 'Unnamed Resume'}</h4>
                    <p className="text-sm text-gray-600">{resume.email}</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Skills:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {resume.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Select a user to view their details and resumes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 