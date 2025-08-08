import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import "./styles/orders.css";
import { useHandleImage } from "../utils/custom hooks";
import { auth } from "../utils/firebaseConfig";

const Item = ({ productName, date }) => {
  const state = useSelector((state) => state?.storeReducer);
  const navigate = useNavigate();
  const imgSrc = useHandleImage(
    state?.userPurchase?.orders?.[date]?.[productName]?.img_link
  );
  return (
    <div style={{ display: "flex", margin: "0% 25% 0% 3%" }}>
      <div
        style={{ flex: "5%" }}
        onClick={() => navigate(`/p?name=${productName}`)}
      >
        <img
          src={imgSrc}
          alt="product image"
          style={{ width: "70%", cursor: "pointer" }}
        />
      </div>
      {state?.userPurchase?.orders?.[date]?.[productName]?.quantity > 0 && (
        <div className="orders__quantity">
          {state?.userPurchase?.orders?.[date]?.[productName]?.quantity}
        </div>
      )}
      <div
        className="overflow-manager search__productname"
        style={{ flex: "75%", fontSize: "small" }}
        onClick={() => navigate(`/p?name=${productName}`)}
      >
        {productName}
      </div>
    </div>
  );
};

export default function Orders() {
  const state = useSelector((state) => state?.storeReducer);
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth?.currentUser) navigate("/signin");
  }, []);
  return state?.userPurchase?.orders &&
    Object.keys(state?.userPurchase?.orders)?.length === 0 ? (
    <section className="orders__no-orders">
      No orders yet. <br />
      <Link to="/">Start shopping</Link>
    </section>
  ) : (
    <section style={{ margin: "3% 15% 0%" }}>
      <p style={{ fontSize: "xx-large", marginBottom: "20px" }}>Your orders</p>
      {state?.userPurchase?.orders &&
        Object.keys(state?.userPurchase?.orders)?.map((date) => (
          <div key={date} className="orders__container">
            <div className="orders__date-total">
              <div style={{ flex: "5%" }}>
                ORDER PLACED
                <br />
                {new Date(date)?.toDateString()?.slice(4)}
              </div>
              <div style={{ flex: "60%" }}>
                Total
                <br />₹{" "}
                {Object.keys(state?.userPurchase?.orders?.[date])
                  ?.reduce((acc, productName) => {
                    const obj =
                      state?.userPurchase?.orders?.[date]?.[productName];
                    return (acc +=
                      obj?.quantity *
                      Number(
                        obj?.discounted_price?.slice(1)?.replaceAll(",", "")
                      ));
                  }, 0)
                  ?.toLocaleString()}
              </div>
            </div>
            <div className="orders__delivery-date">
              Delivered {new Date(date)?.toDateString()?.slice(4)}
            </div>
            {Object.keys(state?.userPurchase?.orders?.[date])?.map(
              (productName) => (
                // Card component
                <Item key={productName} productName={productName} date={date} />
              )
            )}
          </div>
        ))}
    </section>
  );
}
