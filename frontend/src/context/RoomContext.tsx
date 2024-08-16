import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import axios from "axios";
const WS = "http://localhost:8080";
type AudioChatContextType = {
  startCall: () => void;
  isCalling: boolean;
  localAudioRef: React.RefObject<HTMLAudioElement>;
  remoteAudioRef: React.RefObject<HTMLAudioElement>;
  startRecording: () => void;
  stopRecording: () => void;
  handleUpload: () => void;
  uploadAudio: (data: any) => void;
  isRecording: boolean;
  audioURL: any;
  audioRef: any;
  success: any;
  uploading: boolean;
  error: any;
};
const defaultContextValue: AudioChatContextType = {
  startCall: () => {},
  isCalling: false,
  isRecording: false,
  localAudioRef: { current: null },
  remoteAudioRef: { current: null },
  startRecording: () => {},
  stopRecording: () => {},
  uploadAudio: (data: any) => {},
  handleUpload: () => {},
  audioURL: {},
  audioRef: {},
  uploading: false,
  error: null,
  success: null,
};
export const RoomContext =
  createContext<AudioChatContextType>(defaultContextValue);
const ws = socketIOClient(WS);
type RoomProviderProps = {
  children: ReactNode;
};
export const RoomProvider: React.FunctionComponent<RoomProviderProps> = ({
  children,
}: any) => {
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    if (audioURL && audioRef.current) {
      audioRef.current.src = audioURL;
    }
  }, [audioURL]);
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        const tracks = audioStreamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);
  useEffect(() => {
    const constraints = { audio: true, video: false };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }

        const peerConnection = new RTCPeerConnection();
        peerConnectionRef.current = peerConnection;

        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream));

        peerConnection.ontrack = (event) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        ws.on("offer", async (offer) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(
              new RTCSessionDescription(answer)
            );
            ws.emit("answer", answer);
          }
        });

        ws.on("answer", async (answer) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        });

        ws.on("ice-candidate", async (candidate) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        });

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            ws.emit("ice-candidate", event.candidate);
          }
        };
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }, []);
  const startCall = async () => {
    if (peerConnectionRef.current) {
      console.log("in Start call");
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      ws.emit("offer", offer);
      setIsCalling(true);
    } else {
      console.log("in else of Start call");
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const url = URL.createObjectURL(event.data);
          setAudioURL(url);
          setAudioBlob(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const handleUpload = async () => {
    if (audioBlob) {
      await uploadAudio(audioBlob);
    } else {
      setError("No audio to upload");
    }
  };
  const uploadAudio = async (blob: Blob) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    //formData.append("audio", blob, "recording.webm"); // Adjust file name and type if needed
    /// Ensure that the Blob is correctly set
    if (blob instanceof Blob) {
      formData.append("audio", blob, "recording.webm"); // Adjust file name and type if needed
    } else {
      setError("Invalid audio file");
      setUploading(false);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      setSuccess("File uploaded successfully");
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };
  return (
    <RoomContext.Provider
      value={{
        startCall,
        isCalling,
        localAudioRef,
        remoteAudioRef,
        startRecording,
        stopRecording,
        isRecording,
        audioURL,
        audioRef,
        uploadAudio,
        uploading,
        handleUpload,
        error,
        success,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
