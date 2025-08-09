import { useEffect, useState } from "react";
import { logo2 } from "../assets/images";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { STORE_DATA } from "../redux_/actions/action";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import "./styles/signinup.css";

const env = import.meta.env;
const emailRegex = /^\S+@\S+\.\S+$/;

export default function SignInUp() {
  const [inputData, setInputData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [invalidCred, setInvalidCred] = useState(false);
  const historyData = useSelector((state) => state?.storeReducer?.historyData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const handleSubmit = (e) => {
    e?.preventDefault();
    setInvalidCred(false);
    if (pathname === "/signup")
      dispatch(
        STORE_DATA({
          key: "isSignUp",
          value: true,
        })
      );
    const fn =
      pathname === "/signin"
        ? signInWithEmailAndPassword
        : createUserWithEmailAndPassword;
    fn(auth, inputData?.email, inputData?.password)
      .then((resp) => {
        if (pathname === "/signup") {
          // const { proactiveRefresh={}, auth={}, ...remData} = resp.user
          // dispatch(STORE_DATA({
          //   key:"userData", value: remData
          // }))

          setDoc(doc(db, "users", resp?.user?.uid), {
            email: resp?.user?.email,
            cart: {},
            orders: {},
          })
            .then(() => {
              dispatch(
                STORE_DATA({
                  key: "userPurchase",
                  value: {
                    email: resp?.user?.email,
                    cart: {},
                    orders: {},
                  },
                })
              );
            })
            .catch((err) => {
              if (env?.MODE === "production") {
                addDoc(collection(db, "errors"), {
                  [Date()]: {
                    ...err,
                    moreDetails: "File:signin function: setDoc",
                  },
                });
              } else console.log(err);
            });
          updateProfile(auth?.currentUser, { displayName: inputData?.username })
            .then(() => {})
            .catch((err) => {
              if (env?.MODE === "production") {
                addDoc(collection(db, "errors"), {
                  [Date()]: {
                    ...err,
                    moreDetails: "File:signin Line:63 function:updateProfile",
                  },
                });
              } else console.log(err);
            });
        }
        setInputData((prevData) => ({
          ...prevData,
          email: "",
          password: "",
          username: "",
        }));
        navigate(historyData ?? "/");
      })
      .catch((err) => {
        if (pathname === "/signin") setInvalidCred(true);
        if (env?.MODE === "production") {
          addDoc(collection(db, "errors"), {
            [Date()]: {
              ...err,
              moreDetails: `File:signin function:${
                pathname === "/signin"
                  ? "signInWithEmailAndPassword"
                  : "createUserWithEmailAndPassword"
              }`,
            },
          });
        } else console.log(err);
      });
  };
  useEffect(() => {
    if (auth?.currentUser) navigate("/");
  }, []);

  return (
    <div className="signinup__container">
      <section>
        <img
          src={logo2}
          alt="logo"
          style={{ margin: "2% 0%", cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <form onSubmit={handleSubmit}>
          <p>Sign {pathname === "/signin" ? "in" : "up"}</p>

          {invalidCred && (
            <>
              <span style={{ fontSize: "15px" }}>Invalid Credentials</span>
              <br />
            </>
          )}
          {pathname === "/signup" && (
            <>
              <label htmlFor="username">Username </label>
              <br />
              <input
                value={inputData?.username}
                onChange={(e) =>
                  setInputData((prevData) => ({
                    ...prevData,
                    username: e?.target?.value,
                  }))
                }
                name="username"
              />
              {inputData?.username?.length > 0 &&
                inputData.username.length < 3 && (
                  <span>Username must be atleast 3 characters long</span>
                )}
              <br />
            </>
          )}

          <label htmlFor="email">Email </label>
          <br />
          <input
            value={inputData?.email}
            onChange={(e) =>
              setInputData((prevData) => ({
                ...prevData,
                email: e?.target?.value,
              }))
            }
            name="email"
          />
          {inputData?.email?.length > 0 &&
            (!emailRegex?.test(inputData?.email) ||
              inputData?.email?.length < 5) && (
              <span>Email must be valid and atleast 5 characters long</span>
            )}
          <br />
          <label htmlFor="password">Password </label>
          <br />
          <input
            value={inputData?.password}
            onChange={(e) =>
              setInputData((prevData) => ({
                ...prevData,
                password: e?.target?.value,
              }))
            }
            name="password"
            type="password"
          />
          {inputData?.password?.length > 0 &&
            inputData?.password?.length < 8 && (
              <span>Password must be atleast 8 characters long</span>
            )}
          <button
            type="submit"
            disabled={
              (pathname === "/signin" &&
                ((!emailRegex?.test(inputData?.email) &&
                  inputData?.email?.length < 5) ||
                  inputData?.password?.length < 8)) ||
              (pathname === "/signup" &&
                ((!emailRegex?.test(inputData?.email) &&
                  inputData?.email?.length < 5) ||
                  inputData?.password?.length < 8 ||
                  inputData?.username?.length < 3))
            }
          >
            Sign {pathname === "/signin" ? "in" : "up"}
          </button>
        </form>

        {pathname === "/signin" && (
          <div className="signinup__create-account">
            <hr />
            <span>New to Amazing?</span>
            <br />
            <button onClick={() => navigate("/signup")}>
              Create your Amazing account
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
