import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getData } from "../utils/apiCalls";
import "./styles/product.css";
import { useDispatch, useSelector } from "react-redux";
import { ADD_ITEM } from "../redux_/actions/action";
import { Loading, userImg } from "../assets/images";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useHandleImage } from "../utils/custom hooks";
import { placeholderProductsData } from "../utils/placeholderData";
import PropTypes from "prop-types";

const env = import.meta.env;

const ProductImage = ({ img_link }) => {
  const imgSrc = useHandleImage(img_link);
  return (
    <img
      className={`product__image ${imgSrc ? "" : "fade-animation"}`}
      src={imgSrc ?? Loading}
      alt="product-image"
    />
  );
};

export default function Product() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(placeholderProductsData[0]);
  const [reviews, setReviews] = useState({});
  const [errorLoadingData, setErrorLoadingData] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();
  const cart = useSelector((state) => state?.cartReducer);

  const getStarIconClassName = (num) => {
    if (num <= product?.rating) return "bi-star-fill";
    if (
      num > product?.rating &&
      Math.ceil(product?.rating) === num &&
      (product?.rating * 10) % 10 >= 4
    )
      return "bi-star-half";
    return "bi-star";
  };

  // Load product
  useEffect(() => {
    const setReviewData = (data) => {
      if (data?.hasOwnProperty("review_content")) {
        const testRegex = /\S,\S/g;
        let review_content = data?.review_content;
        review_content
          ?.match(testRegex)
          ?.forEach(
            (str) =>
              (review_content = review_content?.replace(
                str,
                `${str?.charAt(0)}||||${str?.charAt(2)}`,
              )),
          );
        setReviews({
          reviewIds: data?.review_id?.split(","),
          reviewTitles: data?.review_title?.split(","),
          reviewContents: review_content?.split("||||"),
          userNames: data?.user_name?.split(","),
        });
      } else {
        setReviews({});
      }
    };
    const productName = searchParams.get("name");
    if (cart.hasOwnProperty(productName)) {
      const data = cart?.[productName];
      setReviewData(data);
      setProduct(data);
      setQuantity(data?.quantity);
    } else {
      getData(`products/search?product_name=${productName}`)
        .then((res) => {
          const data = res?.data?.[0];
          if (data) {
            setReviewData(data);
            setProduct(data);
          } else {
            setErrorLoadingData(true);
          }
        })
        .catch((err) => {
          if (env?.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [String(new Date())]: {
                ...err,
                moreDetails:
                  "File:product Line:64 function:getData (for product)",
              },
            });
          } else console.log(err);
        });
    }
  }, []);

  return errorLoadingData ? (
    <div className="product__error">Some error occurred</div>
  ) : (
    <>
      <section className="product__section">
        <div className="product__image-wrapper">
          <ProductImage img_link={product?.img_link} />
        </div>
        <div className="product__details">
          <h2
            className={
              product?.product_name
                ? ""
                : "fade-animation product__name-placeholder"
            }
          >
            {product?.product_name}
          </h2>

          {product?.rating && (
            <p className="search__rating">
              {product?.rating && (
                <span>
                  {product.rating}{" "}
                  {[1, 2, 3, 4, 5].map((num) => (
                    <i
                      key={num}
                      className={`product__star bi ${getStarIconClassName(num)} `}
                    ></i>
                  ))}
                </span>
              )}
              <span className="search__rating-count product__rating-count">
                {product?.rating_count} ratings
              </span>
            </p>
          )}
          {product?.actual_price && (
            <p>
              <span className="product__discount">
                -{product?.discount_percentage}
              </span>{" "}
              <span className="product__price">
                {product?.discounted_price}
              </span>
              <br />
              <span className="product__mrp">
                M.R.P.:{" "}
                <span className="product__mrp-strikethrough">
                  {product?.actual_price}
                </span>
              </span>
            </p>
          )}
          {product?.about_product ? (
            <>
              <b>About this item</b>
              <ul className="product__about-list">
                {product?.about_product?.split("|")?.map((str) => (
                  <li className="product__about-item" key={str}>
                    {str}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="fade-animation product__about-placeholder">
              {""}
            </div>
          )}
        </div>
        <div className="product__action">
          <div>
            <p className="product__action-price">{product?.discounted_price}</p>
            {product?.product_name && (
              <>
                <p>
                  <span>Quantity</span>
                  <select
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number.parseInt(e?.target?.value))
                    }
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((no) => (
                      <option key={no} value={no}>
                        {no}
                      </option>
                    ))}
                  </select>
                </p>
                <button
                  onClick={() => {
                    dispatch(ADD_ITEM({ ...product, quantity }));
                  }}
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      {Object.keys(reviews)?.length > 0 && (
        <section className="product__reviews">
          <p className="product__reviews-title">Top reviews</p>
          {reviews?.reviewIds?.map((id, index) => (
            <div key={id} className="product__review-item">
              <p className="product__review-user">
                <img
                  className="product__review-user-image"
                  src={userImg}
                  alt="user-image"
                />
                {reviews?.userNames?.[index]}
              </p>
              <p className="product__review-title">
                {reviews?.reviewTitles?.[index]}
              </p>
              <p className="product__review-content">
                {reviews?.reviewContents?.[index]}
              </p>
            </div>
          ))}
        </section>
      )}
    </>
  );
}

ProductImage.propTypes = {
  img_link: PropTypes.string,
};
