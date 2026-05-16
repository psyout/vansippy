import { Link } from "react-router-dom";
import { FiChevronsRight } from "react-icons/fi";

const isGroupedMenuItem = (value) =>
   value && typeof value === "object" && !Array.isArray(value);

const renderMenuPrice = (value) => {
   if (isGroupedMenuItem(value)) {
      return value.price ? (
         <span className="restaurant-card__menu--item-price">
            : {value.price}
         </span>
      ) : null;
   }

   return <span className="restaurant-card__menu--item-price">: {value}</span>;
};

const renderMenuItems = (value) => {
   if (
      !isGroupedMenuItem(value) ||
      !Array.isArray(value.items) ||
      value.items.length === 0
   ) {
      return null;
   }

   return (
      <ul className="restaurant-card__menu--sublist">
         {value.items.map((item) => (
            <li key={item}>{item}</li>
         ))}
      </ul>
   );
};

function FoodMenu({ food, website }) {
   const foodArray = food ? Object.entries(food) : [];

   return (
      <>
         <div className="restaurant-card__menu">
            <ul className="restaurant-card__menu--list-food">
               {foodArray.map(([name, value]) => (
                  <li className="restaurant-card__menu--item-food" key={name}>
                     <span>
                        <strong className="restaurant-card__menu--item-name">
                           {name}
                        </strong>
                        {renderMenuPrice(value)}
                        {renderMenuItems(value)}
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

export default FoodMenu;
