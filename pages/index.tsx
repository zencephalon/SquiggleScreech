import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React from "react";
import { Howl, Howler } from "howler";

const fibb = [
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584,
  4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811,
];

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
  const timeoutId = React.useRef<NodeJS.Timeout>();

  const [started, setStarted] = React.useState(false);
  const [gameStart, setGameStart] = React.useState<number>();

  const comboBreak = () => {
    stopSound.play();
    let scoreUp = 0;
    setFlowing(false);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    scoreUp += fibb[wordLength.current];
    wordLength.current = 0;

    const flowLength = flowStart ? Date.now() - flowStart : 0;
    scoreUp += Math.round((flowLength / 100) * (comboLength.current / 10));
    comboLength.current = 0;

    setScore((score) => score + scoreUp);

    console.log("combo broke");
  };

  const updateText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let scoreUp = 0;
    const val = event.target.value;

    const addedCharLength = val.length - text.length;
    const addedChars = val.substring(val.length - addedCharLength);

    const didAdd = addedCharLength > 0;

    setText(val);

    if (!didAdd) {
      // break streak
      comboBreak();
      return;
    }

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
        wordSound.play();
        scoreUp += fibb[wordLength.current];
        wordLength.current = 0;
        setWords((words) => words + 1);
      }
    } else {
      wordLength.current += 1;
    }

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(comboBreak, 700);
    setScore((score) => score + scoreUp);
  };

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
          {flowing ? "🔥" : ""}
          <br />
          words: {words}
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
