import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, Product, Navbar, Search, Cart, SignInUp, Orders } from './components'

function App() {
  return ( 
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/s' element={<Search/>} />
        <Route path='/p' element={<Product/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/signin' element={<SignInUp/>} />
        <Route path='/signup' element={<SignInUp/>} />
        <Route path='/orders' element={<Orders/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
