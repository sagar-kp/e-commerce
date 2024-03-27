import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getData } from "../utils/apiCalls"
import "./styles/search.css"
import { useFilterResults, useHandleImage } from "../utils/custom hooks"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../utils/firebaseConfig"

const env = import.meta.env
const priceArr = [0, 1000, 5000, 10000, 20000, 20000]

const LeftIcon = ()=> <svg style={{transform:"rotate(180deg)", pointerEvents:"none",}} 
  fill="#000000" height="11px" width="11px" version="1.1" id="Layer_1" 
  xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
  viewBox="0 0 330 330" xmlSpace="preserve"
>
  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
  <g id="SVGRepo_iconCarrier"> 
    <path id="XMLID_222_" 
      d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z"
    >
    </path> 
  </g>
</svg>

const SearchCard = ({obj})=>{
  const navigate = useNavigate()

  const imgSrc = useHandleImage(obj.img_link)

  return <div className="search__card-container">
    <div style={{flex:"25%"}}>
      <img src={imgSrc} alt="product_image"/>
    </div>
    <div style={{paddingLeft:"10px", flex:"75%"}}>
      <p className="search__productname" 
        onClick={()=>navigate(`/p?name=${obj.product_name}`)}
      >
        {obj.product_name}
      </p>
      <p className="search__rating">
        <span>
          {[1, 2, 3, 4, 5].map(num=>
            <i key={num} style={{color:"orange", fontSize:"16px"}} 
              className={`bi ${num<obj.rating?"bi-star-fill":(num>obj.rating&&Math.ceil(obj.rating)===num&&obj.rating*10%10>=4)?'bi-star-half':'bi-star'} `}
            >
            </i>
          )}
        </span>
        <span className="search__rating-count" style={{color:"#004e93", fontSize:"15px", marginLeft:"5px"}}>{obj.rating_count}</span>
      </p>
      <p style={{marginTop: "-15px"}}>
        <span style={{fontSize:"28px"}}>{obj.discounted_price}</span>
        <span style={{fontSize:"14px", paddingLeft:"8px"}}>M.R.P: <span style={{textDecorationLine:"line-through"}}>{obj.actual_price}</span></span>
        <span style={{marginLeft:"8px"}}>({obj.discount_percentage} off)</span>
      </p>
    </div>
  </div>
}

const PriceComp = ({ selected, setSelected})=>{
  const [inputPrice, setInputPrice] = useState({min:-1, max:-1})
  
  return <>
    <p className="title">Price</p>
    {selected.price.min!==-1&& selected.price.max!==-1&&
      <p className="options"
        onClick={()=>{
          setSelected((prev)=>({...prev, price:{min:-1, max:-1  }}))
          setInputPrice(prev=>({...prev, min: -1, max: -1}))
        }}
      >
        <LeftIcon/>Any Price
      </p>
    }
    {priceArr.slice(1).map((price, index)=>
      <p className="options" key={index} 
        style={{ fontWeight:priceArr[index]===selected.price.min &&"bold"}} 
        onClick={()=>{
          setInputPrice(prev=>({...prev, min: -1, max: -1}))
          setSelected(prev=>({
            ...prev, price:{
              min:priceArr[index], max:index===priceArr.length-2?100000:price
            }
          }))
        }}
      >
        {`
          ${
            index===0?"Under":index===priceArr.length-2?"Over":`₹${priceArr[index].toLocaleString()} -`
          } 
          ₹${price.toLocaleString()}
        `}
      </p>
    )}
    <div style={{display:"flex"}}>
      <input className="price__input" value={inputPrice.min>=0&&inputPrice.min} placeholder="Min" type="number" 
        onChange={(e)=>setInputPrice(prevPrice=>({...prevPrice, min:parseFloat(e.target.value)}))} 
      /> 
      <input className="price__input" value={inputPrice.max>=0&&inputPrice.max} placeholder="Max" type="number"
        onChange={(e)=>setInputPrice(prevPrice=>({...prevPrice, max:parseFloat(e.target.value)}))} 
        style={{marginLeft:"3px"}}
      /> 
      <button className="price__button"
        onClick={()=>{
          setSelected(selected=>({...selected, price:{...inputPrice}}))
          // filterByPrice(inputPrice.min, inputPrice.max)
        }}
      >
        Go
      </button>
    </div>
  </>
}

