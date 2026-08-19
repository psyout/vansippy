import { useEffect, useRef, useState } from 'react';
import { FaCocktail } from 'react-icons/fa';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import './Header.scss';

function SearchField({ className, search, handleSearchInput, onClearSearch, inputRef, inputTabIndex, onKeyDown, showSearchIcon = false }) {
	return (
		<Box
			className={className}
			noValidate
			autoComplete='off'
			component='form'
			onSubmit={(event) => event.preventDefault()}>
			<TextField
				inputRef={inputRef}
				sx={{
					'& .MuiOutlinedInput-root': {
						height: '40px',
						padding: '0 0.75rem',
						'& .MuiOutlinedInput-notchedOutline': {
							borderColor: 'rgba(43, 40, 64, 0.18)',
						},
						'&:hover .MuiOutlinedInput-notchedOutline': {
							borderColor: 'rgba(43, 40, 64, 0.18)',
						},
						'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
							borderColor: 'rgba(43, 40, 64, 0.18)',
							borderWidth: '1px',
						},
					},
					'& .MuiInputBase-input': {
						fontSize: '0.85rem',
						padding: '0.6rem 0',
					},
				}}
				placeholder='Search by place or neighbourhood'
				value={search}
				variant='outlined'
				onChange={handleSearchInput}
				onKeyDown={onKeyDown}
				fullWidth
				inputProps={{
					'aria-label': 'Search by place or neighbourhood',
					...(inputTabIndex === undefined ? {} : { tabIndex: inputTabIndex }),
				}}
				InputProps={{
					endAdornment: search || showSearchIcon ? (
						<InputAdornment position='end'>
							{search ? (
								<IconButton
									aria-label='Clear search'
									edge='end'
									onClick={onClearSearch}
									tabIndex={inputTabIndex}
									size='small'>
									<ClearIcon />
								</IconButton>
							) : (
								<SearchIcon className='header-search-icon' aria-hidden='true' />
							)}
						</InputAdornment>
					) : null,
				}}
			/>
		</Box>
	);
}

function Header({ search, handleSearchInput, onClearSearch }) {
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
	const mobileSearchInput = useRef(null);
	const mobileSearchButton = useRef(null);

	useEffect(() => {
		if (isMobileSearchOpen) mobileSearchInput.current?.focus();
	}, [isMobileSearchOpen]);

	return (
		<header className='header-container'>
			<div className='header-container__topbar'>
				<div className='header-container__logo'>
					<h1 className='header-container__logo--title'>
						VanSippy
						<FaCocktail className='header-cocktail-icon' />
						<span> | Happy Hour Finder</span>
					</h1>
				</div>

				<button
					ref={mobileSearchButton}
					type='button'
					className='header-mobile-search-button'
					onClick={() => setIsMobileSearchOpen((isOpen) => !isOpen)}
					aria-label={isMobileSearchOpen ? 'Hide search' : 'Show search'}
					aria-controls='mobile-search-panel'
					aria-expanded={isMobileSearchOpen}>
					<SearchIcon aria-hidden='true' />
				</button>
			</div>

			<div
				id='mobile-search-panel'
				className={`header-mobile-search-panel${isMobileSearchOpen ? ' is-open' : ''}`}
				aria-hidden={!isMobileSearchOpen}>
				<div className='header-mobile-search-panel__inner'>
					<SearchField
						className='header-search-form header-search-form--mobile'
						search={search}
						handleSearchInput={handleSearchInput}
						onClearSearch={onClearSearch}
						inputRef={mobileSearchInput}
						inputTabIndex={isMobileSearchOpen ? 0 : -1}
						onKeyDown={(event) => {
							if (event.key === 'Escape') {
								setIsMobileSearchOpen(false);
								mobileSearchButton.current?.focus();
							}
						}}
					/>
				</div>
			</div>

			<div className='header-container__row'>
				<SearchField
					className='header-search-form header-search-form--desktop'
					search={search}
					handleSearchInput={handleSearchInput}
					onClearSearch={onClearSearch}
					showSearchIcon
				/>
			</div>
		</header>
	);
}

export default Header;
