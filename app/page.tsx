import Footer from './footer';
import Header from './header';
import Hero from './hero';

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen py-2'>
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
