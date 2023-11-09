import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

function App() {
  const [myId, setMyId] = useState('');
  const [peer] = useState(new Peer(undefined, {host: process.env.REACT_APP_PEERJS_URL, path: '/peerjs'}));

  const [myStream, setMyStream] = useState(null);
  const myAudio = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setMyStream(stream);
        if (myAudio.current) {
          myAudio.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Failed to get local stream', err));

    peer.on('open', id => {
      console.log('My peer ID is: ', id);
      setMyId(id);
      // Notify the server that this user is waiting
      fetch(`${process.env.REACT_APP_PEERJS_URL}/wait`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ peerId: id })
      });
      // Try to find a peer to call
      getPeerToCall();
    });

    peer.on('call', call => {
      call.answer(myStream);
      call.on('stream', handleStream);
    });

    // Clean up on unmount
    return () => {
      myStream?.getTracks().forEach(track => track.stop());
    };
  }, [peer, myStream]);

  const getPeerToCall = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_PEERJS_URL}/pair`);
      if (res.status === 200) {
        const { peerId } = await res.json();
        makeCall(peerId);
      } else {
        console.log('Waiting for another peer.');
      }
    } catch (error) {
      console.error('Error fetching peer ID:', error);
    }
  };

  const makeCall = (id) => {
    const call = peer.call(id, myStream);
    call.on('stream', handleStream);
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
