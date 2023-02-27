import React from "react";

import { PlayerFleet } from "./PlayerFleet";
import { PlayerBoard } from "./PlayerBoard";
import { PlayerTips } from "./PlayerTips";

export const GameView = ({
	myTurn,
	turn,
	player,
	availableShips,
	availableShips2,
	selectShip,
	placeShip,
	rotateShip,
	changeTurn,
	currentlyPlacing,
	setCurrentlyPlacing,
	placedShips,
	hitsByPlayer,
	setHitsByPlayer,
	setPlacedShips,
	selectShip2,
	placeShip2,
	rotateShip2,
	changeTurn2,
	currentlyPlacing2,
	setCurrentlyPlacing2,
	placedShips2,
	hitsByPlayer2,
	setHitsByPlayer2,
	setPlacedShips2,
	startTurn,
	//computerShips,
	gameState,
	//hitComputer,
	//hitsByComputer,
	//handleComputerTurn,
	checkIfGameOver,
	winner,
	startAgain,
	//setComputerShips,
	playSound,
}) => {
	return (
		<section id='game-screen'>
			{gameState !== "placement" ? (
				<PlayerTips gameState={gameState} hitsbyPlayer={hitsByPlayer} hitsByComputer={hitsByPlayer2} winner={winner} startAgain={startAgain} />
			) : (
				<>
					{player === "player" && <PlayerFleet availableShips={availableShips} selectShip={selectShip} currentlyPlacing={currentlyPlacing} startTurn={startTurn} startAgain={startAgain} />}
					{player === "computer" && <PlayerFleet availableShips={availableShips2} selectShip={selectShip2} currentlyPlacing={currentlyPlacing2} startTurn={startTurn} startAgain={startAgain} />}
				</>
			)}

			<PlayerBoard
				myTurn={myTurn}
				turn={turn}
				player={player}
				playerNumber={1}
				opponent='computer'
				currentlyPlacing={currentlyPlacing}
				setCurrentlyPlacing={setCurrentlyPlacing}
				rotateShip={rotateShip}
				placeShip={placeShip}
				placedShips={placedShips}
				setPlacedShips={setPlacedShips}
				hitsByComputer={hitsByPlayer2}
				playSound={playSound}
				gameState={gameState}
				checkIfGameOver={checkIfGameOver}
				setHitsByComputer={setHitsByPlayer2}
				changeTurn={changeTurn}
			/>
			<PlayerBoard
				myTurn={myTurn}
				turn={turn}
				player={player}
				playerNumber={2}
				opponent='player'
				currentlyPlacing={currentlyPlacing2}
				setCurrentlyPlacing={setCurrentlyPlacing2}
				rotateShip={rotateShip2}
				placeShip={placeShip2}
				placedShips={placedShips2}
				setPlacedShips={setPlacedShips2}
				hitsByComputer={hitsByPlayer}
				playSound={playSound}
				gameState={gameState}
				checkIfGameOver={checkIfGameOver}
				setHitsByComputer={setHitsByPlayer}
				changeTurn={changeTurn}
			/>
		</section>
	);
};
