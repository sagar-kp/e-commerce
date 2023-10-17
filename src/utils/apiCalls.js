import axios from "axios"

const BASE_URL = "https://assistant-api.netlify.app/.netlify/functions/api/"
// const BASE_URL = "http://localhost:8888/.netlify/functions/api/"

const getData = async (url)=>{
  return await axios.get(`${BASE_URL}${url}`)
}


export {getData};