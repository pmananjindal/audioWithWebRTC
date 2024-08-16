import React, { useContext, useEffect } from "react";

import "./App.css";

import { JoinButton } from "./components/JoinButton";
import { RoomContext } from "./context/RoomContext";

function App() {
  const {
    startCall,
    isCalling,
    localAudioRef,
    remoteAudioRef,
    startRecording,
    stopRecording,
    handleUpload,
    isRecording,
    audioURL,
    audioRef,
    uploadAudio,
    uploading,
    error,
    success,
  } = useContext(RoomContext);
  return (
    <div className="App flex items-center justify-center w-screen h-screen">
      <button
        className="bg-rose-400 py-2 px-8 rounded-lg text-xl hover:bg-rose-600 text-white"
        onClick={startRecording}
        disabled={isRecording}
      >
        Start Call
      </button>
      <button
        className="bg-rose-400 py-2 px-8 rounded-lg text-xl hover:bg-rose-600 text-white"
        onClick={stopRecording}
        disabled={!isRecording}
      >
        Stop Recording
      </button>
      <button
        className="bg-rose-400 py-2 px-8 rounded-lg text-xl hover:bg-rose-600 text-white"
        onClick={handleUpload}
        disabled={!audioURL || uploading}
      >
        Upload Record
      </button>
      {audioURL && (
        <audio ref={audioRef} controls>
          Your browser does not support the audio element.
        </audio>
      )}
      Status of isCalling {JSON.stringify(isCalling)}
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {/* <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay /> */}
    </div>
  );
}

export default App;
