import { FaCocktail } from "react-icons/fa";
import SearchIcon from "@mui/icons-material/Search";
import ProfileIcon from "@mui/icons-material/AccountCircle";
import "./Header.scss";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

function Header({ handleSearchInput, onProfileClick }) {
   return (
      <header className="header-container">
         <div className="header-container__logo">
            <h1 className="header-container__logo--title">
               VanSippy
               <FaCocktail className="header-cocktail-icon" />
               <span> | Happy Hour Finder</span>
            </h1>
         </div>
         <div className="header-container__row">
            <Box
               noValidate
               autoComplete="off"
               component="form"
               sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
               }}
            >
               <TextField
                  sx={{
                     "& .MuiOutlinedInput-root": {
                        padding: "1.5rem 0.75rem 1.5rem",
                        maxHeight: "1rem",
                     },
                     "& .MuiInputLabel-root": {
                        fontSize: "0.8rem",
                     },
                     "& .MuiInputBase-input": {
                        fontSize: "0.85rem",
                     },
                  }}
                  label="Search for neighborhood or place"
                  variant="outlined"
                  color="primary"
                  onChange={handleSearchInput}
                  fullWidth
                  InputProps={{
                     endAdornment: (
                        <InputAdornment position="end">
                           <SearchIcon className="header-search-icon" />
                        </InputAdornment>
                     ),
                  }}
               />
            </Box>
            <ProfileIcon
               className="header-profile-icon"
               onClick={onProfileClick}
               titleAccess="User Profile"
            ></ProfileIcon>
         </div>
      </header>
   );
}

export default Header;
