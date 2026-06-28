import { useDispatch, useSelector } from "react-redux";
import {
  ADD_ITEM,
  REMOVE_ITEM,
  RESET_CART,
  STORE_DATA,
} from "../redux_/actions/action";
import { emptyCart, Loading } from "../assets/images";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateDoc, doc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "../utils/firebaseConfig";
import "./styles/cart.css";
import { useHandleImage } from "../utils/custom hooks";
import PropTypes from "prop-types";

const env = import.meta.env;
const arrayOfLengthTwenty = Array.from({ length: 20 }, (_, i) => i + 1);

const Item = ({ item }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state?.cartReducer);
  const cartItem = cart?.[item];
  const imgSrc = useHandleImage(cartItem?.img_link);

  return (
    <div className="cart__container">
      <div className="cart__image-wrapper">
        <img
          className={`${imgSrc ? "" : "fade-animation"}`}
          src={imgSrc ?? Loading}
          alt="product-image"
        />
      </div>
      <div className="cart__details">
        <Link
          className="search__productname cart__product-name"
          to={`/p?name=${cartItem?.product_name}`}
        >
          {cartItem?.product_name}
        </Link>
        <div className="cart__price">{cartItem?.discounted_price}</div>
        <div className="cart__modify">
          <div className="cart__select-div">
            <span>Qty:</span>
            <select
              value={cartItem?.quantity}
              onChange={(e) => {
                //modify in cloud db
                dispatch(
                  ADD_ITEM({
                    ...cartItem,
                    quantity: Number.parseInt(e?.target?.value),
                  }),
                );
              }}
            >
              {arrayOfLengthTwenty?.map((no) => (
                <option key={no} value={no}>
                  {no}
                </option>
              ))}
            </select>
          </div>
          <span className="cart__divider">|</span>
          <button
            className="cart__delete"
            onClick={() => {
              dispatch(REMOVE_ITEM(cartItem?.product_name));
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Cart() {
  const cart = useSelector((state) => state?.cartReducer);
  const cartKeys = Object.keys(cart);
  const doesCartHaveItems = cartKeys?.length > 0;
  const cartQuantity = cartKeys?.reduce(
    (sum, key) => sum + cart?.[key]?.quantity,
    0,
  );
  const cartPrice = cartKeys
    ?.reduce(
      (sum, key) =>
        sum +
        Number.parseFloat(
          cart?.[key]?.discounted_price?.replaceAll(",", "")?.replace("₹", ""),
        ) *
          cart?.[key]?.quantity,
      0,
    )
    ?.toLocaleString();
  const userPurchase = useSelector(
    (state) => state?.storeReducer?.userPurchase,
  );
  const [checkOut, setCheckOut] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleBuyClick = () => {
    if (auth?.currentUser) {
      //update userPurchase in redux
      dispatch(
        STORE_DATA({
          key: "userPurchase",
          value: {
            ...userPurchase,
            orders: {
              [String(new Date())]: cart,
              ...userPurchase?.orders,
            },
            cart: {},
          },
        }),
      );
      // update firestore
      updateDoc(doc(db, "users", auth?.currentUser?.uid), {
        cart: {},
        orders: { [String(new Date())]: cart, ...userPurchase?.orders },
      })
        .then(() => {})
        .catch((err) => {
          if (env.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [String(new Date())]: {
                ...err,
                moreDetails: "File:Cart Line:141 function:checkout updatedoc",
              },
            });
          } else console.log(err);
        });

      setCheckOut(true);
      // update cart data
      dispatch(RESET_CART());
    } else {
      dispatch(
        STORE_DATA({
          key: "historyData",
          value: "/cart",
        }),
      );
      navigate("/signin");
    }
  };
  if (checkOut)
    return (
      <p className="cart__checkout">
        <div>Thank you for shopping with us</div>
        <Link to="/orders" className="cart__checkout-link">
          Go to your orders
        </Link>
      </p>
    );
  const getEmptyCartBasedOnSignedStatus = () => {
    return auth?.currentUser ? (
      <div className="cart__signedin-empty">
        <span>Your Amazing Cart is empty.</span>
        <br />
        <Link to="/">Continue shopping</Link>
      </div>
    ) : (
      <div className="cart__empty">
        <div className="cart__empty-image">
          <img src={emptyCart} alt="empty-cart" />
        </div>
        <div className="cart__empty-content">
          <div className="cart__empty-title">Your Amazing Cart is empty</div>
          <Link className="cart__deals" to="/">
            Shop today's deals
          </Link>
          <div className="cart__empty-actions">
            <Link to="/signin" className="cart__signinup cart__signin">
              Sign in to your account
            </Link>
            <Link to="/signup" className="cart__signinup cart__signup">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="cart__page">
      <div className="cart__main">
        {doesCartHaveItems && (
          <div className="cart__heading">Shopping Cart</div>
        )}
        {doesCartHaveItems
          ? cartKeys.map((key) => <Item item={key} key={key} />)
          : getEmptyCartBasedOnSignedStatus()}
      </div>
      <div
        className={`cart__purchase ${doesCartHaveItems ? "cart__purchase--filled" : ""}`}
      >
        {doesCartHaveItems && (
          <>
            <div className="cart__subtotal">
              Subtotal ({cartQuantity} items):
              <span className="cart__subtotal-value">₹ {cartPrice}</span>
            </div>
            <button className="cart__buy" onClick={handleBuyClick}>
              Proceed to Buy
            </button>
          </>
        )}
      </div>
    </div>
  );
}

Item.propTypes = {
  item: PropTypes.string.isRequired,
};
