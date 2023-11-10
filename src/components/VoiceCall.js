import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

function VoiceCall() {
  const [myId, setMyId] = useState('');
  const peerRef = useRef(null);
  const [callId, setCallId] = useState('');
  const myAudio = useRef(null);

  useEffect(() => {
    // Create a peer connection
    peerRef.current = new Peer(undefined, {
      host: 'localhost',
      port: 9000,
      path: '/peerjs/myapp'
    });

    // Get audio stream
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        myAudio.current.srcObject = stream;

        // When the peer connection is open
        peerRef.current.on('open', (id) => {
          setMyId(id);
          // Here you would likely notify the server of the new peer ID so it can be paired
        });

        // Handle incoming calls
        peerRef.current.on('call', (call) => {
          call.answer(stream); // Answer the call with the audio stream.
          call.on('stream', (remoteStream) => {
            // Use the remote stream for something
          });
        });

        // Here you could either make a call or wait to be called
      })
      .catch((err) => {
        console.error('Failed to get local stream', err);
      });

    return () => {
      peerRef.current.destroy();
    };
  }, []);

  // Function to make a call
  const makeCall = (peerId) => {
    const call = peerRef.current.call(peerId, myAudio.current.srcObject);
    call.on('stream', (remoteStream) => {
      // Use the remote stream for something
    });
  };

  return (
    <div className="App">
      <h1>My Peer ID: {myId}</h1>
      <input value={callId} onChange={(e) => setCallId(e.target.value)} placeholder="Enter ID to call" />
      <button onClick={() => makeCall(callId)}>Call</button>
      <audio ref={myAudio} controls autoPlay />
    </div>
  );
}

export default VoiceCall;
