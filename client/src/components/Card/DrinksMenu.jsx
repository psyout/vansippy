import { FiChevronsRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const isGroupedMenuItem = (value) =>
   value && typeof value === "object" && !Array.isArray(value);

const renderMenuValue = (value) => {
   if (isGroupedMenuItem(value)) {
      return (
         <>
            {Array.isArray(value.items) && value.items.length > 0 && (
               <ul className="restaurant-card__menu--sublist">
                  {value.items.map((item) => (
                     <li key={item}>{item}</li>
                  ))}
               </ul>
            )}
            {value.price && (
               <span className="restaurant-card__menu--item-price">
                  : {value.price}
               </span>
            )}
         </>
      );
   }

   return <span className="restaurant-card__menu--item-price">: {value}</span>;
};

function DrinksMenu({ drinks, website }) {
   const drinksArray = drinks ? Object.entries(drinks) : [];

   return (
      <>
         <div className="restaurant-card__menu">
            <ul className="restaurant-card__menu--list-drinks">
               {drinksArray.map(([name, value]) => (
                  <li className="restaurant-card__menu--item-drinks" key={name}>
                     <span>
                        <strong className="restaurant-card__menu--item-name">
                           {name}
                        </strong>
                        {renderMenuValue(value)}
                     </span>
                  </li>
               ))}
            </ul>
            {website && (
               <Link
                  to={website}
                  target="blank"
                  className="restaurant-card__menu--item-website"
               >
                  See full menu here
                  <span>
                     <FiChevronsRight />
                  </span>
               </Link>
            )}
         </div>
      </>
   );
}

export default DrinksMenu;
