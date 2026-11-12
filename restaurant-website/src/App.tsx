import Nav from './components/Nav';
import Hero from './components/Hero';
import Reservations from './components/Reservations';
import { FireRingDefs } from './components/ui';
import { Philosophy, OpenFire, FireToPour, Menu, WhiskeyLibrary, Tableside, Lounge, Interior, Visit, Finale, Footer } from './components/Sections';
import { useSiteEffects } from './effects';

function Effects() {
  useSiteEffects();
  return null;
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <FireRingDefs />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Philosophy />
        <OpenFire />
        <FireToPour />
        <Menu />
        <WhiskeyLibrary />
        <Tableside />
        <Lounge />
        <Interior />
        <Reservations />
        <Visit />
        <Finale />
      </main>
      <Footer />
      <Effects />
    </>
  );
}
