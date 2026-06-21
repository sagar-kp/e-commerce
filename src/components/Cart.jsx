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

const Item = ({ item }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state?.cartReducer);
  const imgSrc = useHandleImage(cart?.[item]?.img_link);

  return (
    <div className="cart__container">
      <div style={{ flex: "20%" }}>
        <img
          className={`${imgSrc ? "" : "fade-animation"}`}
          src={imgSrc ?? Loading}
          alt="product-image"
        />
      </div>
      <div style={{ flex: "58%", paddingLeft: "2%" }}>
        <Link
          style={{ fontSize: "20px" }}
          className="search__productname"
          to={`/p?name=${cart?.[item]?.product_name}`}
        >
          {cart?.[item]?.product_name}
        </Link>
        <div
          style={{ marginTop: "10px", fontWeight: "bold", fontSize: "19px" }}
        >
          {cart?.[item]?.discounted_price}
        </div>
        <div className="cart__modify">
          <div className="cart__select-div">
            <span>Qty:</span>
            <select
              value={cart?.[item]?.quantity}
              onChange={(e) => {
                //modify in cloud db
                dispatch(
                  ADD_ITEM({
                    ...cart?.[item],
                    quantity: Number.parseInt(e?.target?.value),
                  }),
                );
              }}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1)?.map((no) => (
                <option key={no} value={no}>
                  {no}
                </option>
              ))}
            </select>
          </div>
          <span style={{ margin: "0px 10px" }}>|</span>
          <button
            className="cart__delete"
            onClick={() => {
              //modify in cloud db
              dispatch(REMOVE_ITEM(cart?.[item]?.product_name));
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
        <Link to="/orders" style={{ textDecorationLine: "none" }}>
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
        <div style={{ flex: "30%" }}>
          <img src={emptyCart} alt="empty-cart" />
        </div>
        <div style={{ flex: "66%", marginLeft: "4%" }}>
          <div style={{ fontSize: "22px", fontWeight: "bold" }}>
            Your Amazing Cart is empty
          </div>
          <Link className="cart__deals" to="/">
            Shop today's deals
          </Link>
          <div style={{ display: "flex", marginTop: "15px" }}>
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
    <div style={{ display: "flex", background: "rgb(235, 236, 238" }}>
      <div className="cart__main">
        {Object.keys(cart)?.length > 0 && (
          <div className="cart__heading">Shopping Cart</div>
        )}
        {Object.keys(cart)?.length > 0
          ? Object.keys(cart)?.map((key) => <Item item={key} key={key} />)
          : getEmptyCartBasedOnSignedStatus()}
      </div>
      <div
        className="cart__purchase"
        style={{
          backgroundColor: `${
            Object.keys(cart)?.length > 0 ? "white" : "transparent"
          }`,
        }}
      >
        {Object.keys(cart)?.length > 0 && (
          <>
            <div style={{ fontSize: "20px", marginTop: "20px" }}>
              Subtotal (
              {Object.keys(cart)?.reduce(
                (sum, key) => sum + cart?.[key]?.quantity,
                0,
              )}{" "}
              items):
              <span style={{ fontWeight: "bold" }}>
                ₹{" "}
                {Object.keys(cart)
                  ?.reduce(
                    (sum, key) =>
                      sum +
                      Number.parseFloat(
                        cart?.[key]?.discounted_price
                          ?.replaceAll(",", "")
                          ?.replace("₹", ""),
                      ) *
                        cart?.[key]?.quantity,
                    0,
                  )
                  ?.toLocaleString()}
              </span>
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
