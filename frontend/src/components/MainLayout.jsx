import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainContent = ({ children }) => {
  return <main className="max-w-7xl mx-auto w-full px-2 py-4">{children}</main>;
};

const MainLayout = () => {
  return (
    <div
      className="min-h-screen bg-gray-100 font-sans"
      style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
    >
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
export { MainContent };
