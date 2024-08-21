import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const GameComponent = () => {
  const gameContainerRef = useRef(null);
  const [sessionData, setSessionData] = useState([]);
  const [sessionID, setSessionID] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const clockSoundRef = useRef(null);
  const ballRef = useRef(null);
  const timerEventRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.CANVAS,
      width: 1000,
      height: 600,
      parent: gameContainerRef.current,
      scene: {
        preload,
        create,
        update
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { y: 0 }
        }
      },
      disableVisibilityChange: true
    };

    const game = new Phaser.Game(config);

    function preload() {
      this.load.image('back', '/assets/cloudWithSea.png');
      this.load.audio('clock', '/assets/audio/oldClock.mp3');
      this.load.image('ball', '/assets/ball.png');
    }

    function create() {
      this.add.image(0, 0, 'back').setOrigin(0, 0);
      clockSoundRef.current = this.sound.add('clock');

      ballRef.current = this.physics.add.image(400, 400, 'ball').setCollideWorldBounds(true).setBounce(1, 1);
      ballRef.current.setDisplaySize(100, 100);
      this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height, true, true, true, true);

      document.getElementById('startSessionBtn').addEventListener('click', () => {
        if (!sessionActive) {
          startSession(this);
        }
      });

      document.addEventListener('visibilitychange', handleVisibilityChange.bind(this));
    }

    function startSession(phaserScene) {
      setSessionActive(true);
      const newSessionID = Phaser.Math.Between(1000, 9999).toString();
      setSessionID(newSessionID);
      const newCountdown = Phaser.Math.Between(60, 110);
      setCountdown(newCountdown);
      setCounterValue(newCountdown);
      setStartTime(new Date().toLocaleTimeString());
      clockSoundRef.current.play({ loop: true });

      const velocityX = Phaser.Math.Between(-600, 600);
      const velocityY = Phaser.Math.Between(-1200, 1200);
      ballRef.current.setVelocity(velocityX, velocityY);

      if (timerEventRef.current) {
        timerEventRef.current.remove();
      }

      // Timer event should be managed in the separate useEffect
    }


    function handleVisibilityChange() {
      // Do nothing; the game should continue running as usual
    }

    function update() {
      // No specific update logic needed at the moment
    }

    return () => {
      if (game) game.destroy(true);
    };
  }, [sessionActive]);

  function click() {
    setEndTime("");
   }
  // Separate useEffect for countdown timer
  useEffect(() => {
    function endSession() {
      const newEndTime = new Date().toLocaleTimeString();
      setEndTime(newEndTime);
      setSessionData(prevSessionData => [
        ...prevSessionData,
        { sessionID, startTime, endTime: newEndTime }
      ]);
      clockSoundRef.current.stop();
      if (timerEventRef.current) {
        timerEventRef.current.remove();
      }
      if (ballRef.current) {
        ballRef.current.setVelocity(0, 0);
      }
      setSessionActive(false);
    }
    if (sessionActive) {
      const interval = setInterval(() => {
        setCountdown(prevCountdown => {
          const newCountdown = prevCountdown - 1;
          console.log('Updated countdown value:', newCountdown); // Debugging
          setCounterValue(newCountdown);
          if (newCountdown <= 0) {
            clearInterval(interval);
            endSession();
          }
          return newCountdown;
        });
      }, 1000);

      // Cleanup the interval when the session ends
      return () => clearInterval(interval);
    }
  }, [sessionActive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '96vh', marginTop: '20px', marginLeft: '20px', backgroundColor: 'white' }}>
      <div ref={gameContainerRef} style={{ flexGrow: 1, backgroundColor: '#fff' }}></div>
      <div id="rightPanel" style={{ width: '250px', backgroundColor: '#fff', padding: '20px', borderLeft: '1px solid #ccc' }}>
        <button onClick={click} id="startSessionBtn">Bouble Click to Start</button>
        <div style={{ color: 'black' }}>Session ID: <span>{sessionID}</span></div>
        <div style={{ color: 'black' }}>Start Time: <span>{startTime}</span></div>
        <div style={{ color: 'black' }}>End Time: <span  >{endTime}</span></div>
        <div style={{ color: 'black' }}>Counter: <span>{counterValue}</span></div>
        <ul id="sessionList">
          {sessionData.map((session, index) => (
            <li key={index}>Session {session.sessionID}: {session.startTime} - {session.endTime}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameComponent;
