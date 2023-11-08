import React, { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';

function App() {
  const [myId, setMyId] = useState('');
  const [callId, setCallId] = useState('');
  const [myStream, setMyStream] = useState(null);
  const myAudio = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // Access user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setMyStream(stream);
      })
      .catch((err) => {
        console.error('Failed to get audio stream:', err);
      });

    // Initialize Peer object
    peerRef.current = new Peer(undefined, {
      host: 'localhost',
      port: 5000,
      path: '/',
      secure: false,
    });

    peerRef.current.on('open', (id) => {
      console.log('PeerJS on open with ID:', id);
      setMyId(id);
    });

    peerRef.current.on('error', (err) => {
      console.error('PeerJS error:', err);
    });

    return () => {
      peerRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    // Listen for incoming calls
    if (peerRef.current) {
      peerRef.current.on('call', (call) => {
        call.answer(myStream); 
        call.on('stream', (remoteStream) => {
          myAudio.current.srcObject = remoteStream;
        });
      });
    }
  }, [myStream]);

  const makeCall = (id) => {
    if (myStream) {
      const call = peerRef.current.call(id, myStream);
      call.on('stream', (remoteStream) => {
        myAudio.current.srcObject = remoteStream;
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
