import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useCallback } from "react";
import { Howl, Howler } from "howler";

import useLocalStorage from "../hooks/useLocalStorage";

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

const Editor = () => {
  const [text, setText] = useLocalStorage<string>("text", "");
  const [words, setWords] = useLocalStorage<number>("words", 0);
  const [totalWords, setTotalWords] = useLocalStorage<number>("totalWords", 0);
  const [flowStart, setFlowStart] = React.useState<number>();
  const [flowing, setFlowing] = React.useState(false);
  const [score, setScore] = useLocalStorage<number>("score", 0);
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

    setScore((score: number) => score + scoreUp);

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
        setTotalWords((words) => words + 1);
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

  const newSquiggle = useCallback(() => {
    setText("");
    setScore(0);
    setWords(0);
  }, [setText, setScore, setWords]);

  return (
    <div className={styles.container}>
      <Head>
        <title>SquiggleScreech</title>
        <meta name="description" content="The flow writing game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>SquiggleScreech</h1>
        <div className={styles.scoring}>
          <span className={styles.center}>
            score: <span className={styles.score}>{score}</span>
          </span>
          <span className={styles.center}>
            words: <span className={styles.score}>{words}</span>
          </span>
          <span className={styles.score}>
            {flowing ? "🔥".repeat(flowPower < 1 ? 1 : flowPower) : "🤔"}
          </span>
        </div>

        <textarea
          value={text}
          onChange={updateText}
          className={styles.gamearea}
        ></textarea>

        <div className={styles.footer}>
          all time words: {totalWords}
          <button onClick={newSquiggle} className={styles.newButton}>
            Start new Squiggle
          </button>
        </div>
      </main>
    </div>
  );
};

export default Editor;
