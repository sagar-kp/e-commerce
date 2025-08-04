import { useState, useEffect } from "react";

export default function useCounter(n, changeSlide) {
  const [counter, setCounter] = useState(0);

  // change slide after n seconds
  useEffect(() => {
    if (counter > n - 1 && counter % n === 0) changeSlide();
  }, [counter]);

  // increase counter every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval); // clear interval when component unmounts
  }, []);

  return [counter, setCounter];
}
