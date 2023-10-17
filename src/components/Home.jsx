import "./styles/categories.css"
import Carousel from "./Carousel";
import Categories from "./Categories";
import { useInitialFetch } from "../utils/custom hooks";

export default function Home(){

  const categoriesData = useInitialFetch("categoriesData", "categories")
  
  return <div style={{width: "100%"}}>
    <Carousel/>
    <section className="categories__section"
      style={{ display: "grid", gridTemplateColumns: `${"auto ".repeat(4)}`, }}
    >
      {categoriesData.map(obj=><Categories key={obj.offer} obj={obj}/>)}
    </section>
  </div>
}