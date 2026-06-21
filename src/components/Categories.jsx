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
      style={{ width: "99%" }}
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
      <h3 style={{ height: "55px" }} className="overflow-manager">
        {obj?.offer}
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))", //`${"auto ".repeat(2)}`
        }}
      >
        {[1, 2, 3, 4].map((imgNo) => (
          <Link
            key={imgNo}
            className="categories__link"
            style={{
              margin: `0px ${imgNo % 2 === 0 ? "0px" : "5px"} 0px ${
                imgNo % 2 === 0 ? "5px" : "0px"
              }`,
            }}
            to={getLink(imgNo)}
          >
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
