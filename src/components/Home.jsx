import "./styles/categories.css"
import Carousel from "./Carousel";
import Categories from "./Categories";
import { useInitialFetch, useWindowDimensions } from "../utils/custom hooks";

export default function Home(){

  const categoriesData = useInitialFetch("categoriesData", "categories")
  const windowDimensions = useWindowDimensions()
  return <div style={{width: "100%"}}>
    <Carousel/>
    <section className="categories__section"
      style={{ display: "grid", gridTemplateColumns: `repeat(${windowDimensions.windowWidth>1000?4:3}, minmax(0, 1fr))`, }}
    >
      {categoriesData.map(obj=><Categories key={obj.offer} obj={obj}/>)}
    </section>
  </div>
}