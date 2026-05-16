import './Main.scss';

function Main({ mapContainer }) {
	return (
		<div className='main'>
			<div
				className='map'
				ref={mapContainer}></div>
		</div>
	);
}

export default Main;
