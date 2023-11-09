import React, { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';

function App() {
  const [myId, setMyId] = useState('');
  const [callId, setCallId] = useState('');
  const [peer] = useState(new Peer(undefined, {host: process.env.REACT_APP_PEERJS_URL, path: '/peerjs'}));
  const [myStream, setMyStream] = useState(null);

  const myAudio = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMyStream(stream);
      })
      .catch((err) => {
        console.error('Failed to get audio stream:', err);
      });
  }, []);

  peer.on('open', (id) => {
    setMyId(id);
  });

  peer.on('call', (call) => {
    call.answer(myStream); 
    call.on('stream', (remoteStream) => {
      myAudio.current.srcObject = remoteStream;
      // Wait for the canplay event before playing
      myAudio.current.addEventListener('canplay', function() {
        let playPromise = myAudio.current.play();
        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // Playback started. Everything is good.
          }).catch(error => {
            console.error('Playback failed:', error);
            // Handle the failure accordingly.
          });
        }
      });
    });
  });

  const makeCall = (id) => {
    if (myStream) {
      const call = peer.call(id, myStream);
      call.on('stream', (remoteStream) => {
        myAudio.current.srcObject = remoteStream;
        // Wait for the canplay event before playing
        myAudio.current.addEventListener('canplay', function() {
          let playPromise = myAudio.current.play();
          if (playPromise !== undefined) {
            playPromise.then(_ => {
              // Playback started. Everything is good.
            }).catch(error => {
              console.error('Playback failed:', error);
              // Handle the failure accordingly.
            });
          }
        });
      });
    } else {
      console.error('Audio stream not available');
    }
  };

  return (
    <div className="App">
      <h2>Your ID: {myId}</h2>
      <input
        value={callId}
        onChange={(e) => setCallId(e.target.value)}
        placeholder="Enter ID to call"
      />
      <button onClick={() => makeCall(callId)}>Call</button>
      <audio ref={myAudio} controls></audio>
    </div>
  );
}

export default App;
