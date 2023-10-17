const initialState = {
  carouselData:[],
  categoriesData: []
}

export const storeReducer = (state=initialState, action)=>{
  switch(action.type){
    case "STORE_DATA":
      return {...state, [action.payload.key]:action.payload.value}
    default:
      return state
  }
}