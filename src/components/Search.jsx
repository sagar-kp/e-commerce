import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getData } from "../utils/apiCalls"
import "./styles/search.css"

const priceArr = [0, 1000, 5000, 10000, 20000, 20000]

const SearchCard = ({obj})=>
<div style={{display: "flex", border:"0.01px solid lightgrey", margin:"5px 5px 0 0", borderRadius:"5px", overflow:"hidden"
  }}
>
  <img src={obj.img_link}
    style={{width:"25%"}}
  />
  <div style={{paddingLeft:"10px"}}>
    <p className="search__productname">{obj.product_name}</p>
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
        {"< "}Any Price
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
  const [displayData, setDisplayData] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState({category:"", price:{min:-1, max:-1}, rating:""})
  console.log(searchResults.length, searchResults)
  console.log(displayData, selected)
  
  useEffect(()=>{
    let tempDisplayArr = [...searchResults]
    const filterByPrice=(min, max)=>{
      if (typeof min==="number" && typeof max==="number" && max>=0 && min>=0 ){    
        tempDisplayArr = tempDisplayArr.filter(obj=>{
          let price = parseFloat(obj.discounted_price.split('₹')[1])
          return price>=min && price<max
        })
      }
    }
  
    const filterByRating=(min)=>{
      if (typeof min==="number"){
        tempDisplayArr = tempDisplayArr.filter(obj=> obj.rating>min)
      }

    }
  
    const filterByCategory=(category)=>{
      console.log(category)
      if (category.length>0){ 
        tempDisplayArr = tempDisplayArr.filter(obj=>obj.category.includes(category)) 
      }
    }
    // console.log("selected triggered")
    
    if (selected.category.length!==0||selected.rating.length!==0||(selected.price.min!==-1 && selected.price.max!==-1)){
      if (selected.category.length!==0) filterByCategory(selected.category)
      if (selected.rating.length!==0) filterByRating(selected.rating)
      if (selected.price.min!==-1 && selected.price.max!==-1) filterByPrice(selected.price.min, selected.price.max)
      setDisplayData(tempDisplayArr)
    } else setDisplayData([...searchParams])
  },[selected])
  // set search results based on query strings
  useEffect(()=>{
    const categoriesQuery = searchParams.get("hidden-keywords")
    const query = searchParams.get('k')
    console.log(categoriesQuery)
    getData(`products/search?category=${categoriesQuery}&product_name=${categoriesQuery}`)
    .then(res=>{
      console.log(res)
      setSearchResults(prevArr=>[...prevArr].concat(res.data))
      
    })
    .catch(err=>{
      console.log(err)
    })
  },[])

  // set categories
  useEffect(()=>{
    setDisplayData(searchResults)
    if(searchResults.length>0){
      let tempSet = new Set()
      searchResults.forEach(obj=>obj.category.split("|").forEach(category=>tempSet.add(category)))
      // console.log(tempSet)
      setCategories([...tempSet])
    }
  },[searchResults])
  return <section style={{display:"flex"}}>
    <div style={{flex:"20%", paddingLeft:"10px"}}>
      
      {searchResults.length>0&&<>
        <p className="title">Customer Review</p>
        {/* Implement clear with text All Reviews */}
        {[4, 3, 2, 1].map(no=>
          <div key={no} style={{fontSize:"14px", fontWeight: selected.rating===no&&"bold"}} 
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
  </section>
}