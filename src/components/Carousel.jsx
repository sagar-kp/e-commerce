import "./styles/carousel.css";
import { useNavigate } from "react-router-dom";
import { useInitialFetch, useCarouselUtils } from "../utils/custom hooks";

export default function Carousel() {
  const navigate = useNavigate();
  const carouselData = useInitialFetch("carouselData", "carousel");
  const [handleClick, handleDotsClick] = useCarouselUtils(carouselData);

  return (
    <section>
      <div className="carousel">
        <button
          className="carousel__button carousel__button--left"
          onClick={handleClick}
        >
          <svg
            style={{ transform: "rotate(180deg)", pointerEvents: "none" }}
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
          {/* <i className="bi bi-caret-left-fill"></i> */}
        </button>

        <div className="carousel__track-container">
          <ul className="carousel__track">
            {carouselData?.map((obj, index) => (
              <li
                key={index}
                onClick={() =>
                  navigate(`s?hidden-keywords=${obj?.keywords?.join("+%7C+")}`)
                }
                className={`carousel__slide ${
                  index === 0 ? "current-slide" : ""
                }`}
              >
                <img
                  src={obj?.img}
                  alt={`img${index + 1}`}
                  className="carousel__image"
                />
              </li>
            ))}
          </ul>
        </div>

        <button
          className="carousel__button carousel__button--right"
          onClick={handleClick}
        >
          <svg
            style={{ pointerEvents: "none" }}
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
          {/* <i className="bi bi-caret-right-fill"></i> */}
        </button>

        <div className="carousel__nav" style={{ display: "none" }}>
          {carouselData?.map((_, index) => (
            <button
              key={index}
              className={`carousel__indicator ${
                index === 0 ? "current-slide" : ""
              }`}
              onClick={() => handleDotsClick(index)}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
