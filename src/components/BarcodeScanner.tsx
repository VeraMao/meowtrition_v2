import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please enter the barcode manually.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="min-h-screen bg-black/90 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between">
        <h3 className="text-[#3B2E25]">Scan Barcode</h3>
        <button onClick={handleClose} className="p-2 text-[#6E5C50] active:scale-95">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {isScanning ? (
          <div className="relative w-full max-w-sm aspect-square">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-3/4 h-1/3 border-2 border-[#F4CDA5] rounded-xl"
                style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-[#F4CDA5]/20 rounded-full flex items-center justify-center">
              <Camera className="w-16 h-16 text-[#F4CDA5]" />
            </div>
            <div className="space-y-2">
              <p className="text-white">Position the barcode within the frame</p>
              <p className="text-[#F4CDA5]">or enter it manually below</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white p-6 space-y-4">
        {!isScanning && (
          <button
            onClick={startCamera}
            className="w-full py-4 bg-[#F4CDA5] text-[#3B2E25] rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        )}

        {isScanning && (
          <button
            onClick={stopCamera}
            className="w-full py-4 bg-[#E8D8C8] text-[#3B2E25] rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center"
          >
            Stop Camera
          </button>
        )}

        <div className="space-y-2">
          <label className="text-[#6E5C50]">Enter Barcode Manually</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="123456789012"
              className="flex-1 px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4CDA5] text-[#3B2E25]"
              style={{ border: '1px solid rgba(59, 46, 37, 0.1)' }}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualBarcode.trim()}
              className={`px-6 py-3 rounded-xl transition-all flex items-center justify-center ${
                manualBarcode.trim()
                  ? 'bg-[#F4CDA5] text-[#3B2E25] active:scale-95'
                  : 'bg-[#E8D8C8] text-[#6E5C50] opacity-50'
              }`}
            >
              Submit
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-background rounded-xl">
          <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Note: Camera scanning is simulated. In production, this would use a barcode scanning library to automatically detect and read barcodes.
          </p>
        </div>
      </div>
    </div>
  );
}
