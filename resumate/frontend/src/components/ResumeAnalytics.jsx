import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AcademicCapIcon, BriefcaseIcon, CodeBracketIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend);

function ResumeAnalytics({ data }) {
  // Prepare data for skills pie chart
  const skillsData = {
    labels: data.skills,
    datasets: [
      {
        data: data.skills.map(() => Math.random() * 100), // Random values for demonstration
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#8AC249',
          '#EA526F',
          '#23B5D3',
          '#279AF1',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-lg">
      {/* Contact Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">{data.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">+91-8931022445</span>
            </div>
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">bento.me/priyanshusinghh</span>
            </div>
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills Distribution</h3>
          <div className="h-64">
            <Pie data={skillsData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Education Timeline */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Education Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <AcademicCapIcon className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Bennett University</h4>
              <p className="text-gray-600">Bachelor of Technology - Computer Science Engineering</p>
              <p className="text-sm text-gray-500">CGPA: 8.0</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <AcademicCapIcon className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Kendriya Vidyalaya</h4>
              <p className="text-gray-600">Central Board of Secondary Education (CBSE)</p>
              <p className="text-sm text-gray-500">Percentage: 87.1%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {['Python', 'C++', 'JavaScript', 'SQL', 'JAVA'].map((lang) => (
              <span key={lang} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Frameworks</h3>
          <div className="flex flex-wrap gap-2">
            {['Scikit', 'React', 'NLTK', 'Django', 'Flask', 'NodeJS'].map((framework) => (
              <span key={framework} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {framework}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tools & Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {['Pandas', 'Microsoft Excel', 'GIT', 'PostgreSQL', 'MySQL', 'SQLite', 'AWS', 'GCP', 'IBM Cloud'].map((tool) => (
              <span key={tool} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalytics; 