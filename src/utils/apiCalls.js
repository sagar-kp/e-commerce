import axios from "axios";
import { ErrorImg } from "../assets/images";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getData = async (url) => {
  return await axios.get(`${BASE_URL}${url}`);
};

const loadImg = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      resolve(img.height < 5 ? ErrorImg : String(imageUrl));
    };
    img.onerror = () => {
      resolve(ErrorImg);
    };
  });
};

const loadImage = async (imgUrl) => await loadImg(imgUrl);

export { getData, loadImage };