export default function Search(){
  const [searchParams] = useSearchParams()
  const [searchResults, setSearchResults] = useState([])
  const [noResult, setNoResult] = useState(false)
  const [displayData, setDisplayData] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useFilterResults(searchResults, setDisplayData) 
  const categoriesQuery = searchParams.get("hidden-keywords")
  const query = searchParams.get('k') 
  // console.log(searchResults, noResult)
  // set search results based on query strings
  useEffect(()=>{
    
    setNoResult(false)
    setSearchResults(()=>[])
    // console.log(categoriesQuery)
    if (categoriesQuery)
      getData(`products/search?category=${categoriesQuery}&product_name=${categoriesQuery}`)
      .then(resp=>{
        // console.log(resp)
        if (resp.data.length>0){
          setSearchResults(prevArr=>[...prevArr, ...resp.data])
          
        }
        else if(searchResults.length===0) setNoResult(true)
      })
      .catch(err=> {
        if(env.MODE==="production"){
          addDoc(collection(db, "errors"),{
            [Date()]:{...err, moreDetails:`File:search Line:146 function:getData categriesQuery:${categoriesQuery}`}
          })
        } else console.log(err)
      })
    if (query)
      getData(`products/search?category=${query}&product_name=${query}`)
      .then(resp=>{
        // console.log(resp)
        if (resp.data.length>0){
          setSearchResults(prevArr=>[...prevArr, ...resp.data])
          
        }
        else if(searchResults.length===0) setNoResult(true)
      })
      .catch(err=> {
        if(env.MODE==="production"){
          addDoc(collection(db, "errors"),{
            [Date()]:{...err, moreDetails:`File:search Line:163 function:getData query${query}`}
          })
        } else console.log(err)
      })
  },[query, categoriesQuery])

  // set categories
  useEffect(()=>{
    setDisplayData(searchResults)
    if(searchResults.length>0){
      let tempSet = new Set()
      searchResults.forEach(obj=>obj.category.split("|").forEach(category=>tempSet.add(category)))
      // console.log(tempSet)
      setCategories([...tempSet])
    } else if (searchResults.length===0) setCategories(()=>[])
  },[searchResults])
  return noResult?
  <div style={{padding:"30px 20% 0px"}}>
    No results for {categoriesQuery?categoriesQuery.replaceAll(" | ", " or "):query.replaceAll(" | ", " or ")}<br/>
    <span style={{fontSize:"small"}}>Try checking your spelling or use more general terms</span>
  </div>
  :<div style={{display:"flex"}}>
    <div style={{flex:"20%", paddingLeft:"10px"}}>
      
      {searchResults.length>0&&<>
        <p className="title">Customer Review</p>
        {selected.rating!==-1&&<p className="options" style={{ margin:"-7px 0px 0px"}} 
          onClick={()=>setSelected(prev=>({...prev, rating:-1}))}
        >
          <LeftIcon/>{` Clear`}
        </p>}
        {[4, 3, 2, 1].map(no=>
          <div key={no} className="search__review-icon"
            style={{ fontWeight: selected.rating===no&&"bold"}} 
            onClick={()=>setSelected(prev=>({...prev, rating:no}))}
          >
            {[1, 2, 3, 4, 5].map(num=>
              <i key={num} style={{color:"orange", fontSize:"18px"}} className={`bi ${num<=no?"bi-star-fill":'bi-star'} `}></i>
            )} & Up
          </div>
        )}
      </>}
      {searchResults.length>0&& 
        <PriceComp selected={selected} setSelected={setSelected}/>
      }
      {categories.length>0&& <p className="title">Category</p>}
      {selected.category.length!==0&&
        <p className="options" 
          onClick={()=>setSelected(prev=>({...prev, category:""}))}
        >
          <LeftIcon/>{` All Categories`}
        </p>
      }
      {categories.map((obj)=>
        <p className="options" key={obj}
          style={{fontWeight: obj===selected.category&&"bold"}}
          onClick={()=> setSelected(prev=>({...prev, category:obj}))}
        >
          {obj}
        </p>
      )}     
    </div>
    <div style={{flex:"80%"}}>
      {searchResults.length>0&&<h3>Results</h3>}
      {displayData.map((obj, index)=><SearchCard key={index} obj={obj}/>)}
    </div>
  </div>
}