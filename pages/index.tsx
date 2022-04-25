import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React from "react";
import { Howl, Howler } from "howler";

const fibb = (n: number) => {
  if (n < 2) {
    return 0;
  } else {
    return Math.floor(1.6 ** n);
  }
};

const stopSound = new Howl({
  src: ["/sfx/stop.wav"],
});
const wordSound = new Howl({
  src: ["/sfx/word.wav"],
});

const Home: NextPage = () => {
  const [text, setText] = React.useState("");
  const [words, setWords] = React.useState(0);
  const [flowStart, setFlowStart] = React.useState<number>();
  const [flowing, setFlowing] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const wordLength = React.useRef(0);
  const comboLength = React.useRef(0);
  const lastComboScore = React.useRef(0);
  const timeoutId = React.useRef<NodeJS.Timeout>();

  const [started, setStarted] = React.useState(false);
  const [gameStart, setGameStart] = React.useState<number>();

  const comboScore = () => {
    const flowLength = flowStart ? Date.now() - flowStart : 0;
    return Math.round((flowLength / 100) * (comboLength.current / 10));
  };

  const comboBreak = () => {
    stopSound.play();
    let scoreUp = 0;
    setFlowing(false);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    scoreUp += fibb(wordLength.current);
    wordLength.current = 0;

    comboLength.current = 0;
    lastComboScore.current = 0;

    setScore((score) => score + scoreUp);

    console.log("combo broke");
  };

  const updateText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let scoreUp = 0;
    const val = event.target.value;

    const addedCharLength = val.length - text.length;
    const addedChars = val.substring(val.length - addedCharLength);

    setText(val);

    // const didAdd = addedCharLength > 0;
    // if (!didAdd) {
    //   // break streak
    //   comboBreak();
    //   return;
    // }

    if (!started) {
      setStarted(true);
      setGameStart(Date.now());
    }

    if (!flowing) {
      setFlowing(true);
      setFlowStart(Date.now());
    }

    comboLength.current += 1;
    scoreUp += 1;

    if (wordLength.current > 0) {
      if (/\W/.test(addedChars[addedCharLength - 1])) {
        // wordSound.play();
        scoreUp += fibb(wordLength.current);
        wordLength.current = 0;
        setWords((words) => words + 1);
      }
    } else {
      wordLength.current += 1;
    }

    const cScore = comboScore();
    scoreUp += cScore - lastComboScore.current;
    lastComboScore.current = cScore;

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(comboBreak, 1500);
    setScore((score) => score + scoreUp);
  };

  const flowPower = Math.floor(Math.log(lastComboScore.current));

  return (
    <div className={styles.container}>
      <Head>
        <title>SquiggleScreech</title>
        <meta name="description" content="The flow writing game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>SquiggleScreech</h1>
        <h3>
          score: {score}
          <br />
          words: {words}
          <br />
          {flowing ? "🔥".repeat(flowPower < 0 ? 0 : flowPower) : ""}
        </h3>

        <textarea
          value={text}
          onChange={updateText}
          className={styles.gamearea}
        ></textarea>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
