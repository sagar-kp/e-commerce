import { useEffect } from "react";
import useCounter from "./useCounter";

export default function useCarouselUtils(carouselData) {
  // Returns different HTML elements involved in slide change
  const getHtmlElements = () => {
    const track = document.querySelector(".carousel__track");
    const slides = Array.from(track?.children);
    const nav = document.querySelector(".carousel__nav");
    const navDots = Array.from(nav?.children);
    const currentSlide = track?.querySelector(".current-slide");
    const currentNavDot = nav?.querySelector(".current-slide");
    return [track, slides, navDots, currentSlide, currentNavDot];
  };

  // Adds/ Removes classname to/from an HTML element
  const addRemoveClasslist = (
    removeList,
    addList,
    className_ = "current-slide"
  ) => {
    removeList?.forEach((element) => element?.classList?.remove(className_));
    addList?.forEach((element) => element?.classList?.add(className_));
  };

  // Performs necessary slide change after dots are clicked
  const handleDotsClick = (index) => {
    if (carouselData?.length > 1) {
      const [track, slides, navDots, currentSlide, currentNavDot] =
        getHtmlElements();
      addRemoveClasslist(
        [currentSlide, currentNavDot],
        [slides[index], navDots[index]]
      );
      track.style.transform = `translate(-${slides[index].style.left})`;
    }
  };

  // Performs necessary slide change on accepting the direction
  const changeSlide = (buttonSide = "right") => {
    if (carouselData?.length > 1) {
      const [track, slides, navDots, currentSlide, currentNavDot] =
        getHtmlElements();
      const nextSlide =
        buttonSide === "left"
          ? currentSlide?.previousElementSibling
            ? currentSlide.previousElementSibling
            : slides?.[slides?.length - 1]
          : currentSlide?.nextElementSibling
          ? currentSlide.nextElementSibling
          : slides?.[0];
      // const currentNavDot = nav.querySelector(".current-slide")
      const nextNavDot =
        buttonSide === "left"
          ? currentNavDot?.previousElementSibling
            ? currentNavDot.previousElementSibling
            : navDots?.[navDots?.length - 1]
          : currentNavDot?.nextElementSibling
          ? currentNavDot.nextElementSibling
          : navDots?.[0];
      const amountToMove = nextSlide?.style?.left;
      track.style.transform = `translate(-${amountToMove})`;
      addRemoveClasslist(
        [currentSlide, currentNavDot],
        [nextSlide, nextNavDot]
      );
    }
  };

  const [counter, setCounter] = useCounter(10, changeSlide);

  // Handles logic of left/right button click
  const handleClick = (e) => {
    setCounter(0);
    const buttonSide = e?.target?.className?.includes("left")
      ? "left"
      : "right";
    changeSlide(buttonSide);
  };

  // set slide position
  useEffect(() => {
    const track = document.getElementsByClassName("carousel__track");
    const slides = Array.from(track?.[0]?.children);
    if (slides?.length > 0) {
      const slideWidth = slides?.[0]?.getBoundingClientRect()?.width;
      slides?.forEach((slide, index) => {
        slide.style.left = `${slideWidth * index}px`;
      });
    }
  }, [carouselData]);

  return [handleClick, handleDotsClick];
}
