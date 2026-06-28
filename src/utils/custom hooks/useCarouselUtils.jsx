import { useEffect } from "react";
import useCounter from "./useCounter";

export default function useCarouselUtils(carouselData) {
  // Returns different HTML elements involved in slide change
  const getHtmlElements = () => {
    const track = document.querySelector(".carousel__track");
    const slides = Array.from(track?.children);
    const currentSlide = track?.querySelector(".current-slide");
    return [track, slides, currentSlide];
  };

  // Adds/ Removes classname to/from an HTML element
  const addRemoveClasslist = (
    removeList,
    addList,
    className_ = "current-slide",
  ) => {
    removeList?.forEach((element) => element?.classList?.remove(className_));
    addList?.forEach((element) => element?.classList?.add(className_));
  };

  // Performs necessary slide change on accepting the direction
  const changeSlide = (buttonSide = "right") => {
    if (carouselData?.length > 1) {
      const [track, slides, currentSlide] = getHtmlElements();
      const getNextSlide = () => {
        if (buttonSide === "left") {
          if (currentSlide?.previousElementSibling)
            return currentSlide.previousElementSibling;
          else return slides?.[slides?.length - 1];
        } else if (currentSlide?.nextElementSibling)
          return currentSlide.nextElementSibling;
        return slides?.[0];
      };

      const nextSlide = getNextSlide();

      const amountToMove = nextSlide?.style?.left;
      track.style.transform = `translate(-${amountToMove})`;
      addRemoveClasslist([currentSlide], [nextSlide]);
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

  return [handleClick];
}
