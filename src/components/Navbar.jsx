import { Link, useLocation, useNavigate } from "react-router-dom";
import { logo } from "../assets/images";
import { useDispatch, useSelector } from "react-redux";
import "./styles/navbar.css";
import { useState, useEffect } from "react";
import { ADD_ITEM, STORE_DATA } from "../redux_/actions/action";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { useWindowDimensions } from "../utils/custom hooks";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";

const env = import.meta.env;

export default function Navbar() {
  const cart = useSelector((state) => state?.cartReducer);
  const isSignUp = useSelector((state) => state?.storeReducer?.isSignUp);
  const dispatch = useDispatch();
  const [ipFocus, setIpFocus] = useState(false);
  const [accountsHover, setAccountsHover] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname, search } = location;
  const windowDimensions = useWindowDimensions();

  const redirectApropriately = (link) => {
    if (auth?.currentUser) navigate(link);
    else {
      dispatch(
        STORE_DATA({
          key: "historyData",
          value: link,
        }),
      );
      navigate("/signin");
    }
  };
  const signInUpTasks = (link) => {
    dispatch(
      STORE_DATA({
        key: "historyData",
        value: pathname + (search?.length > 0 ? search : ""),
      }),
    );
    setAccountsHover(false);
    navigate(link);
  };
  const handleSignOutClick = () => {
    signOut(auth)
      .then(() => {
        dispatch(
          STORE_DATA({
            key: "userPurchase",
            value: {
              cart: {},
              orders: {},
            },
          }),
        );
        setAccountsHover(false);
        navigate("/signin");
      })
      .catch((err) => {
        if (env?.MODE === "production") {
          addDoc(collection(db, "errors"), {
            [String(new Date())]: {
              ...err,
              moreDetails: "File:navbar function:signOut",
            },
          });
        } else console.log(err);
      });
  };

  const getDisplayableValue = () => {
    if (!auth?.currentUser) return "sign in";
    if (auth?.currentUser?.displayName?.length > 0)
      return auth?.currentUser?.displayName;
    return auth?.currentUser?.email;
  };

  const performUserLogin = () => {
    getDoc(doc(db, "users", user?.uid))
      .then((resp) => {
        const data = resp?.data();
        const sortedOrders = Object.keys(data?.orders || {})
          .sort((a, b) => new Date(b) - new Date(a))
          .reduce((acc, key) => {
            acc[key] = data?.orders[key];
            return acc;
          }, {});
        dispatch(
          STORE_DATA({
            key: "userPurchase",
            value: { ...data, orders: sortedOrders },
          }),
        );

        for (let key of Object.keys(data?.cart)) {
          dispatch(ADD_ITEM(data?.cart?.[key]));
        }
      })
      .catch((err) => {
        if (env?.MODE === "production") {
          addDoc(collection(db, "errors"), {
            [String(new Date())]: {
              ...err,
              moreDetails: "File:navbar function:authstateChanged getDoc",
            },
          });
        } else console.log(err);
      });
  };

  const getItemsInCart = () => {
    if (Object.keys(cart)?.length > 0) {
      const itemsInCart = Object.keys(cart)?.reduce(
        (sum, key) => sum + cart?.[key]?.quantity,
        0,
      );
      return itemsInCart > 9 ? "9+" : itemsInCart;
    }
    return 0;
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (isSignUp)
        dispatch(
          STORE_DATA({
            key: "isSignUp",
            value: false,
          }),
        );
      else if (user) {
        performUserLogin();
      }
    });
  }, []);
  useEffect(() => {
    if (auth?.currentUser) {
      updateDoc(doc(db, "users", auth?.currentUser?.uid), {
        cart,
      })
        .then(() => {})
        .catch((err) => {
          if (env?.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [String(new Date())]: {
                ...err,
                moreDetails: "File:navbar function:updateDoc",
              },
            });
          } else console.log(err);
        });
    }
  }, [cart]);
  return pathname === "/signin" || pathname === "/signup" ? (
    <></>
  ) : (
    <header style={{ backgroundColor: "rgb(21, 21, 21)", display: "flex" }}>
      <nav style={{ flex: "10%" }}>
        <Link to="/">
          <img
            src={logo}
            alt="logo"
            style={{
              width: "125px",
              margin: "9px 10px 0px",
              cursor: "pointer",
            }}
          />
        </Link>
      </nav>

      <nav className="navbar__search">
        <input
          className="navbar__input"
          onFocus={() => setIpFocus(true)}
          onBlur={() => setIpFocus(false)}
          placeholder="Search Amazing-ecom"
          value={inputValue}
          onChange={(e) => setInputValue(e?.target?.value)}
        />
        <button
          className="navbar__search-icon"
          style={{ outline: ipFocus && "3.5px solid rgb(254, 190, 103)" }}
          onClick={() => {
            if (inputValue?.length > 0) navigate(`/s?k=${inputValue}`);
          }}
        >
          <i className="bi bi-search"></i>
        </button>
      </nav>
      <nav className="navbar__authenticate">
        <button
          className="navbar__accounts-lists"
          onMouseOver={() => setAccountsHover(true)}
          onFocus={() => setAccountsHover(true)}
          onMouseOut={() => setAccountsHover(false)}
          onBlur={() => setAccountsHover(false)}
        >
          <div>Hello, {getDisplayableValue()}</div>
          <div>
            <span>Accounts & Lists</span>
            <i className="bi bi-caret-down-fill"></i>
          </div>
        </button>
        {accountsHover && (
          <div
            onMouseOver={() => setAccountsHover(true)}
            onFocus={() => setAccountsHover(true)}
            onBlur={() => setAccountsHover(false)}
            onMouseOut={() => setAccountsHover(false)}
            className="navbar__hover"
            role="menu"
            tabIndex={0}
            style={{
              marginTop: auth?.currentUser ? "151px" : "190px",
              right: windowDimensions?.windowWidth > 1200 ? "220px" : "90",
            }}
          >
            {!auth?.currentUser && (
              <div style={{ textAlign: "center" }}>
                <button onClick={() => signInUpTasks("/signin")}>
                  Sign in
                </button>
                <div className="navbar__new-customer">
                  <span>New customer? </span>
                  <button onClick={() => signInUpTasks("/signup")}>
                    start here
                  </button>
                  <span>.</span>
                </div>
              </div>
            )}
            <div
              onMouseOver={() => setAccountsHover(true)}
              onFocus={() => setAccountsHover(true)}
              onBlur={() => setAccountsHover(false)}
              onMouseOut={() => setAccountsHover(false)}
              role="menu"
              tabIndex={0}
            >
              <div
                style={{
                  paddingLeft: "15px",
                  color: "white",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  Your account
                </div>
                <button
                  className="navbar__your-orders"
                  onClick={() => redirectApropriately("/orders")}
                >
                  Your orders
                </button>
                {auth?.currentUser && (
                  <button
                    className="navbar__signout"
                    onClick={handleSignOutClick}
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {windowDimensions?.windowWidth > 1200 && (
          <button
            className="navbar__returns-orders"
            onClick={() => redirectApropriately("/orders")}
          >
            <div>Returns</div>
            <div>& Orders</div>
          </button>
        )}
      </nav>
      <nav className="navbar__cart">
        <Link
          className="navbar__cart-number"
          to="/cart"
          style={{
            margin: `0px ${
              Object.keys(cart)?.reduce(
                (sum, key) => sum + cart?.[key]?.quantity,
                0,
              ) > 9
                ? "-31px"
                : "-27px"
            } 3px 0px`,
          }}
        >
          {getItemsInCart()}
        </Link>
        <Link to="/cart">
          <i className="bi bi-cart"></i>
        </Link>
        <Link className="navbar__cart-word" to="/cart">
          Cart
        </Link>
      </nav>
    </header>
  );
}
