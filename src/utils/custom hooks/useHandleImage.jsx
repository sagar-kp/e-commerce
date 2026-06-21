import { useEffect, useState } from "react";
import { loadImage } from "../apiCalls";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ErrorImg } from "../../assets/images";

const env = import.meta.env;

export default function useHandleImage(imgLink, imageType = "product") {
  const [imgSrc, setImgSrc] = useState(null);

  // Handle image load
  useEffect(() => {
    if (imgLink)
      loadImage(imgLink, imageType)
        .then((resp) => setImgSrc(resp))
        .catch((err) => {
          setImgSrc(ErrorImg);
          if (env?.MODE === "production") {
            addDoc(collection(db, "errors"), {
              [String(new Date())]: {
                ...err,
                moreDetails: `File:hook function:loadImage link:${imgLink}`,
              },
            });
          } else console.log(err);
        });
  }, [imgLink]);
  return imgSrc;
}
