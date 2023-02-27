import React, { useState } from "react";
//import styles from "@/styles/Home.module.css";
import { Game } from "@/components/Game";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export default function Home() {
	const [appState, setAppState] = useState("welcome"); // play or welcome

	const startPlay = () => {
		setAppState("play");
	};

	return <>{appState === "play" ? <Game /> : <WelcomeScreen startPlay={startPlay} />}</>;
}
