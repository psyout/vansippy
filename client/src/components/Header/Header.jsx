import { FaCocktail } from "react-icons/fa";
import SearchIcon from "@mui/icons-material/Search";
import ProfileIcon from "@mui/icons-material/AccountCircle";
import "./Header.scss";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

function Header({ search, handleSearchInput, onClearSearch, onProfileClick }) {
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
               onSubmit={(event) => event.preventDefault()}
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
                  value={search}
                  variant="outlined"
                  color="primary"
                  onChange={handleSearchInput}
                  fullWidth
                  InputProps={{
                     endAdornment: (
                        <InputAdornment position="end">
                           {search ? (
                              <IconButton
                                 aria-label="Clear search"
                                 edge="end"
                                 onClick={onClearSearch}
                                 size="small"
                              >
                                 <ClearIcon />
                              </IconButton>
                           ) : (
                              <SearchIcon className="header-search-icon" />
                           )}
                        </InputAdornment>
                     ),
                  }}
               />
            </Box>
            <button
               type="button"
               className="header-profile-button"
               onClick={onProfileClick}
               aria-label="Open admin sign in"
            >
               <ProfileIcon className="header-profile-icon" aria-hidden="true" />
            </button>
         </div>
      </header>
   );
}

export default Header;
