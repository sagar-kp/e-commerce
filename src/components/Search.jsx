import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getData } from "../utils/apiCalls";
import "./styles/search.css";
import { useFilterResults, useHandleImage } from "../utils/custom hooks";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { Loading } from "../assets/images";
import Spinner from "./Spinner";
import PropTypes from "prop-types";

const env = import.meta.env;
const priceArr = [0, 1000, 5000, 10000, 20000, 20000];

const LeftIcon = () => (
  <svg
    className="search__left-icon"
    fill="#000000"
    height="11px"
    width="11px"
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

const SearchCard = ({ obj }) => {
  const imgSrc = useHandleImage(obj?.img_link);
  const getStarIconClass = (num) => {
    if (num < obj?.rating) return "bi-star-fill";
    if (
      num > obj?.rating &&
      Math.ceil(obj?.rating) === num &&
      (obj?.rating * 10) % 10 >= 4
    )
      return "bi-star-half";
    return "bi-star";
  };
  return (
    <div className="search__card-container">
      <div className="search__card-image-wrapper">
        <img
          className={`${imgSrc ? "" : "fade-animation"}`}
          src={imgSrc ?? Loading}
          alt="product_image"
        />
      </div>
      <div className="search__card-details">
        <Link
          className="search__productname mt-15"
          to={`/p?name=${obj?.product_name}`}
        >
          {obj?.product_name}
        </Link>
        <p className="search__rating">
          <span>
            {[1, 2, 3, 4, 5].map((num) => (
              <i
                key={num}
                className={`search__star bi ${getStarIconClass(num)} `}
              ></i>
            ))}
          </span>
          <span className="search__rating-count">{obj?.rating_count}</span>
        </p>
        <p className="search__price-row">
          <span className="search__discounted-price">
            {obj?.discounted_price}
          </span>
          <span className="search__mrp">
            M.R.P:{" "}
            <span className="search__mrp-strikethrough">
              {obj?.actual_price}
            </span>
          </span>
          <span className="search__discount-off">
            ({obj?.discount_percentage} off)
          </span>
        </p>
      </div>
    </div>
  );
};

const PriceComp = ({ selected, setSelected }) => {
  const [inputPrice, setInputPrice] = useState({ min: -1, max: -1 });
  const resetPriceClick = () => {
    setSelected((prev) => ({ ...prev, price: { min: -1, max: -1 } }));
    setInputPrice((prev) => ({ ...prev, min: -1, max: -1 }));
  };
  const filterPrice = (index, price) => {
    setInputPrice((prev) => ({ ...prev, min: -1, max: -1 }));
    setSelected((prev) => ({
      ...prev,
      price: {
        min: priceArr[index],
        max: index === priceArr.length - 2 ? 100000 : price,
      },
    }));
  };
  const handleChange = (e) =>
    setInputPrice((prevPrice) => ({
      ...prevPrice,
      [e?.target?.name]: Number.parseFloat(e?.target?.value),
    }));
  return (
    <>
      <p className="title">Price</p>
      {selected?.price?.min !== -1 && selected?.price?.max !== -1 && (
        <button className="button-options" onClick={resetPriceClick}>
          <LeftIcon />
          Any Price
        </button>
      )}
      {priceArr?.slice(1)?.map((price, index) => (
        <button
          className={`button-options ${priceArr[index] === selected?.price?.min ? "search__price-option--selected" : ""}`}
          key={price}
          onClick={() => filterPrice(index, price)}
        >
          {`
          ${(() => {
            if (index === 0) return "Under";
            if (index === priceArr?.length - 2) return "Over";
            return `₹${priceArr?.[index]?.toLocaleString()} -`;
          })()} 
          ₹${price?.toLocaleString()}
        `}
        </button>
      ))}
      <div className="search__price-controls">
        <input
          className="price__input"
          value={inputPrice?.min >= 0 && inputPrice?.min}
          placeholder="Min"
          type="number"
          name="min"
          onChange={handleChange}
        />
        <input
          className="price__input price__input--max"
          value={inputPrice?.max >= 0 && inputPrice?.max}
          placeholder="Max"
          type="number"
          name="max"
          onChange={handleChange}
        />
        <button
          className="price__button"
          onClick={() => {
            setSelected((selected) => ({
              ...selected,
              price: { ...inputPrice },
            }));
          }}
        >
          Go
        </button>
      </div>
    </>
  );
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [displayData, setDisplayData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState();

  const [selected, setSelected] = useFilterResults(
    searchResults,
    setDisplayData,
  );
  const categoriesQuery = searchParams.get("hidden-keywords");
  const query = searchParams.get("k");

  // set search results based on query strings
  useEffect(() => {
    setNoResult(false);
    setSearchResults(() => []);

    if (categoriesQuery) {
      setLoading(true);
      getData(
        `products/search?category=${categoriesQuery}&product_name=${categoriesQuery}`,
      )
        .then((resp) => {
          if (resp?.data?.length > 0) {
            setSearchResults((prevArr) => [...prevArr, ...(resp?.data ?? [])]);
          } else if (searchResults.length === 0) setNoResult(true);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          if (env?.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [String(new Date())]: {
                ...err,
                moreDetails: `File:search Line:146 function:getData categriesQuery:${categoriesQuery}`,
              },
            });
          } else console.log(err);
        });
    }
    if (query) {
      setLoading(true);
      getData(`products/search?category=${query}&product_name=${query}`)
        .then((resp) => {
          if (resp?.data?.length > 0) {
            setSearchResults((prevArr) => [...prevArr, ...(resp?.data ?? [])]);
          } else if (searchResults?.length === 0) setNoResult(true);
          setLoading(false);
        })
        .catch((err) => {
          if (env?.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [String(new Date())]: {
                ...err,
                moreDetails: `File:search function:getData query${query}`,
              },
            });
          } else console.log(err);
          setLoading(false);
        });
    }
  }, [query, categoriesQuery]);

  // set categories
  useEffect(() => {
    setDisplayData(searchResults);
    if (searchResults?.length > 0) {
      let tempSet = new Set();
      searchResults?.forEach((obj) =>
        obj?.category
          ?.split("|")
          ?.forEach((category) => tempSet?.add(category)),
      );
      setCategories([...tempSet]);
    } else if (searchResults?.length === 0) setCategories(() => []);
  }, [searchResults]);

  if (noResult || loading)
    return noResult ? (
      <div className="search__no-results">
        No results for{" "}
        {categoriesQuery
          ? categoriesQuery?.replaceAll(" | ", " or ")
          : query?.replaceAll(" | ", " or ")}
        <br />
        <span className="search__no-results-hint">
          Try checking your spelling or use more general terms
        </span>
      </div>
    ) : (
      <Spinner />
    );
  return (
    <div className="search__layout">
      <div className="search__filters">
        {searchResults?.length > 0 && (
          <>
            <p className="title">Customer Review</p>
            {selected?.rating !== -1 && (
              <button
                className="button-options search__clear-rating"
                onClick={() => setSelected((prev) => ({ ...prev, rating: -1 }))}
              >
                <LeftIcon />
                {` Clear`}
              </button>
            )}
            {[4, 3, 2, 1].map((no) => (
              <button
                key={no}
                className={`search__review-icon ${selected.rating === no ? "search__review-icon--selected" : ""}`}
                onClick={() => setSelected((prev) => ({ ...prev, rating: no }))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <i
                    key={num}
                    className={`search__star search__star--large bi ${num <= no ? "bi-star-fill" : "bi-star"} `}
                  ></i>
                ))}{" "}
                & Up
              </button>
            ))}
          </>
        )}
        {searchResults?.length > 0 && (
          <PriceComp selected={selected} setSelected={setSelected} />
        )}
        {categories?.length > 0 && <p className="title">Category</p>}
        {selected?.category?.length !== 0 && (
          <button
            className="button-options"
            onClick={() => setSelected((prev) => ({ ...prev, category: "" }))}
          >
            <LeftIcon />
            {` All Categories`}
          </button>
        )}
        {categories?.map((obj) => (
          <button
            className={`button-options ${obj === selected?.category ? "search__category-option--selected" : ""}`}
            key={obj}
            onClick={() => setSelected((prev) => ({ ...prev, category: obj }))}
          >
            {obj}
          </button>
        ))}
      </div>
      <div className="search__results-panel">
        {searchResults?.length > 0 && <h3>Results</h3>}
        {displayData?.map((obj) => (
          <SearchCard key={obj?.productId} obj={obj} />
        ))}
      </div>
    </div>
  );
}

SearchCard.propTypes = {
  obj: PropTypes.shape({
    img_link: PropTypes.string,
    product_name: PropTypes.string,
    rating: PropTypes.number,
    rating_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discounted_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    actual_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discount_percentage: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  }),
};

PriceComp.propTypes = {
  selected: PropTypes.shape({
    price: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    rating: PropTypes.number,
    category: PropTypes.string,
  }),
  setSelected: PropTypes.func.isRequired,
};
