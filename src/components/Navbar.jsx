import { useLocation, useNavigate } from "react-router-dom";
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
  const cart = useSelector((state) => state.cartReducer);
  const state = useSelector((state) => state.storeReducer);
  const dispatch = useDispatch();
  const [ipFocus, setIpFocus] = useState(false);
  const [accountsHover, setAccountsHover] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname, search } = location;
  const windowDimensions = useWindowDimensions();
  // console.log(location,auth.currentUser)
  // console.log(cart)
  const redirectApropriately = (link) => {
    if (auth.currentUser) navigate(link);
    else {
      dispatch(
        STORE_DATA({
          key: "historyData",
          value: link,
        })
      );
      navigate("/signin");
    }
  };
  const signInUpTasks = (link) => {
    dispatch(
      STORE_DATA({
        key: "historyData",
        value: pathname + (search.length > 0 ? search : ""),
      })
    );
    setAccountsHover(false);
    navigate(link);
  };
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      // console.log(user)
      if (state.isSignUp)
        dispatch(
          STORE_DATA({
            key: "isSignUp",
            value: false,
          })
        );
      else if (user) {
        // const { proactiveRefresh={}, auth={}, ...remData} = user
        // // console.log(remData)
        // dispatch(STORE_DATA({
        //   key:"userData", value: remData
        // }))

        getDoc(doc(db, "users", user.uid))
          .then((resp) => {
            const data = resp.data();
            dispatch(
              STORE_DATA({
                key: "userPurchase",
                value: data,
              })
            );

            for (let key of Object.keys(data.cart)) {
              dispatch(ADD_ITEM(data.cart[key]));
            }
          })
          .catch((err) => {
            if (env.MODE === "production") {
              addDoc(collection(db, "errors"), {
                [Date()]: {
                  ...err,
                  moreDetails:
                    "File:navbar Line:70 function:authstateChanged getDoc",
                },
              });
            } else console.log(err);
          });
      }
    });
  }, []);
  useEffect(() => {
    if (auth.currentUser) {
      updateDoc(doc(db, "users", auth.currentUser.uid), {
        cart,
      })
        .then(() => {
          // console.log("updated", cart)
        })
        .catch((err) => {
          if (env.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [Date()]: {
                ...err,
                moreDetails: "File:navbar Line:88 function:updateDoc",
              },
            });
          } else console.log(err);
        });
    }
  }, [cart]);
  // console.log(Object.keys(cart).length>0?Object.keys(cart).reduce((a,b)=>cart[a].quantity+cart[b].quantity):0)
  return pathname === "/signin" || pathname === "/signup" ? (
    <></>
  ) : (
    <header style={{ backgroundColor: "black", display: "flex" }}>
      <nav style={{ flex: "10%" }}>
        <img
          src={logo}
          alt="logo"
          onClick={() => navigate("/")}
          style={{
            width: "100px",
            margin: "15px 15px 10px",
            cursor: "pointer",
          }}
        />
      </nav>

      <nav className="navbar__search">
        <input
          className="navbar__input"
          onFocus={() => setIpFocus(true)}
          onBlur={() => setIpFocus(false)}
          placeholder="Search Amazon.in"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div
          className="navbar__search-icon"
          style={{ outline: ipFocus && "3.5px solid rgb(254, 190, 103)" }}
          onClick={() => {
            if (inputValue.length > 0) navigate(`/s?k=${inputValue}`);
          }}
        >
          <i className="bi bi-search"></i>
        </div>
      </nav>
      <nav className="navbar__authenticate">
        <div
          style={{ color: "white", cursor: "pointer", height: "100%" }}
          onMouseOver={() => setAccountsHover(true)}
          onMouseOut={() => setAccountsHover(false)}
        >
          <div style={{ fontSize: "12px", marginBottom: "-3px" }}>
            Hello,{" "}
            {!auth.currentUser
              ? "sign in"
              : auth.currentUser?.displayName?.length > 0
              ? auth.currentUser.displayName
              : auth.currentUser?.email}
          </div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            Accounts & Lists
            <i
              style={{ fontSize: "8px", color: "lightgray", marginLeft: "3px" }}
              className="bi bi-caret-down-fill"
            ></i>
          </div>
        </div>
        {accountsHover && (
          <div
            onMouseOver={() => setAccountsHover(true)}
            onMouseOut={() => setAccountsHover(false)}
            className="navbar__hover"
            style={{
              marginTop: !auth.currentUser ? "190px" : "151px",
              right: windowDimensions.windowWidth > 1200 ? "220px" : "90",
            }}
          >
            {!auth.currentUser && (
              <div style={{ textAlign: "center" }}>
                <button onClick={() => signInUpTasks("/signin")}>
                  Sign in
                </button>
                <div style={{ fontSize: "x-small", margin: "5px 0px 20px" }}>
                  New customer?{" "}
                  <span onClick={() => signInUpTasks("/signup")}>
                    start here
                  </span>
                  .
                </div>
              </div>
            )}
            <div
              onMouseOver={() => setAccountsHover(true)}
              onMouseOut={() => setAccountsHover(false)}
              style={
                {
                  //display:"flex",
                }
              }
            >
              {/* <div style={{flex:"50%", marginLeft:"15px"}}>
              <div style={{fontSize:"15px", fontWeight:"bold"}}>Your Lists</div>
            </div> */}
              <div
                style={{
                  paddingLeft: "15px",
                  color: "white", //flex:"50%", borderLeft:"1px solid lightgray"
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
                <div
                  style={{
                    fontSize: "small",
                    marginTop: "7px",
                    cursor: "pointer",
                  }}
                  onClick={() => redirectApropriately("/orders")}
                >
                  Your orders
                </div>
                {/* <div style={{fontSize:"small", marginTop:"7px"}}>Your account</div> */}
                {auth.currentUser && (
                  <div
                    onClick={() => {
                      signOut(auth)
                        .then(() => {
                          dispatch(
                            STORE_DATA({
                              key: "userPurchase",
                              value: {},
                            })
                          );
                          setAccountsHover(false);
                          navigate("/signin");
                        })
                        .catch((err) => {
                          if (env.MODE === "production") {
                            addDoc(collection(db, "errors"), {
                              [Date()]: {
                                ...err,
                                moreDetails:
                                  "File:navbar Line:166 function:signOut",
                              },
                            });
                          } else console.log(err);
                        });
                      // dispatch(STORE_DATA({
                      //   key:"userData", value:{}
                      // }))
                    }}
                    style={{
                      fontSize: "small",
                      marginTop: "7px",
                      cursor: "pointer",
                    }}
                  >
                    Sign out
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {windowDimensions.windowWidth > 1200 && (
          <div
            style={{ color: "white", cursor: "pointer", height: "100%" }}
            onClick={() => redirectApropriately("/orders")}
          >
            <div style={{ fontSize: "12px", marginBottom: "-3px" }}>
              Returns
            </div>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>& Orders</div>
          </div>
        )}
      </nav>
      <nav className="navbar__cart">
        <div
          className="navbar__cart-number"
          onClick={() => navigate("/cart")}
          style={{
            margin: `0px ${
              Object.keys(cart).reduce(
                (sum, key) => sum + cart[key].quantity,
                0
              ) > 9
                ? "-31px"
                : "-27px"
            } 3px 0px`,
          }}
        >
          {Object.keys(cart).length > 0
            ? Object.keys(cart).reduce(
                (sum, key) => sum + cart[key].quantity,
                0
              ) > 9
              ? "9+"
              : Object.keys(cart).reduce(
                  (sum, key) => sum + cart[key].quantity,
                  0
                )
            : 0}
        </div>
        <i onClick={() => navigate("/cart")} className="bi bi-cart"></i>
        <div className="navbar__cart-word" onClick={() => navigate("/cart")}>
          Cart
        </div>
      </nav>
    </header>
  );
}
