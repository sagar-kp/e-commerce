import { useNavigate } from "react-router-dom";
import "./styles/categories.css";
import { LoadingCategory } from "../assets/images";
import { useHandleImage } from "../utils/custom hooks";

const CategoryImage = ({ src, alt }) => {
  const imgSrc = useHandleImage(src, "category");
  return (
    <img
      className={`${!imgSrc ? "fade-animation" : ""}`}
      src={imgSrc ?? LoadingCategory}
      alt={alt ?? "image category"}
      style={{ width: "99%" }}
    />
  );
};

export default function Categories({ obj }) {
  const navigate = useNavigate();
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
          <div
            key={imgNo}
            style={{
              margin: `0px ${imgNo % 2 === 0 ? "0px" : "5px"} 0px ${
                imgNo % 2 === 0 ? "5px" : "0px"
              }`,
            }}
            onClick={() =>
              navigate(
                `s?hidden-keywords=${obj?.[`img${imgNo}`]?.[2]?.join("+%7C+")}`
              )
            }
          >
            <CategoryImage
              src={obj?.[`img${imgNo}`]?.[0]}
              alt={obj?.[`img${imgNo}`]?.[1]}
            />

            <div className="categories__name overflow-manager">
              {obj?.[`img${imgNo}`]?.[1]}
            </div>
          </div>
        ))}
      </div>
      <div
        className="categories__see-more"
        onClick={() => {
          const categories = [1, 2, 3, 4].map((imgNo) =>
            obj?.[`img${imgNo}`]?.[2]?.join("+%7C+")
          );
          navigate(`s?hidden-keywords=${categories?.join("+%7C+")}`);
        }}
      >
        {obj?.more}
      </div>
    </div>
  );
}
