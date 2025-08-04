import { useEffect, useState } from "react";
import { loadImage } from "../apiCalls";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

const env = import.meta.env;

export default function useHandleImage(imgLink) {
  const [imgSrc, setImgSrc] = useState("");

  // Handle image load
  useEffect(() => {
    loadImage(imgLink)
      .then((resp) => setImgSrc(resp))
      .catch((err) => {
        if (env.MODE === "production") {
          addDoc(collection(db, "errors"), {
            [Date()]: {
              ...err,
              moreDetails: `File:hook Line:18 function:loadImage link:${imgLink}`,
            },
          });
        } else console.log(err);
      });
  }, []);
  return imgSrc;
}
