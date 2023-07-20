import React, { useEffect, useState } from "react";
import axios from "axios";
const BridgeGame = () => {
  const [bridge, setBridge] = useState("");
  const [location, setLocation] = useState(-1);
  const [count, setCount] = useState(0);
  const [gameCount, setGameCount] = useState(0);
  const [isGameStart, setIsGameStart] = useState(false);
  const [isCrossing, setIsCrossing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [record, setRecord] = useState([]);
  const [dice, setDice] = useState(0);
  const [startTime, setStartTime] = useState();
  const [apiData, setApiData] = useState([]);
  useEffect(() => {
    const block = ["#", "O"];
    let blockNum = [10, 10];
  }, []);

  // Function to create a new bridge
  const createBridge = () => {
    console.log("======================");
    console.log("돌다리를 생성합니다.");
    console.log();
    let remain = [blockNum[0], blockNum[1]]; // 강, 돌다리 개수 저장
    let bridgeArray = []; // 돌다리 정보 저장

    // 랜덤으로 돌다리 생성
    while (remain[0] > 0 || remain[1] > 0) {
      let nowChoice = Math.floor(Math.random() * 2);
      if (remain[nowChoice] > 0) {
        bridgeArray.push(block[nowChoice]);
        remain[nowChoice]--;
      } else {
        bridgeArray.push(
          ...Array(remain[Number(!nowChoice)]).fill(block[Number(!nowChoice)])
        );
        break;
      }
    }

    const resultBridge = bridgeArray.join("");
    setBridge(resultBridge);
    console.log(resultBridge);
    console.log();
  };

  // Function to handle crossing the bridge
  const crossBridge = () => {
    setDice(Math.floor(Math.random() * 4) + 1);
    setCount((prevCount) => prevCount + 1);
  };

  const startGame = () => {
    newGame();
    setIsGameStart(true);
  };

  const endGame = () => {
    setBridge("");
    setIsSuccess(false);
    setIsGameOver(false);
    setCount(0);
    setLocation(-1);
    setIsCrossing(false);
    setGameCount(0);
    setIsGameStart(false);
    setDice(0);
  };

  // Function to start the game
  const newGame = () => {
    setIsSuccess(false);
    setIsGameOver(false);
    setCount(0);
    setLocation(-1);
    setIsCrossing(false);
    createBridge();
    setGameCount(gameCount + 1);
    setDice(0);
  };

  useEffect(() => {
    if (location >= 19) {
      setIsSuccess(true);
    } else if (bridge[location] === "#") {
      setIsGameOver(true);
    } else {
      setIsCrossing(false);
    }
  }, [location]);

  useEffect(() => {
    if (isGameOver) {
      setTimeout(() => {
        setIsGameOver(true);
        startGame();
      }, 2000);
    }
  }, [isGameOver]);

  useEffect(() => {
    if (isSuccess) {
      recordTime();
    }
  }, [isSuccess]);

  useEffect(() => {
    setLocation((prevLocation) => prevLocation + dice);
  }, [dice]);

  const URL = "https://taehun.site/rank";

  const getData = () => {
    axios.get(URL).then((Response) => setApiData(Response.data));
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    console.log(apiData);
  }, [apiData]);

  const submitData = async (time) => {
    console.log("TIME", time);
    await axios
      .post(URL, {
        count: count,
        gameCount: gameCount,
        time: time,
      })
      .then(() => {
        getData();
      });
  };

  // Helper function to get record time
  const getRecordTime = () => {
    const gameTime = Math.floor((Date.now() - startTime) / 1000);
    return `${Math.floor(gameTime / 60)}m ${gameTime % 60}s`;
  };

  const recordTime = () => {
    const tempRecord = [...record];
    const time = getRecordTime();
    tempRecord.push([count, gameCount, time]);
    tempRecord.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    setRecord(tempRecord);
    submitData(time);
  };

  // Start time for recording game time
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const easy = () => {
    if (blockNum[0] === 10 && blockNum[1] === 10) {
      blockNum = [5, 15];
    } else {
      blockNum = [10, 10];
    }
    newGame();
  };

  // Render the game UI
  return (
    <div>
      <h1>돌다리 게임</h1>
      <div>
        {isGameStart ? (
          <button onClick={endGame}>게임 종료</button>
        ) : (
          <button onClick={startGame}>게임 시작</button>
        )}
      </div>
      {bridge && (
        <div>
          <p>주사위: {dice}</p>
          <p>
            다리 정보:{" "}
            {bridge.split("").map((stone, idx) => (
              <span
                key={idx}
                style={idx === location ? { color: "red" } : { color: "black" }}
              >
                {stone}
              </span>
            ))}
          </p>
          <p>
            현재 위치: {location + 1}, 도전 횟수: {count}, 재시도 횟수:{" "}
            {gameCount}
          </p>
          {!isSuccess && !isGameOver && (
            <>
              <button onClick={crossBridge}>돌다리 건너기</button>
              <br />
              <button onClick={easy}>이지 모드</button>
            </>
          )}
          {isSuccess && <p>강을 건넜습니다.</p>}
          {isGameOver && <p>강에 빠졌습니다.</p>}
          {(isSuccess || isGameOver) && (
            <div>
              <p>도전 횟수: {count}</p>
              <p>게임 기록: {getRecordTime()}</p>
            </div>
          )}
        </div>
      )}
      <div>
        <h2>게임 기록</h2>
        <ol>
          {apiData.map((info, index) => (
            <li
              key={index}
            >{`${info.count} / ${info.gameCount} / ${info.time}`}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default BridgeGame;
