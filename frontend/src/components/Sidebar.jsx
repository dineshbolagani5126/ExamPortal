import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaClipboardList, 
  FaChartBar, 
  FaUsers, 
  FaQuestionCircle,
  FaCheckCircle,
  FaBell
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/student', icon: FaHome, label: 'Dashboard', end: true },
    { to: '/student/exams', icon: FaClipboardList, label: 'Exams' },
    { to: '/student/results', icon: FaChartBar, label: 'Results' },
    { to: '/student/notifications', icon: FaBell, label: 'Notifications' },
  ];

  const facultyLinks = [
    { to: '/faculty', icon: FaHome, label: 'Dashboard', end: true },
    { to: '/faculty/exams', icon: FaClipboardList, label: 'Manage Exams' },
    { to: '/faculty/questions', icon: FaQuestionCircle, label: 'Question Bank' },
    { to: '/faculty/evaluate', icon: FaCheckCircle, label: 'Evaluate' },
    { to: '/faculty/notifications', icon: FaBell, label: 'Notifications' },
  ];

  const adminLinks = [
    { to: '/admin', icon: FaHome, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: FaUsers, label: 'Manage Users' },
    { to: '/admin/exams', icon: FaClipboardList, label: 'Manage Exams' },
    { to: '/admin/questions', icon: FaQuestionCircle, label: 'Question Bank' },
    { to: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
    { to: '/admin/notifications', icon: FaBell, label: 'Notifications' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'student':
        return studentLinks;
      case 'faculty':
        return facultyLinks;
      case 'admin':
        return adminLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg overflow-y-auto">
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
