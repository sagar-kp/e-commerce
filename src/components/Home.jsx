import Carousel from "./Carousel";
import Categories from "./Categories";
import { useInitialFetch } from "../utils/custom hooks";
import { placeholderCategoriesData } from "../utils/placeholderData";
import "./styles/categories.css";
import "./styles/common.css";

export default function Home() {
  const { data } = useInitialFetch("categoriesData", "categories");
  const categoriesData = data?.length ? data : placeholderCategoriesData;
  return (
    <div className="full-width">
      <Carousel />
      <section className="categories__section">
        {categoriesData?.map((obj, index) => (
          <Categories key={obj?.offer?.length ? obj.offer : index} obj={obj} />
        ))}
      </section>
    </div>
  );
}
