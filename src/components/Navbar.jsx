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

  const itemsInCart = Object.keys(cart)?.reduce(
    (sum, key) => sum + cart?.[key]?.quantity,
    0,
  );
  const isQuantityGreaterThanNine = itemsInCart > 9;

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

  let displayableValue;
  const currentUser = auth?.currentUser;
  if (!currentUser) displayableValue = "sign in";
  else if (currentUser?.displayName?.length > 0)
    displayableValue = currentUser?.displayName;
  else displayableValue = currentUser?.email;

  const performUserLogin = (user) => {
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
      return isQuantityGreaterThanNine ? "9+" : itemsInCart;
    }
    return 0;
  };
  useEffect(() => {
    const header = document.querySelector("header");
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`,
    );
  }, []);

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
        performUserLogin(user);
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
    <header>
      <nav>
        <Link to="/">
          <img src={logo} alt="logo" />
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
          className={`navbar__search-icon ${ipFocus ? "navbar__search-icon--focused" : ""}`}
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
          <div>Hello, {displayableValue}</div>
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
            className={`navbar__hover ${auth?.currentUser ? "navbar__hover--logged-in" : "navbar__hover--guest"}`}
            role="menu"
            tabIndex={0}
          >
            {!auth?.currentUser && (
              <div className="navbar__account-menu-signin">
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
              <div className="navbar__account-menu-content">
                <div className="navbar__account-menu-title">Your account</div>
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
          className={`navbar__cart-number ${isQuantityGreaterThanNine ? "navbar__cart-number--many-items" : ""}`}
          to="/cart"
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
