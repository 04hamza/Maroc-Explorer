import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './Components/home/home';
import Footer from './Components/footer/footer';

function App() {
  return (
     <Router>
      <Routes>
         <Route path='/' element={<Accueil/>}></Route>
      </Routes>
      <Footer/>
     </Router>
  );
}

export default App;
