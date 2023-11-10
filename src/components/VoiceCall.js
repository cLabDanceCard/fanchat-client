import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';

const VoiceCall = () => {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [myStream, setMyStream] = useState(null);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setMyStream(stream);

        const peer = new Peer(undefined, {
          host: process.env.REACT_APP_PEERJS_HOST || window.location.hostname,
          port: process.env.REACT_APP_PEERJS_PORT || (process.env.REACT_APP_PEERJS_SECURE === 'true' ? 443 : 80),
          path: '/peerjs',
          secure: process.env.REACT_APP_PEERJS_SECURE === 'true' || window.location.protocol === 'https:'
        });

        peer.on('open', id => {
          console.log('My peer ID is: ' + id)
          addUserToWaitingList(id);
          setMyId(id);
        });

        peer.on('call', incomingCall => {
          setInCall(true);
          incomingCall.answer(stream);
          incomingCall.on('stream', handleStream);
          incomingCall.on('close', () => {
            setInCall(false);
          });
        });

        setPeer(peer);
      })
      .catch(err => {
        console.error('Failed to get local stream', err);
      });
  }, []);

  const callFriend = () => {
    if (myStream && peer) {
      const call = peer.call(friendId, myStream);
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

  const addUserToWaitingList = (id) => {
    fetch(`${process.env.REACT_APP_API_URL}/addUserToWaitingList`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peerId: id })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error('Failed to add user to waiting list', err);
      });
  }

  return (
    <div>
      {inCall && <p>Call in progress...</p>}
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
