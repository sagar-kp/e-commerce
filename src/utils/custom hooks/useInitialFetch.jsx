import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { STORE_DATA } from "../../redux_/actions/action";
import { getData } from "../apiCalls";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

const env = import.meta.env;

export default function useInitialFetch(varName, endpt) {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.storeReducer[varName]);

  // fetch data
  useEffect(() => {
    if (data.length === 0)
      getData(endpt)
        .then((resp) => {
          // console.log(resp)
          dispatch(
            STORE_DATA({
              key: varName,
              value: resp.data,
            })
          );
        })
        .catch((err) => {
          if (env.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [Date()]: {
                ...err,
                moreDetails: `File:hookInitialFetch Line:29 function:getData link:${endpt}`,
              },
            });
          } else console.log(err);
        });
  }, []);

  return data;
}
