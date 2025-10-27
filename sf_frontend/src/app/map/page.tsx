import Footer from '@/app/layout/Footer';
import Navbar from '@/app/layout/Navbar';
import MapWrapper from './components/MapWrapper';

export default function MapPage() {
  return (
    <div className="w-full h-full">
      <Navbar />
      <MapWrapper />
    </div>
  );
}
