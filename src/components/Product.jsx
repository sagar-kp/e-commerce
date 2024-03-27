import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getData, loadImage } from "../utils/apiCalls"
import "./styles/product.css"
import { useDispatch, useSelector } from "react-redux"
import { ADD_ITEM } from "../redux_/actions/action"
import { userImg } from "../assets/images"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../utils/firebaseConfig"

const env = import.meta.env

export default function Product(){
  const [searchParams] = useSearchParams()
  const [product, setProduct] = useState({})
  const [reviews, setReviews] = useState({})
  const [errorLoadingData, setErrorLoadingData] = useState(false)
  const dispatch = useDispatch()
  const cart = useSelector(state=> state.cartReducer)
  // const state = useSelector(state=> state.storeReducer)
  const [quantity, setQuantity] = useState(1)
  // console.log(product,cart, reviews)
  const [imgSrc, setImgSrc] = useState("")
  
  // Load product
  useEffect(()=>{
    const setReviewData = (data)=>{
      if (data.hasOwnProperty("review_content")){
        const testRegex = /\S,\S/g
        let review_content = data.review_content
        review_content.match(testRegex)?.forEach(str=>review_content = review_content.replace(str, `${str.charAt(0)}||||${str.charAt(2)}`))
        setReviews({
          reviewIds: data.review_id.split(","),
          reviewTitles: data.review_title.split(","),
          reviewContents: review_content.split("||||"),
          userNames: data.user_name.split(",")
        })
      } else{
        setReviews({})
      }
    }
    const productName = searchParams.get("name")
    if(cart.hasOwnProperty(productName)){
      // console.log("inside cart reducer")
      const data = cart[productName]
      setReviewData(data)
      setProduct(data)
      setQuantity(data.quantity)
    } else{
      getData(`products/search?product_name=${productName}`)
      .then(res=>{
        const data = res.data[0]
        // console.log(data)
        if (data){
          setReviewData(data)
          setProduct(data)
        } else {
          setErrorLoadingData(true)
        }
      })
      .catch(err=> {
        if(env.MODE==="production"){
          addDoc(collection(db, "errors"),{
            [Date()]:{...err, moreDetails:"File:product Line:64 function:getData (for product)"}
          })
        } else console.log(err)
      })
    }
  }, [])

  // Load image
  useEffect(()=>{
    if (product)
      loadImage(product.img_link)
      .then(resp=>setImgSrc(resp))
      .catch(err=> {
        if(env.MODE==="production"){
          addDoc(collection(db, "errors"),{
            [Date()]:{...err, moreDetails:`File:product Line:79 function:loadImage imgLink:${product.img_link}`}
          })
        } else console.log(err)
      })
  }, [product])
  
  return errorLoadingData?
  <div className="product__error">Some error occurred</div>:
  
  Object.keys(product).length===0?<></>:
  <>
    <section style={{display: "flex", marginTop:"3%"}}>
      <div style={{flex:"46%", margin: "0% 0% 0% 1.5%"}}>
        <img 
          src={imgSrc} alt = "product-image"
          style={{width: "100%"}}
        />
      </div>
      <div className="product__details">
        <h2>{product.product_name}</h2>
        <p className="search__rating">
          <span>
            {product.rating} {[1, 2, 3, 4, 5].map(num=>
              <i key={num} style={{color:"orange", fontSize:"16px"}} 
                className={`bi ${num<=product.rating?"bi-star-fill":(num>product.rating&&Math.ceil(product.rating)===num&&product.rating*10%10>=4)?'bi-star-half':'bi-star'} `}
              >
              </i>
            )}
          </span>
          <span className="search__rating-count product__rating-count" >{product.rating_count} ratings</span>
        </p>
        <p>
          <span style={{color:"rgb(204, 12, 57)", fontSize:"24px"}}>-{product.discount_percentage}</span> <span style={{fontSize:"26px"}}>{product.discounted_price}</span><br/>
          <span style={{fontSize:"11px", color:"gray"}}>M.R.P.: <span style={{textDecorationLine:"line-through"}}>{product.actual_price}</span></span>
        </p>
        <b>About this item</b>
        <ul style={{fontSize: "15px"}}>
          {product.about_product.split('|').map(str=><li style={{marginLeft:"-17px"}} key={str}>{str}</li>)}
        </ul>
        
      </div>
      <div className="product__action">
        <p style={{fontSize:"26px", marginTop:"10px"}}>{product.discounted_price}</p>
        <p>
          <span>Quantity</span> 
          <select value={quantity} onChange={(e)=>setQuantity(parseInt(e.target.value))}>
            {Array.from({length:20}, (_, i)=>i+1).map(no=><option key={no} value={no}>{no}</option>)}
          </select>
        </p>
        <button 
          onClick={()=>{
            dispatch(ADD_ITEM({...product, quantity}))
            // if (Object.keys(state.userData).length>0){
            //   const cartData = {...cart, [product.product_name]:{...product, quantity}}
            //   console.log(cartData)
            //   updateDoc(doc(db, "users", state.userData.uid),{
            //     cart: cartData
            //   })
            //   .then(resp=> console.log(resp))
            //   .catch(err=> console.log(err))
            // }
          }}
        >
          Add to Cart
        </button>

      </div>
    </section>
    {Object.keys(reviews).length>0&&<section style={{margin:"2% 2% 2% 32%"}}>
      <p style={{fontSize:"18px", fontWeight:"bold"}}>Top reviews</p>
      {reviews.reviewIds?.map((id, index)=><div key={id} style={{marginTop:"25px"}}>
        <p style={{fontSize:"small"}}>
          <img style={{margin:"0 10px -10px 0px", width:"30px"}} src={userImg} alt="user-image"/>{reviews.userNames[index]}
        </p>
        <p style={{fontSize:"15px", fontWeight:"bold"}}>{reviews.reviewTitles[index]}</p>
        <p style={{fontSize:"15px", marginTop:"-17px"}}>{reviews.reviewContents[index]}</p>
      </div>)}
    </section>}
  </>
}