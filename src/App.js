import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

function App() {
  const [myId, setMyId] = useState('');
  const peerRef = useRef(null);
  const [myStream, setMyStream] = useState(null);
  const myAudio = useRef(null);

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      host: process.env.REACT_APP_PEERJS_URL,
      path: '/peerjs',
    });
    peerRef.current = newPeer;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setMyStream(stream);
        if (myAudio.current) {
          myAudio.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Failed to get local stream', err));

    newPeer.on('open', id => {
      console.log('My peer ID is: ', id);
      setMyId(id);
      fetch(`${process.env.REACT_APP_PEERJS_URL}/wait`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ peerId: id })
      });
    });

    newPeer.on('call', call => {
      call.answer(myStream);
      call.on('stream', handleStream);
    });

    // Register beforeunload event to handle tab close
    window.addEventListener('beforeunload', cleanUp);

    // Clean up on unmount
    return () => {
      window.removeEventListener('beforeunload', cleanUp);
      cleanUp();
    };
  }, []);

  const cleanUp = () => {
    myStream?.getTracks().forEach(track => track.stop());
    peerRef.current?.destroy(); // Triggers the 'disconnect' event on the server
  };

  const handleStream = (remoteStream) => {
    myAudio.current.srcObject = remoteStream;
    myAudio.current.play().catch(error => console.error('Stream play failed', error));
  };

  return (
    <div className="App">
      <h2>Your ID: {myId}</h2>
      <audio ref={myAudio} controls autoPlay />
    </div>
  );
}

export default App;
