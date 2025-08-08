import * as actionTypes from "../actionTypes";

export const STORE_DATA = (obj) => ({
  type: actionTypes.STORE_DATA,
  payload: obj,
});

export const ADD_ITEM = (obj) => ({
  type: actionTypes.ADD_ITEM,
  payload: obj,
});

export const REMOVE_ITEM = (productName) => ({
  type: actionTypes.REMOVE_ITEM,
  payload: productName,
});

export const RESET_CART = () => ({
  type: actionTypes.RESET_CART,
});
