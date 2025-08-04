import axios from "axios";
import { ErrorImg } from "../assets/images";

const BASE_URL = import.meta.env.VITE_BASE_URL;
// "https://assistant-api.netlify.app/.netlify/functions/api/"
// const BASE_URL = "https://myecommerce-api.netlify.app/.netlify/functions/api/"
// const BASE_URL = "http://localhost:8888/.netlify/functions/api/"

const getData = async (url) => {
  return await axios.get(`${BASE_URL}${url}`);
};

const loadImg = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // console.log(img.height, img.width)
      resolve(img.height < 5 ? ErrorImg : String(imageUrl));
    };
    img.onerror = (err) => {
      // console.log("img error");
      // console.error(err);
      resolve(ErrorImg);
    };
  });
};

const loadImage = async (imgUrl) => await loadImg(imgUrl);

export { getData, loadImage };
