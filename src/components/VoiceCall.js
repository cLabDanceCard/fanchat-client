import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';

const VoiceCall = () => {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  
  useEffect(() => {
    const peer = new Peer(undefined, {
      host: '/',
    });

    peer.on('open', id => {
      setMyId(id);
    });

    peer.on('call', call => {
      call.answer();
      call.on('stream', handleStream);
    });

    setPeer(peer);
  }, []);

  const callFriend = () => {
    const call = peer.call(friendId, {});
    call.on('stream', handleStream);
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
