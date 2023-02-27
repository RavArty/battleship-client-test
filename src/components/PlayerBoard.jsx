import React from "react";
import { updateSunkShips, SQUARE_STATE, stateToClass, generateEmptyLayout, putEntityInLayout, indexToCoords, calculateOverhang, canBePlaced } from "./layoutHelpers";

export const PlayerBoard = ({
	myTurn,
	turn,
	player,
	playerNumber,
	opponent,
	currentlyPlacing,
	setCurrentlyPlacing,
	rotateShip,
	placeShip,
	placedShips,
	hitsByComputer,
	playSound,
	gameState,
	checkIfGameOver,
	setHitsByComputer,
	setPlacedShips,
	changeTurn,
}) => {
	// Player ships on empty layout
	let layout = placedShips.reduce((prevLayout, currentShip) => putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship), generateEmptyLayout());
	//console.log({ layout });

	// Hits by computer
	layout = hitsByComputer.reduce((prevLayout, currentHit) => putEntityInLayout(prevLayout, currentHit, currentHit.type), layout);

	layout = placedShips.reduce((prevLayout, currentShip) => (currentShip.sunk ? putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship_sunk) : prevLayout), layout);

	const isPlacingOverBoard = currentlyPlacing && currentlyPlacing.position != null;
	const canPlaceCurrentShip = isPlacingOverBoard && canBePlaced(currentlyPlacing, layout);

	if (isPlacingOverBoard) {
		if (canPlaceCurrentShip) {
			layout = putEntityInLayout(layout, currentlyPlacing, SQUARE_STATE.ship);
		} else {
			let forbiddenShip = {
				...currentlyPlacing,
				length: currentlyPlacing.length - calculateOverhang(currentlyPlacing),
			};
			layout = putEntityInLayout(layout, forbiddenShip, SQUARE_STATE.forbidden);
		}
	}

	// Check what's at the square and decide what next
	const fireTorpedo = (index) => {
		if (layout[index] === "ship") {
			const newHits = [
				...hitsByComputer,
				{
					position: indexToCoords(index),
					type: SQUARE_STATE.hit,
				},
			];
			//setHitsByComputer(newHits);
			return newHits;
		}
		if (layout[index] === "empty") {
			const newHits = [
				...hitsByComputer,
				{
					position: indexToCoords(index),
					type: SQUARE_STATE.miss,
				},
			];
			//	setHitsByComputer(newHits);

			// console.log({ newHits });
			return newHits;
		}
	};

	//const playerTurn = gameState === "game" && ((player === 2 && turn === "player") || (player === 1 && turn === "computer"));
	//console.log("playerTurn: ", player, playerTurn);
	//const playerCanFire = playerTurn && !checkIfGameOver();
	//const playerCanFire = playerTurn;
	const playerCanFire = myTurn && player === opponent;
	// && !checkIfGameOver();
	//	console.log(player, playerCanFire);

	let alreadyHit = (index) => layout[index] === "hit" || layout[index] === "miss" || layout[index] === "ship-sunk";

	// console.log("compare: ", player, opponent, player === opponent);
	let squares = layout.map((square, index) => {
		return (
			<div
				onMouseDown={rotateShip}
				onClick={() => {
					if (gameState === "placement") {
						if (canPlaceCurrentShip) {
							playSound("click");
							placeShip(currentlyPlacing);
						}
					} else {
						if (playerCanFire && !alreadyHit(index)) {
							const newHits = fireTorpedo(index);
							const shipsWithSunkFlag = updateSunkShips(newHits, placedShips);
							const sunkShipsAfter = shipsWithSunkFlag.filter((ship) => ship.sunk).length;
							const sunkShipsBefore = placedShips.filter((ship) => ship.sunk).length;
							if (sunkShipsAfter > sunkShipsBefore) {
								playSound("sunk");
							}
							setPlacedShips(shipsWithSunkFlag);
							changeTurn(newHits);
						}
					}
				}}
				className={`square ${stateToClass[square]}`}
				// Only display square if it's a hit, miss, or sunk ship
				// className={
				// 	player !== opponent ? (stateToClass[square] === "hit" || stateToClass[square] === "miss" || stateToClass[square] === "ship-sunk" ? `square ${stateToClass[square]}` : `square`) : `square ${stateToClass[square]}`
				// }
				key={`square-${index}`}
				id={`square-${index}`}
				onMouseOver={() => {
					if (currentlyPlacing) {
						setCurrentlyPlacing({
							...currentlyPlacing,
							position: indexToCoords(index),
						});
					}
				}}
			/>
		);
	});

	return (
		<div>
			<h2 className='player-title'>{playerNumber === 1 ? "Player 1" : "Player 2"}</h2>
			<div className='board'>{squares}</div>
		</div>
	);
};
