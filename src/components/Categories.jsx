import { Link } from "react-router-dom";
import "./styles/categories.css";
import { LoadingCategory } from "../assets/images";
import { useHandleImage } from "../utils/custom hooks";
import PropTypes from "prop-types";

const CategoryImage = ({ src, alt }) => {
  const imgSrc = useHandleImage(src, "category");
  return (
    <img
      className={`${imgSrc ? "" : "fade-animation"}`}
      src={imgSrc ?? LoadingCategory}
      alt={alt ?? "image category"}
    />
  );
};

export default function Categories({ obj }) {
  const getSeeMoreLink = () => {
    const categories = [1, 2, 3, 4].map((imgNo) =>
      obj?.[`img${imgNo}`]?.[2]?.join("+%7C+"),
    );
    const keywords = categories?.join("+%7C+");
    if (keywords?.length) return `s?hidden-keywords=${keywords}`;
    return "/";
  };
  const getLink = (imgNo) => {
    const keywords = obj?.[`img${imgNo}`]?.[2]?.join("+%7C+");
    if (keywords?.length) {
      return `s?hidden-keywords=${keywords}`;
    }
    return "/";
  };
  return (
    <div className="categories__card">
      <h3 className="overflow-manager">{obj?.offer}</h3>
      <div>
        {[1, 2, 3, 4].map((imgNo) => (
          <Link key={imgNo} className="categories__link" to={getLink(imgNo)}>
            <CategoryImage
              src={obj?.[`img${imgNo}`]?.[0]}
              alt={obj?.[`img${imgNo}`]?.[1]}
            />
            <div className="categories__name overflow-manager">
              {obj?.[`img${imgNo}`]?.[1]}
            </div>
          </Link>
        ))}
      </div>
      <Link className="categories__see-more" to={getSeeMoreLink()}>
        {obj?.more}
      </Link>
    </div>
  );
}

CategoryImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};
Categories.propTypes = {
  obj: PropTypes.shape({
    offer: PropTypes.string,
    more: PropTypes.string,
    img1: PropTypes.arrayOf(PropTypes.any),
    img2: PropTypes.arrayOf(PropTypes.any),
    img3: PropTypes.arrayOf(PropTypes.any),
    img4: PropTypes.arrayOf(PropTypes.any),
  }),
};
