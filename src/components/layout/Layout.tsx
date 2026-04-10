import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from '../Toast';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
