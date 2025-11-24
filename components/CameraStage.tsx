import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Video, StopCircle, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { Accessory } from '../types';

declare global {
  interface Window {
    faceLandmarksDetection: any;
    tf: any;
  }
}

interface CameraStageProps {
  onCapture: (imageBase64: string) => void;
  isProcessing: boolean;
  selectedAccessory: Accessory | null;
}

export const CameraStage: React.FC<CameraStageProps> = ({ onCapture, isProcessing, selectedAccessory }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [streamActive, setStreamActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string>('');
  
  const modelRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Use a ref to track selected accessory inside the animation loop without restarting it
  const accessoryRef = useRef(selectedAccessory);
  useEffect(() => {
    accessoryRef.current = selectedAccessory;
  }, [selectedAccessory]);

  // 1. Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            // Critical: Must play the video to process frames
            videoRef.current?.play().catch(e => console.error("Play error", e));
            setStreamActive(true);
            setError('');
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Load Face Mesh Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Ensure the specific API structure we need exists
        if (window.faceLandmarksDetection && window.faceLandmarksDetection.SupportedPackages) {
          // Load the MediaPipe FaceMesh model
          modelRef.current = await window.faceLandmarksDetection.load(
            window.faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 }
          );
          setIsModelLoading(false);
        } else {
          // If scripts aren't loaded yet or API is mismatching, retry briefly
          if (!modelRef.current) {
             setTimeout(loadModel, 500);
          }
        }
      } catch (err) {
        console.error("Model load error:", err);
        // Don't block video feed on model error, just disable AR
        setIsModelLoading(false); 
      }
    };
    
    loadModel();
  }, []);

  // 3. Drawing Logic
  const drawAccessory = (ctx: CanvasRenderingContext2D, keypoints: any[], accessory: Accessory) => {
    const getPt = (index: number) => {
      const p = keypoints[index];
      if (!p) return { x: 0, y: 0 };
      // Flip X coordinate because we mirrored the canvas context
      return { x: ctx.canvas.width - p[0], y: p[1] }; 
    };

    ctx.save();
    
    if (accessory.id === 'nemes') {
      // Neon Glow Effect for Nemes
      ctx.shadowColor = 'rgba(255, 215, 0, 0.8)'; // Gold Glow
      ctx.shadowBlur = 25;

      const top = getPt(10);
      const left = getPt(234);
      const right = getPt(454);
      const chin = getPt(152);
      
      ctx.beginPath();
      ctx.moveTo(top.x, top.y - 120);
      ctx.bezierCurveTo(left.x - 80, top.y, left.x - 60, chin.y, left.x - 20, chin.y + 100);
      ctx.lineTo(right.x + 20, chin.y + 100);
      ctx.bezierCurveTo(right.x + 60, chin.y, right.x + 80, top.y, top.x, top.y - 120);
      
      const grad = ctx.createLinearGradient(left.x, top.y, right.x, chin.y);
      grad.addColorStop(0, '#DAA520');
      grad.addColorStop(0.2, '#191970');
      grad.addColorStop(0.4, '#DAA520');
      grad.addColorStop(0.6, '#191970');
      grad.addColorStop(1, '#DAA520');
      
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#B8860B';
      ctx.stroke();
    } 
    else if (accessory.id === 'nefertiti') {
      // Neon Glow Effect for Nefertiti Crown
      ctx.shadowColor = 'rgba(59, 130, 246, 0.8)'; // Blue Glow
      ctx.shadowBlur = 30;

      const top = getPt(10);
      const left = getPt(127);
      const right = getPt(356);
      const crownHeight = 220;
      
      ctx.beginPath();
      ctx.moveTo(left.x, top.y - 20);
      ctx.lineTo(left.x - 10, top.y - crownHeight);
      ctx.lineTo(right.x + 10, top.y - crownHeight);
      ctx.lineTo(right.x, top.y - 20);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(left.x, top.y, right.x, top.y);
      grad.addColorStop(0, '#1e3a8a');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(left.x, top.y - 20);
      ctx.lineTo(right.x, top.y - 20);
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#FFD700';
      ctx.stroke();
    }
    else if (accessory.id === 'collar') {
      // Neon Glow for Collar
      ctx.shadowColor = 'rgba(245, 158, 11, 0.7)'; // Amber/Gold Glow
      ctx.shadowBlur = 25;

      const neck = getPt(152);
      const lShoulder = { x: neck.x - 120, y: neck.y + 150 };
      const rShoulder = { x: neck.x + 120, y: neck.y + 150 };
      
      ctx.beginPath();
      ctx.moveTo(neck.x, neck.y + 20);
      ctx.bezierCurveTo(lShoulder.x, neck.y + 40, lShoulder.x, lShoulder.y, neck.x, lShoulder.y + 20);
      ctx.bezierCurveTo(rShoulder.x, lShoulder.y, rShoulder.x, neck.y + 40, neck.x, neck.y + 20);
      
      const radGrad = ctx.createRadialGradient(neck.x, neck.y + 80, 10, neck.x, neck.y + 80, 120);
      radGrad.addColorStop(0, '#EF4444');
      radGrad.addColorStop(0.3, '#3B82F6');
      radGrad.addColorStop(0.6, '#10B981');
      radGrad.addColorStop(1, '#F59E0B');
      
      ctx.fillStyle = radGrad;
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    else if (accessory.id === 'makeup') {
      // Subtle mystical glow for makeup
      ctx.shadowColor = 'rgba(45, 212, 191, 0.5)'; // Teal subtle glow
      ctx.shadowBlur = 15;

      const leftEye = [getPt(33), getPt(160), getPt(158), getPt(133), getPt(153), getPt(144)];
      const rightEye = [getPt(362), getPt(385), getPt(387), getPt(263), getPt(373), getPt(380)];
      
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      
      [leftEye, rightEye].forEach(eye => {
        ctx.beginPath();
        ctx.moveTo(eye[0].x, eye[0].y);
        for (let i = 1; i < eye.length; i++) ctx.lineTo(eye[i].x, eye[i].y);
        ctx.closePath();
        ctx.stroke();
        
        const corner = eye[3];
        ctx.beginPath();
        ctx.moveTo(corner.x, corner.y);
        ctx.quadraticCurveTo(corner.x + (corner.x > ctx.canvas.width/2 ? 40 : -40), corner.y - 5, corner.x + (corner.x > ctx.canvas.width/2 ? 60 : -60), corner.y - 20);
        ctx.stroke();
      });
    }
    else if (accessory.id === 'anubis') {
       // Underworld Glow
       ctx.shadowColor = 'rgba(147, 51, 234, 0.8)'; // Purple Glow
       ctx.shadowBlur = 35;

       const top = getPt(10);
       const chin = getPt(152);
       const leftCheek = getPt(234);
       const rightCheek = getPt(454);

       ctx.fillStyle = '#111';
       ctx.beginPath();
       ctx.moveTo(leftCheek.x, top.y - 50);
       ctx.lineTo(rightCheek.x, top.y - 50);
       ctx.lineTo(rightCheek.x - 20, chin.y);
       ctx.lineTo(chin.x, chin.y + 40);
       ctx.lineTo(leftCheek.x + 20, chin.y);
       ctx.fill();

       ctx.beginPath();
       ctx.moveTo(leftCheek.x, top.y - 50);
       ctx.lineTo(leftCheek.x - 40, top.y - 200);
       ctx.lineTo(top.x, top.y - 50);
       ctx.lineTo(rightCheek.x + 40, top.y - 200);
       ctx.lineTo(rightCheek.x, top.y - 50);
       ctx.fill();

       ctx.strokeStyle = '#FFD700';
       ctx.lineWidth = 2;
       ctx.stroke();
    }

    ctx.restore();
  };

  // 4. Main Render Loop
  const renderFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState >= 2 && ctx) {
      // Ensure canvas matches video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // 1. Draw Video (Mirrored)
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 2. Draw AR (if model loaded and accessory selected)
      if (modelRef.current && accessoryRef.current) {
        try {
          const predictions = await modelRef.current.estimateFaces({ input: video });
          if (predictions.length > 0) {
            // Use scaledMesh for v0.0.3
            const keypoints = predictions[0].scaledMesh;
            if (keypoints) {
               drawAccessory(ctx, keypoints, accessoryRef.current);
            }
          }
        } catch (e) {
          // Ignore transient errors during detection
        }
      }
    }

    requestRef.current = requestAnimationFrame(renderFrame);
  }, []); // Dependencies empty because we use refs

  // Start loop when stream is active
  useEffect(() => {
    if (streamActive) {
      requestRef.current = requestAnimationFrame(renderFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [streamActive, renderFrame]);

  // Snapshot
  const takeSnapshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `kemetic-snap-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Transmute Trigger
  const handleTransmute = () => {
    if (videoRef.current) {
       const tempCanvas = document.createElement('canvas');
       tempCanvas.width = videoRef.current.videoWidth;
       tempCanvas.height = videoRef.current.videoHeight;
       const ctx = tempCanvas.getContext('2d');
       if(ctx) {
         ctx.drawImage(videoRef.current, 0, 0);
         onCapture(tempCanvas.toDataURL('image/jpeg', 0.8));
       }
    }
  };

  // Recording
  const toggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (canvasRef.current) {
        try {
          // @ts-ignore - captureStream is a standard API but might be missing in specific TS definitions
          const stream = canvasRef.current.captureStream(30);
          
          // Add audio if available
          if (videoRef.current?.srcObject) {
             const videoStream = videoRef.current.srcObject as MediaStream;
             const audioTracks = videoStream.getAudioTracks();
             if (audioTracks.length > 0) {
                 stream.addTrack(audioTracks[0]);
             }
          }

          // Robust MIME Type Selection
          const mimeTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4',
          ];
          
          let selectedMimeType = '';
          let options: MediaRecorderOptions | undefined = undefined;

          for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              selectedMimeType = type;
              options = { mimeType: type };
              break;
            }
          }

          // If no supported type found, undefined options let the browser choose defaults
          const mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = mediaRecorder;
          chunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const type = selectedMimeType || 'video/webm';
            const blob = new Blob(chunksRef.current, { type });
            const url = URL.createObjectURL(blob);
            const ext = type.includes('mp4') ? 'mp4' : 'webm';
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `kemetic-video-${Date.now()}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          };

          mediaRecorder.start();
          setIsRecording(true);
          setRecordingTime(0);
        } catch (err) {
            console.error("Recording failed to start:", err);
            setError("Video recording failed. Your browser may not support this feature.");
            setIsRecording(false);
        }
      }
    }
  };

  // Timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-stone-800 group">
      {/* Source Video (Hidden) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute opacity-0 pointer-events-none"
      />

      {/* Main AR Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover"
      />

      {/* Loading State */}
      {(isModelLoading || !streamActive) && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-stone-500 bg-black/80 z-20">
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-10 h-10 mb-2 animate-spin text-amber-500" />
            <p>{isModelLoading ? "Loading AR Models..." : "Summoning the reflection..."}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/95 z-30 text-center p-6">
           <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
           <p className="text-stone-300 font-heading text-lg">{error}</p>
           <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-amber-600 text-black font-bold rounded hover:bg-amber-500 transition">Retry</button>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-red-900/80 text-red-100 rounded-full animate-pulse z-20">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs font-mono">REC {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center items-center gap-8 z-20">
        
        <button
          onClick={takeSnapshot}
          disabled={isRecording || isProcessing || !streamActive}
          className="p-4 rounded-full bg-stone-800/50 text-stone-300 hover:bg-stone-700 hover:text-white hover:scale-110 transition-all backdrop-blur-sm"
          title="Take Snapshot"
        >
          <Camera size={24} />
        </button>

        <button
          onClick={handleTransmute}
          disabled={isProcessing || isRecording || !streamActive}
          className={`
            relative group/btn flex items-center justify-center w-24 h-24 rounded-full border-4 
            ${isProcessing ? 'border-stone-600' : 'border-amber-500/50 hover:border-amber-400'}
            bg-black/40 backdrop-blur-sm transition-all duration-300 active:scale-95
          `}
          title="Divine Transmutation (Generative AI)"
        >
           {isProcessing ? (
             <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
           ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-80 group-hover/btn:opacity-100 transition-opacity shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
              <RefreshCw className="absolute w-8 h-8 text-black animate-[spin_10s_linear_infinite]" />
            </>
           )}
        </button>

        <button
          onClick={toggleRecording}
          disabled={isProcessing || !streamActive}
          className={`
            p-4 rounded-full transition-all backdrop-blur-sm hover:scale-110
            ${isRecording ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-stone-800/50 text-stone-300 hover:bg-stone-700 hover:text-white'}
          `}
          title={isRecording ? "Stop Recording" : "Record Video"}
        >
          {isRecording ? <StopCircle size={24} /> : <Video size={24} />}
        </button>
      </div>
    </div>
  );
};