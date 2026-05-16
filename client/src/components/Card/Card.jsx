import "./Card.scss";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
   Card as MUICard,
   CardHeader,
   CardMedia,
   CardContent,
   CardActions,
   IconButton,
   Collapse,
   Typography,
   Avatar,
   Skeleton,
   Divider,
} from "@mui/material";
import { red, grey } from "@mui/material/colors";
import { FiGlobe, FiPhone } from "react-icons/fi";
import { IoBeerOutline } from "react-icons/io5";
import { TbBurger } from "react-icons/tb";
import OpenTime from "./OpenTime";
import DrinksMenu from "./DrinksMenu";
import FoodMenu from "./FoodMenu";
import PlaceHolder from "../../assets/images/placeholder.jpg";

const CARD_FONTS = {
   body: "var(--font-card)",
   heading: "var(--font-heading)",
};

function Card({
   title,
   address,
   time,
   contact_number,
   drinks,
   food,
   website,
   image,
   showSkeleton,
   onImageLoad,
   defaultExpandedDrinks = false,
   isSelected = false,
   autoExpandDrinks = false,
   hasUserSelected = false,
}) {
   const [expanded, setExpanded] = useState({
      drinks: defaultExpandedDrinks,
      food: false,
   });
   const [cardImage, setCardImage] = useState(image || PlaceHolder);
   const [imgLoaded, setImgLoaded] = useState(false);

   useEffect(() => {
      setCardImage(image || PlaceHolder);
      setImgLoaded(false);
   }, [image]);

   // Auto-expand drinks menu when card is selected (from map pin click)
   useEffect(() => {
      if (isSelected && autoExpandDrinks && drinks) {
         // Open drinks menu for selected card
         setExpanded({ drinks: true, food: false });
      } else if (!isSelected && hasUserSelected) {
         // Close menu if this card is not selected and user has made a selection
         setExpanded({ drinks: false, food: false });
      }
   }, [isSelected, autoExpandDrinks, drinks, hasUserSelected]);

   const handleImageLoad = () => {
      setImgLoaded(true);
      if (onImageLoad) onImageLoad();
   };

   // Toggle expand state
   const toggleExpand = (type) => {
      setExpanded((prev) => ({
         drinks: type === "drinks" ? !prev.drinks : false,
         food: type === "food" ? !prev.food : false,
      }));
   };

   // Helper function for dynamic icon color
   const getIconColor = useCallback(
      (isExpanded) => (isExpanded ? red[400] : grey[600]),
      [],
   );

   // Memoized avatar
   const avatar = useMemo(
      () => (
         <Avatar
            sx={{
               bgcolor: red[400],
               fontWeight: "700",
               fontSize: "1.2rem",
               fontFamily: CARD_FONTS.heading,
               width: "35px",
               height: "35px",
            }}
         >
            {title.charAt(0)}
         </Avatar>
      ),
      [title],
   );

   // Open Google Maps
   const openMaps = () => {
      if (address) {
         const encodedAddress = encodeURIComponent(address);
         window.open(
            `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
            "_blank",
         );
      } else {
         console.error("Address is not available");
      }
   };

   // Open full menu / website
   const openWebsite = () => {
      if (website) {
         const websiteUrl = website.startsWith("http")
            ? website
            : `https://${website}`;
         window.open(websiteUrl, "_blank", "noopener,noreferrer");
      } else {
         console.error("Website is not available");
      }
   };

   const stylesMap = {
      fontFamily: CARD_FONTS.body,
      fontSize: "0.8rem",
      fontWeight: "300",
      cursor: "pointer",
      transition: "color 0.3s ease",
      "&:hover": { color: "#ef5350" },
   };

   const iconSize = {
      fontSize: "1.35rem",
      strokeWidth: 1.75,
   };

   const actionIconButtonSx = {
      padding: "0.35rem",
   };

   const getMenuIconButtonSx = (isExpanded) => ({
      ...actionIconButtonSx,
      color: getIconColor(isExpanded),
      backgroundColor: isExpanded ? red[50] : "transparent",
      transition: "background-color 0.2s ease, color 0.2s ease",
      "&:hover": {
         backgroundColor: isExpanded ? red[50] : grey[100],
      },
   });

   if (showSkeleton) {
      return (
         <MUICard variant="outlined" className="restaurant-card__skeleton-card">
            <div className="restaurant-card__skeleton-header">
               <Skeleton
                  animation="wave"
                  variant="circular"
                  width={46}
                  height={46}
                  sx={{
                     width: 46,
                     height: 46,
                     minWidth: 46,
                     minHeight: 46,
                     flex: "0 0 46px",
                     borderRadius: "50%",
                     transform: "none",
                  }}
               />
               <div className="restaurant-card__skeleton-title-group">
                  <Skeleton
                     animation="wave"
                     variant="text"
                     width="58%"
                     height={30}
                  />
                  <Skeleton
                     animation="wave"
                     variant="text"
                     width="42%"
                     height={24}
                  />
               </div>
            </div>

            <Skeleton
               animation="wave"
               variant="rectangular"
               width="100%"
               height={150}
            />

            <CardContent className="restaurant-card__skeleton-content">
               <Skeleton
                  animation="wave"
                  variant="text"
                  width="45%"
                  height={28}
               />
               <Skeleton
                  animation="wave"
                  variant="text"
                  width="70%"
                  height={24}
               />
               <Skeleton
                  animation="wave"
                  variant="text"
                  width="52%"
                  height={24}
               />
            </CardContent>

            <Divider />

            <CardActions
               className="restaurant-card__skeleton-actions"
               disableSpacing
            >
               <Skeleton
                  animation="wave"
                  variant="circular"
                  width={34}
                  height={34}
                  sx={{
                     width: 34,
                     height: 34,
                     minWidth: 34,
                     minHeight: 34,
                     flex: "0 0 34px",
                     borderRadius: "50%",
                     transform: "none",
                  }}
               />
               <div className="restaurant-card__skeleton-menu-actions">
                  <Skeleton
                     animation="wave"
                     variant="text"
                     width={70}
                     height={28}
                  />
                  <Skeleton
                     animation="wave"
                     variant="circular"
                     width={34}
                     height={34}
                     sx={{
                        width: 34,
                        height: 34,
                        minWidth: 34,
                        minHeight: 34,
                        flex: "0 0 34px",
                        borderRadius: "50%",
                        transform: "none",
                     }}
                  />
                  <Skeleton
                     animation="wave"
                     variant="circular"
                     width={34}
                     height={34}
                     sx={{
                        width: 34,
                        height: 34,
                        minWidth: 34,
                        minHeight: 34,
                        flex: "0 0 34px",
                        borderRadius: "50%",
                        transform: "none",
                     }}
                  />
               </div>
            </CardActions>
         </MUICard>
      );
   }

   return (
      <MUICard
         variant="outlined"
         sx={{ backgroundColor: "#ffffff", overflow: "hidden" }}
      >
         {/* Header */}
         <CardHeader
            avatar={avatar}
            title={
               <Typography
                  sx={{
                     fontFamily: CARD_FONTS.heading,
                     fontSize: "0.9rem",
                     fontWeight: "400",
                  }}
               >
                  {title}
               </Typography>
            }
            subheader={
               <Typography
                  onClick={(event) => {
                     event.stopPropagation();
                     openMaps();
                  }}
                  sx={{ ...stylesMap }}
               >
                  {address}
               </Typography>
            }
         />
         {/* Media */}
         <div className="restaurant-card__media-wrapper">
            <CardMedia
               component="img"
               image={cardImage}
               alt={title}
               sx={{
                  aspectRatio: "16/9",
                  maxHeight: "150px",
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
               }}
               onLoad={handleImageLoad}
               onError={handleImageLoad}
               className={`restaurant-card__media-img ${showSkeleton || !imgLoaded ? "restaurant-card__media-img--hidden" : ""}`}
            />
            {!imgLoaded && (
               <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="100%"
                  height={150}
                  className="restaurant-card__media-skeleton"
               />
            )}
         </div>
         {/* Content */}
         <CardContent sx={{ backgroundColor: "#ffffff" }}>
            <Typography
               variant="body2"
               color="text.secondary"
               component="div"
               sx={{ fontFamily: CARD_FONTS.body, fontSize: "0.8rem" }}
            >
               {time ? <OpenTime time={time} /> : "No opening time available"}
            </Typography>
         </CardContent>
         <Divider />
         {/* Actions */}
         <CardActions
            disableSpacing
            sx={{
               display: "flex",
               justifyContent: "space-between",
               padding: "0.5rem 1rem",
               backgroundColor: "#ffffff",
            }}
         >
            {/* Menu Buttons */}
            <div className="restaurant-card__menu-actions">
               <IconButton
                  onClick={(event) => {
                     event.stopPropagation();
                     toggleExpand("drinks");
                  }}
                  aria-expanded={expanded.drinks}
                  aria-label="show drinks"
                  sx={getMenuIconButtonSx(expanded.drinks)}
               >
                  <IoBeerOutline style={iconSize} />
               </IconButton>
               <IconButton
                  onClick={(event) => {
                     event.stopPropagation();
                     toggleExpand("food");
                  }}
                  aria-expanded={expanded.food}
                  aria-label="show food"
                  sx={getMenuIconButtonSx(expanded.food)}
               >
                  <TbBurger style={iconSize} />
               </IconButton>
            </div>

            <div className="restaurant-card__quick-actions">
               {/* Call Button */}
               <IconButton
                  onClick={(event) => {
                     event.stopPropagation();
                     if (contact_number) {
                        window.location.href = `tel:${contact_number}`;
                     } else {
                        console.error("Contact number is not available");
                     }
                  }}
                  sx={{ ...actionIconButtonSx, color: grey[400] }}
                  aria-label="call business"
               >
                  <FiPhone style={iconSize} />
               </IconButton>

               {/* Full Menu / Website Button */}
               {website && (
                  <IconButton
                     onClick={(event) => {
                        event.stopPropagation();
                        openWebsite();
                     }}
                     sx={{ ...actionIconButtonSx, color: grey[400] }}
                     aria-label="open full menu"
                  >
                     <FiGlobe style={iconSize} />
                  </IconButton>
               )}
            </div>
         </CardActions>
         {/* Collapsible Menus */}
         <Collapse in={expanded.drinks} timeout="auto" unmountOnExit>
            <Divider />
            <CardContent sx={{ backgroundColor: "#ffffff" }}>
               <DrinksMenu drinks={drinks} website={website} />
            </CardContent>
         </Collapse>
         <Collapse in={expanded.food} timeout="auto" unmountOnExit>
            <Divider />
            <CardContent sx={{ backgroundColor: "#ffffff" }}>
               <FoodMenu food={food} website={website} />
            </CardContent>
         </Collapse>
      </MUICard>
   );
}

export default Card;
