import { useState, useEffect } from "react";

export default function useFilterResults(searchResults, setDisplayData) {
  const [selected, setSelected] = useState({
    category: "",
    price: { min: -1, max: -1 },
    rating: -1,
  });

  useEffect(() => {
    let tempDisplayArr = [...searchResults];
    const filterByPrice = (min, max) => {
      if (
        typeof min === "number" &&
        typeof max === "number" &&
        max >= 0 &&
        min >= 0
      ) {
        tempDisplayArr = tempDisplayArr?.filter((obj) => {
          let price = parseFloat(
            obj?.discounted_price?.split("₹")?.[1]?.replaceAll(",", "")
          );
          return price >= min && price < max;
        });
      }
    };

    const filterByRating = (min) => {
      if (typeof min === "number") {
        tempDisplayArr = tempDisplayArr?.filter((obj) => obj?.rating > min);
      }
    };

    const filterByCategory = (category) => {
      if (category?.length > 0) {
        tempDisplayArr = tempDisplayArr?.filter((obj) =>
          obj?.category?.includes(category)
        );
      }
    };

    if (
      selected?.category?.length !== 0 ||
      selected?.rating !== -1 ||
      (selected?.price?.min !== -1 && selected?.price?.max !== -1)
    ) {
      if (selected?.category?.length !== 0)
        filterByCategory(selected?.category);
      if (selected?.rating !== -1) filterByRating(selected?.rating);
      if (selected?.price?.min !== -1 && selected?.price?.max !== -1)
        filterByPrice(selected?.price?.min, selected?.price?.max);
      setDisplayData(tempDisplayArr);
    } else setDisplayData([...searchResults]);
  }, [selected]);

  return [selected, setSelected];
}
