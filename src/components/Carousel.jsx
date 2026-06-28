import "./styles/carousel.css";
import { Link } from "react-router-dom";
import {
  useInitialFetch,
  useCarouselUtils,
  useHandleImage,
} from "../utils/custom hooks";
import { LoadingCarousel } from "../assets/images";
import { placeholderCarouselData } from "../utils/placeholderData";
import PropTypes from "prop-types";

const CarouselImage = ({ src, alt }) => {
  const imgSrc = useHandleImage(src, "carousel");
  return (
    <img
      className={`carousel__image ${imgSrc ? "" : "fade-animation"}`}
      src={imgSrc ?? LoadingCarousel}
      alt={alt}
    />
  );
};

const arrow = (left = false) => (
  <svg
    className={`carousel__arrow ${left ? "carousel__arrow--left" : ""}`}
    fill="#000000"
    height="40px"
    width="40px"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 330 330"
    xmlSpace="preserve"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        id="XMLID_222_"
        d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z"
      ></path>
    </g>
  </svg>
);

export default function Carousel() {
  const { data } = useInitialFetch("carouselData", "carousel");
  const carouselData = data?.length ? data : placeholderCarouselData;
  const [handleClick] = useCarouselUtils(carouselData);

  return (
    <section>
      <div className="carousel">
        <button
          type="button"
          aria-label="Previous Carousel Image"
          className="carousel__button carousel__button--left"
          onClick={handleClick}
        >
          {arrow(true)}
        </button>

        <div className="carousel__track-container">
          <ul className="carousel__track">
            {carouselData?.map((obj, index) => (
              <li
                key={obj?.keywords?.join("+%7C+")}
                className={`carousel__slide ${
                  index === 0 ? "current-slide" : ""
                }`}
              >
                <Link to={`s?hidden-keywords=${obj?.keywords?.join("+%7C+")}`}>
                  <CarouselImage src={obj?.img} alt={`img${index + 1}`} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          aria-label="Next Carousel Image"
          className="carousel__button carousel__button--right"
          onClick={handleClick}
        >
          {arrow()}
        </button>
      </div>
    </section>
  );
}

CarouselImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
};
