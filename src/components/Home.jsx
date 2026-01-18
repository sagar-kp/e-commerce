import "./styles/categories.css";
import Carousel from "./Carousel";
import Categories from "./Categories";
import { useInitialFetch, useWindowDimensions } from "../utils/custom hooks";
import { placeholderCategoriesData } from "../utils/placeholderData";

export default function Home() {
  const { data } = useInitialFetch("categoriesData", "categories");
  const categoriesData = data?.length ? data : placeholderCategoriesData;
  const windowDimensions = useWindowDimensions();
  return (
    <div style={{ width: "100%" }}>
      <Carousel />
      <section
        className="categories__section"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${
            windowDimensions?.windowWidth > 1000 ? 4 : 3
          }, minmax(0, 1fr))`,
        }}
      >
        {categoriesData?.map((obj, index) => (
          <Categories key={obj?.offer?.length ? obj.offer : index} obj={obj} />
        ))}
      </section>
    </div>
  );
}
