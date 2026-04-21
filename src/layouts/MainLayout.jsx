import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import TopBar from '../components/layout/TopBar';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <main>{children}</main>
    </div>
  );
}
