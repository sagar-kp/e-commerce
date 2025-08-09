import { useEffect, useState } from "react";
import { loadImage } from "../apiCalls";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ErrorImg, Loading } from "../../assets/images";

const env = import.meta.env;

export default function useHandleImage(imgLink, imageType = "product") {
  const [imgSrc, setImgSrc] = useState();

  // Handle image load
  useEffect(() => {
    loadImage(imgLink, imageType)
      .then((resp) => setImgSrc(resp))
      .catch((err) => {
        setImgSrc(ErrorImg);
        if (env?.MODE === "production") {
          addDoc(collection(db, "errors"), {
            [Date()]: {
              ...err,
              moreDetails: `File:hook function:loadImage link:${imgLink}`,
            },
          });
        } else console.log(err);
      });
  }, []);
  return imgSrc;
}
