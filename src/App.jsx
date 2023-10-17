import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Search from './components/Search'
// import {data} from "./utils/apiCalls";

function App() {
  return ( 
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/s' element={<Search/>} />
        <Route path='/p' element={<Home/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
