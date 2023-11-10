import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';

const VoiceCall = () => {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [myStream, setMyStream] = useState(null);

  useEffect(() => {
    // Request the media stream
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setMyStream(stream); // Save the stream to the component state

        const peer = new Peer(undefined, {
          host: '/',
          port: '9000',
          path: '/peerjs'
        });

        peer.on('open', id => {
          setMyId(id);
        });

        peer.on('call', incomingCall => {
          incomingCall.answer(stream); // Answer with the user's audio stream
          incomingCall.on('stream', handleStream);
        });

        setPeer(peer);
      })
      .catch(err => {
        console.error('Failed to get local stream', err);
      });
  }, []);

  const callFriend = () => {
    if (myStream && peer) {
      const call = peer.call(friendId, myStream); // Pass the user's audio stream
      call.on('stream', handleStream);
    } else {
      console.log('Stream or Peer object is not available');
    }
  };

  const handleStream = (stream) => {
    const audio = document.querySelector('audio');
    audio.srcObject = stream;
    audio.onloadedmetadata = () => {
      audio.play();
    };
  };

  return (
    <div>
      <div>Your ID: {myId}</div>
      <input
        type="text"
        value={friendId}
        onChange={e => setFriendId(e.target.value)}
        placeholder="Friend ID"
      />
      <button onClick={callFriend}>Call</button>
      <audio controls autoPlay />
    </div>
  );
};

export default VoiceCall;
