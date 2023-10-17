import { logo } from "../assets/images"

export default function Navbar(){
  return <header style={{backgroundColor:"black", display:"flex"}}>

    <nav>
      <img src={logo} alt="logo" style={{width:"100px", margin:"15px 15px 10px"}}/>
    </nav>
    <input style={{margin:"10px 0px"}}/>
  </header>
}