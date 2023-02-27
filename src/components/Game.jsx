import React, { useState, useRef, useEffect } from "react";
import { GameView } from "./GameView";
import { useSearchParams } from "next/navigation";

import io from "socket.io-client";
const socket = io("http://localhost:4000");

const AVAILABLE_SHIPS = [
	{
		name: "carrier",
		length: 5,
		placed: null,
	},
	// {
	// 	name: "battleship",
	// 	length: 4,
	// 	placed: null,
	// },
	// {
	// 	name: "cruiser",
	// 	length: 3,
	// 	placed: null,
	// },
	// {
	// 	name: "submarine",
	// 	length: 3,
	// 	placed: null,
	// },
	// {
	// 	name: "destroyer",
	// 	length: 2,
	// 	placed: null,
	// },
];

export const Game = () => {
	// const router = useRouter();
	//	const activePlayer = useRef(1);
	const playerReady = useRef(false);
	const [gameState, setGameState] = useState("placement");
	const [isShipPlaced, setIsShipPlaced] = useState(false);
	const [turn, setTurn] = useState("player");
	const [player, setPlayer] = useState("player");
	const [myTurn, setMyTurn] = useState(true);
	const [winner, setWinner] = useState(null);

	//player1
	const [currentlyPlacing, setCurrentlyPlacing] = useState(null); //selected ship to place
	const [placedShips, setPlacedShips] = useState([]); //list of all placed ships
	const [availableShips, setAvailableShips] = useState(AVAILABLE_SHIPS); //remove ships from the list upon pasting
	const [hitsByPlayer, setHitsByPlayer] = useState([]); //opponent ships

	//player2
	const [currentlyPlacing2, setCurrentlyPlacing2] = useState(null);
	const [placedShips2, setPlacedShips2] = useState([]);
	const [availableShips2, setAvailableShips2] = useState(AVAILABLE_SHIPS);
	const [hitsByPlayer2, setHitsByPlayer2] = useState([]);
	const [share, setShare] = useState(false);

	const searchParams = useSearchParams();
	//	const location = useLocation();
	// const params = new URLSearchParams(location.search);
	const paramsRoom = searchParams.get("room");
	// const paramsRoom = params.get("room");
	const [room, setRoom] = useState(paramsRoom);
	const [turnData, setTurnData] = useState(false);
	//const [hitsByComputer, setHitsByComputer] = useState([]);
	//const [computerShips, setComputerShips] = useState([]);

	console.log("player myturn, turn: ", player, myTurn, turn);
	//console.log("player: ", player);
	//console.log("turn: ", turn);
	// Check if either player or computer ended the game
	useEffect(() => {
		if (paramsRoom) {
			// means you are player 2
			setPlayer("computer");
			setTurn("computer");
			setMyTurn(false);
			socket.emit("join", paramsRoom);
			setRoom(paramsRoom);
			//setMyTurn(false);
		} else {
			// means you are player 1
			const newRoomName = random();
			socket.emit("create", newRoomName);
			setRoom(newRoomName);
			setMyTurn(true);
			//setMyTurn(true);
		}
	}, [paramsRoom]);

	useEffect(() => {
		socket.on("playerTurn", (json) => {
			//	console.log("player: ", player);
			//	console.log("playerTurn socket: ", JSON.parse(json));
			const parsedJson = JSON.parse(json);
			setTurnData(parsedJson);
			console.log({ parsedJson });

			// setTurnData(json);
		});

		socket.on("startGame", (json) => {
			const inputData = JSON.parse(json);
			console.log({ inputData });
			//console.log("startGame socket");
			if (playerReady.current) setGameState("game");
			if (player !== inputData.player) {
				if (player === "player") {
					setPlacedShips2(inputData.ships);
				} else {
					console.log("got ships from player");
					setPlacedShips(inputData.ships);
				}
			}
			// console.log("startGame: ", json);
		});

		// socket.on('restart', () => {
		// 	restart();
		// });

		socket.on("opponent_joined", () => {
			//	console.log("joined");
			//setHasOpponent(true);
			setShare(false);
		});
		socket.on("gameOver", () => {
			if (player === "player") {
				setWinner("computer");
			} else {
				setWinner("player");
			}
		});
		return () => {
			socket.off("playerTurn");
			socket.off("startGame");
			socket.off("opponent_joined");
			socket.off("gameOver");
		};
	}, [player]);

	useEffect(() => {
		if (turnData) {
			// if (player !== turnData.player) {
			console.log("got turn data: ", player);
			setTurnData(false);
			setMyTurn(!myTurn);
			//	console.log("hts: ", parsedJson.hits);
			if (player !== turnData.player) {
				if (player === "player") {
					setHitsByPlayer2(turnData?.hits);
				} else {
					setHitsByPlayer(turnData?.hits);
				}
			}
			setTurn((oldTurn) => (oldTurn === "player" ? "computer" : "player"));
			// }
		}
	}, [myTurn, player, turnData]);

	const checkIfGameOver = (player, newHits) => {
		//	console.log("checkIfGameOver activePlayer: ", activePlayer.current);
		//if (player !== activePlayer.current) return;
		// activePlayer.current = player;
		// let successfulPlayerHits = hitsByPlayer.filter((hit) => hit.type === "hit").length;
		// let successfulPlayer2Hits = hitsByPlayer2.filter((hit) => hit.type === "hit").length;

		let successfulHits = newHits.filter((hit) => hit.type === "hit").length;

		// console.log({ successfulPlayerHits });
		// console.log({ successfulPlayer2Hits });

		if (successfulHits === 4) {
			// if (successfulPlayer2Hits === 2 || successfulPlayerHits === 2) {
			console.log("gameover");
			setGameState("game-over");

			// if (successfulPlayer2Hits === 2) {
			if (player === "computer") {
				//	setWinner("computer");
				setWinner("player2");
				//playSound("lose");
			}
			//if (successfulPlayerHits === 2) {
			if (player === "player") {
				setWinner("player");
				//	playSound("win");
			}

			return true;
		}

		return false;
	};

	// *** PLAYER ***
	const selectShip = (shipName) => {
		let shipIdx = availableShips.findIndex((ship) => ship.name === shipName);
		const shipToPlace = availableShips[shipIdx];

		setCurrentlyPlacing({
			...shipToPlace,
			orientation: "horizontal",
			position: null,
		});
	};

	const placeShip = (currentlyPlacing) => {
		setPlacedShips([
			...placedShips,
			{
				...currentlyPlacing,
				placed: true,
			},
		]);

		setAvailableShips((previousShips) => previousShips.filter((ship) => ship.name !== currentlyPlacing.name));

		setCurrentlyPlacing(null);
	};

	// console.log({ availableShips });
	// console.log({ hitsByPlayer });
	// console.log({ placedShips });

	const rotateShip = (event) => {
		if (currentlyPlacing != null && event.button === 2) {
			setCurrentlyPlacing({
				...currentlyPlacing,
				orientation: currentlyPlacing.orientation === "vertical" ? "horizontal" : "vertical",
			});
		}
	};

	const startTurn = () => {
		console.log("start turn");
		//generateComputerShips();
		//setGameState("player-turn");
		// setGameState("game");
		// setIsShipPlaced(true);
		let sendShips = {};
		if (player === "player") {
			sendShips = placedShips;
		} else {
			sendShips = placedShips2;
		}
		playerReady.current = true;
		socket.emit("reqStartGame", JSON.stringify({ room, ships: sendShips, player: player }));
	};

	const changeTurn = (newHits) => {
		console.log("changeTurn: ", newHits);
		if (player === "player") setHitsByPlayer(newHits);
		if (player === "computer") setHitsByPlayer2(newHits);
		//	console.log("changing turns");
		//	checkIfGameOver();
		// activePlayer.current = 2;
		if (checkIfGameOver(turn, newHits)) {
			socket.emit("reqGameOver", room);
			return;
		}
		// console.log("proceed: ", gameState);
		//setGameState((oldGameState) => (oldGameState === "player-turn" ? "computer-turn" : "player-turn"));
		//	if (turn === "player") {
		// setTurn((oldTurn) => (oldTurn === "player" ? "computer" : "player"));
		socket.emit("reqTurn", JSON.stringify({ hits: newHits, player, room }));
		//	}
	};
	//console.log({ gameState });
	// *** PLAYER-2 ***
	const selectShip2 = (shipName) => {
		let shipIdx = availableShips.findIndex((ship) => ship.name === shipName);
		const shipToPlace = availableShips[shipIdx];

		setCurrentlyPlacing2({
			...shipToPlace,
			orientation: "horizontal",
			position: null,
		});
	};

	const placeShip2 = (currentlyPlacing2) => {
		setPlacedShips2([
			...placedShips2,
			{
				...currentlyPlacing2,
				placed: true,
			},
		]);

		setAvailableShips2((previousShips) => previousShips.filter((ship) => ship.name !== currentlyPlacing2.name));

		setCurrentlyPlacing2(null);
	};

	//console.log({ placedShips2 });
	//console.log({ placedShips });

	const rotateShip2 = (event) => {
		if (currentlyPlacing2 != null && event.button === 2) {
			setCurrentlyPlacing2({
				...currentlyPlacing2,
				orientation: currentlyPlacing2.orientation === "vertical" ? "horizontal" : "vertical",
			});
		}
	};

	// const startTurn2 = () => {
	// 	//generateComputerShips();
	// 	setGameState("player-turn");
	// };

	const changeTurn2 = () => {
		//checkIfGameOver();
		// activePlayer.current = 1;
		// if (checkIfGameOver()) {
		// 	return;
		// }
		// console.log("proceed2: ", gameState);
		setGameState((oldGameState) => (oldGameState === "player-turn" ? "computer-turn" : "player-turn"));
	};

	// *** COMPUTER ***
	// const generateComputerShips = () => {
	// 	let placedComputerShips = placeAllComputerShips(AVAILABLE_SHIPS.slice());
	// 	setComputerShips(placedComputerShips);
	// };

	// const computerFire = (index, layout) => {
	// 	let computerHits;

	// 	if (layout[index] === "ship") {
	// 		computerHits = [
	// 			...hitsByComputer,
	// 			{
	// 				position: indexToCoords(index),
	// 				type: SQUARE_STATE.hit,
	// 			},
	// 		];
	// 	}
	// 	if (layout[index] === "empty") {
	// 		computerHits = [
	// 			...hitsByComputer,
	// 			{
	// 				position: indexToCoords(index),
	// 				type: SQUARE_STATE.miss,
	// 			},
	// 		];
	// 	}
	// 	const sunkShips = updateSunkShips(computerHits, placedShips);
	// 	const sunkShipsAfter = sunkShips.filter((ship) => ship.sunk).length;
	// 	const sunkShipsBefore = placedShips.filter((ship) => ship.sunk).length;
	// 	if (sunkShipsAfter > sunkShipsBefore) {
	// 		playSound("sunk");
	// 	}
	// 	setPlacedShips(sunkShips);
	// 	setHitsByComputer(computerHits);
	// };

	// //Change to computer turn, check if game over and stop if yes; if not fire into an eligible square
	// const handleComputerTurn = () => {
	// 	changeTurn();

	// 	if (checkIfGameOver()) {
	// 		return;
	// 	}

	// 	// Recreate layout to get eligible squares
	// 	let layout = placedShips.reduce((prevLayout, currentShip) => putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship), generateEmptyLayout());

	// 	layout = hitsByComputer.reduce((prevLayout, currentHit) => putEntityInLayout(prevLayout, currentHit, currentHit.type), layout);

	// 	layout = placedShips.reduce((prevLayout, currentShip) => (currentShip.sunk ? putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship_sunk) : prevLayout), layout);

	// 	let successfulComputerHits = hitsByComputer.filter((hit) => hit.type === "hit");

	// 	let nonSunkComputerHits = successfulComputerHits.filter((hit) => {
	// 		const hitIndex = coordsToIndex(hit.position);
	// 		return layout[hitIndex] === "hit";
	// 	});

	// 	let potentialTargets = nonSunkComputerHits.flatMap((hit) => getNeighbors(hit.position)).filter((idx) => layout[idx] === "empty" || layout[idx] === "ship");

	// 	// Until there's a successful hit
	// 	if (potentialTargets.length === 0) {
	// 		let layoutIndices = layout.map((item, idx) => idx);
	// 		potentialTargets = layoutIndices.filter((index) => layout[index] === "ship" || layout[index] === "empty");
	// 	}

	// 	let randomIndex = generateRandomIndex(potentialTargets.length);

	// 	let target = potentialTargets[randomIndex];

	// 	setTimeout(() => {
	// 		computerFire(target, layout);
	// 		changeTurn();
	// 	}, 300);
	// };

	// *** END GAME ***

	//console.log({ hitsByPlayer });
	const startAgain = () => {
		setGameState("placement");
		setWinner(null);
		setCurrentlyPlacing(null);
		setPlacedShips([]);
		setAvailableShips(AVAILABLE_SHIPS);
		setPlacedShips2([]);
		setAvailableShips2(AVAILABLE_SHIPS);
		setCurrentlyPlacing2(null);
		// setComputerShips([]);
		setHitsByPlayer([]);
		setHitsByPlayer2([]);
		// setHitsByComputer([]);
	};

	const sunkSoundRef = useRef(null);
	const clickSoundRef = useRef(null);
	const lossSoundRef = useRef(null);
	const winSoundRef = useRef(null);

	const stopSound = (sound) => {
		sound.current.pause();
		sound.current.currentTime = 0;
	};
	const playSound = (sound) => {
		if (sound === "sunk") {
			stopSound(sunkSoundRef);
			sunkSoundRef.current.play();
		}

		if (sound === "click") {
			stopSound(clickSoundRef);
			clickSoundRef.current.play();
		}

		if (sound === "lose") {
			stopSound(lossSoundRef);
			lossSoundRef.current.play();
		}

		if (sound === "win") {
			stopSound(winSoundRef);
			winSoundRef.current.play();
		}
	};
	return (
		<React.Fragment>
			<audio ref={sunkSoundRef} src='/sounds/ship_sunk.wav' className='clip' preload='auto' />
			<audio ref={clickSoundRef} src='/sounds/click.wav' className='clip' preload='auto' />
			<audio ref={lossSoundRef} src='/sounds/lose.wav' className='clip' preload='auto' />
			<audio ref={winSoundRef} src='/sounds/win.wav' className='clip' preload='auto' />
			Room: {room}
			<button className='btn' onClick={() => setShare(!share)}>
				Share
			</button>
			{share ? (
				<>
					<br />
					<br />
					Share link: <input type='text' value={`${window.location.href}?room=${room}`} readOnly />
				</>
			) : null}
			<GameView
				myTurn={myTurn}
				player={player}
				turn={turn}
				availableShips={availableShips}
				selectShip={selectShip}
				placeShip={placeShip}
				rotateShip={rotateShip}
				changeTurn={changeTurn}
				currentlyPlacing={currentlyPlacing}
				setCurrentlyPlacing={setCurrentlyPlacing}
				placedShips={placedShips}
				hitsByPlayer={hitsByPlayer}
				setHitsByPlayer={setHitsByPlayer}
				setPlacedShips={setPlacedShips}
				// player 2
				selectShip2={selectShip2}
				placeShip2={placeShip2}
				rotateShip2={rotateShip2}
				changeTurn2={changeTurn2}
				currentlyPlacing2={currentlyPlacing2}
				setCurrentlyPlacing2={setCurrentlyPlacing2}
				placedShips2={placedShips2}
				hitsByPlayer2={hitsByPlayer2}
				setHitsByPlayer2={setHitsByPlayer2}
				availableShips2={availableShips2}
				setPlacedShips2={setPlacedShips2}
				startTurn={startTurn}
				//computerShips={computerShips}
				gameState={gameState}
				//hitsByComputer={hitsByComputer}
				//setHitsByComputer={setHitsByComputer}
				//handleComputerTurn={handleComputerTurn}
				checkIfGameOver={checkIfGameOver}
				startAgain={startAgain}
				winner={winner}
				//setComputerShips={setComputerShips}
				playSound={playSound}
			/>
		</React.Fragment>
	);
};

const random = () => {
	return Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join("");
};
