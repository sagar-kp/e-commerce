import axios from "axios";
import { carouselError, categoryError, ErrorImg } from "../assets/images";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getData = async (url) => {
  return await axios.get(`${BASE_URL}${url}`);
};

const loadImg = (imageUrl, imageType = "product") => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      resolve(img.height < 5 ? ErrorImg : String(imageUrl));
    };
    img.onerror = () => {
      resolve(
        imageType === "product"
          ? ErrorImg
          : imageType === "category"
          ? categoryError
          : carouselError
      );
    };
  });
};

const loadImage = async (imgUrl, imageType = "product") =>
  await loadImg(imgUrl, imageType);

export { getData, loadImage };
