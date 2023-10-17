import { useNavigate } from "react-router-dom"
import "./styles/categories.css"


export default function Categories({obj}){
  const navigate = useNavigate()
  return <div className="categories__card">
    <h3>{obj.offer}</h3>
    <div style={{display:"grid", gridTemplateColumns:`${"auto ".repeat(2)}`}}>
      {[1, 2, 3, 4].map(imgNo=><div key={imgNo}
        onClick={()=> navigate(`s?hidden-keywords=${obj[`img${imgNo}`][2].join("+%7C+")}`)}
      >
        <img src={obj[`img${imgNo}`][0]} style={{width:"9.5vw"}}/>
        <div className="categories__name">
          {obj[`img${imgNo}`][1]}
        </div>
      </div>  
      )}
    </div>
    <div className="categories__see-more"
      onClick={()=>{
        const categories = [1, 2, 3, 4].map(imgNo=>obj[`img${imgNo}`][2].join("+%7C+"))
        navigate(`s?hidden-keywords=${categories.join("+%7C+")}`)
        // console.log(categories.join("+|+"))
      }}
    >
      {obj.more}
    </div>
  </div>
}