import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import "./styles/orders.css";
import { useHandleImage } from "../utils/custom hooks";
import { auth } from "../utils/firebaseConfig";
import { Loading } from "../assets/images";
import Spinner from "./Spinner";
import PropTypes from "prop-types";

const Item = ({ productName, date }) => {
  const orders = useSelector(
    (state) => state?.storeReducer?.userPurchase?.orders,
  );
  const imgSrc = useHandleImage(orders?.[date]?.[productName]?.img_link);
  return (
    <div className="orders__item">
      <Link className="orders__item-image-link" to={`/p?name=${productName}`}>
        <img
          className={`orders__item-image ${imgSrc ? "" : "fade-animation"}`}
          src={imgSrc ?? Loading}
          alt="product"
        />
      </Link>
      {orders?.[date]?.[productName]?.quantity > 0 && (
        <div className="orders__quantity">
          {orders?.[date]?.[productName]?.quantity}
        </div>
      )}
      <Link
        className="overflow-manager search__productname orders__item-name"
        to={`/p?name=${productName}`}
      >
        {productName}
      </Link>
    </div>
  );
};

export default function Orders() {
  const orders = useSelector(
    (state) => state?.storeReducer?.userPurchase?.orders,
  );
  const orderKeys = orders ? Object.keys(orders) : [];
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const getTotal = (date) =>
    Object.keys(orders?.[date])
      ?.reduce((acc, productName) => {
        const obj = orders?.[date]?.[productName];
        return (
          acc +
          obj?.quantity *
            Number(obj?.discounted_price?.slice(1)?.replaceAll(",", ""))
        );
      }, 0)
      ?.toLocaleString();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      if (!auth?.currentUser) navigate("/signin");
      setLoading(false);
    }, 2000);
  }, []);
  if (loading) return <Spinner />;
  if (orders && orderKeys?.length === 0)
    return (
      <section className="orders__no-orders">
        No orders yet. <br />
        <Link to="/">Start shopping</Link>
      </section>
    );
  return (
    <section className="orders__page">
      <h1 className="orders__page-title">Your orders</h1>
      {orders &&
        orderKeys?.map((date) => (
          <div key={date} className="orders__container">
            <div className="orders__date-total">
              <div className="orders__meta">
                ORDER PLACED
                <br />
                {new Date(date)?.toDateString()?.slice(4)}
              </div>
              <div className="orders__meta-total">
                Total
                <br />₹ {getTotal(date)}
              </div>
            </div>
            <div className="orders__delivery-date">
              Delivered {new Date(date)?.toDateString()?.slice(4)}
            </div>
            {Object.keys(orders?.[date])?.map((productName) => (
              <Item key={productName} productName={productName} date={date} />
            ))}
          </div>
        ))}
    </section>
  );
}

Item.propTypes = {
  productName: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};
