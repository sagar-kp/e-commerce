import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { STORE_DATA } from "../../redux_/actions/action";
import { getData } from "../apiCalls";

export default function useInitialFetch(varName, endpt) {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.storeReducer[varName]);

  // fetch data
  useEffect(() => {
    if (data.length === 0)
      getData(endpt)
        .then((resp) => {
          console.log(resp);
          dispatch(
            STORE_DATA({
              key: varName,
              value: resp.data,
            })
          );
        })
        .catch((err) => {
          console.log(err);
        });
  }, []);

  return data;
}
