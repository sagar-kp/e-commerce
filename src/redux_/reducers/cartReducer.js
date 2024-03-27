const initialState = {}

export const cartReducer = (state=initialState, action)=>{
  switch(action.type){
    case "ADD_ITEM":
      return {...state, [action.payload.product_name]:action.payload}
    case "REMOVE_ITEM":
      const tempState = {...state}
      delete tempState[action.payload]
      return tempState//{...state, [action.payload.obj.product_name]:action.payload.obj}
    case "RESET_CART":
      return {}
    default:
      return state
  }
}