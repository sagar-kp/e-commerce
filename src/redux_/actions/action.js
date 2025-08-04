export const STORE_DATA = (obj) => ({
  type: "STORE_DATA",
  payload: obj,
});

export const ADD_ITEM = (obj) => ({
  type: "ADD_ITEM",
  payload: obj,
});

export const REMOVE_ITEM = (productName) => ({
  type: "REMOVE_ITEM",
  payload: productName,
});

export const RESET_CART = () => ({
  type: "RESET_CART",
});
