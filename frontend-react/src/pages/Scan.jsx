import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { scanProduct } from '../api/client';
import AnimatedCard from '../components/AnimatedCard';
import Loader from '../components/Loader';
import { Camera, Upload, Repeat, CheckCircle, Crop as CropIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';
import '../styles/Scan.css';

const Scan = () => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null); // The final image to analyze (cropped)
    const [originalImgSrc, setOriginalImgSrc] = useState(null); // The raw input for cropping
    const [isScanning, setIsScanning] = useState(false);
    const [useCamera, setUseCamera] = useState(true);
    const [isCropping, setIsCropping] = useState(false);

    // Cropper State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const navigate = useNavigate();

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setOriginalImgSrc(imageSrc);
        setImgSrc(imageSrc);
        setIsCropping(false);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
        setOriginalImgSrc(null);
        setIsCropping(false);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
    };

    const startCrop = () => {
        setIsCropping(true);
    };

    const cancelCrop = () => {
        setIsCropping(false);
        // Reset zoom/crop if needed, but keeping them might be nice for re-editing
        setZoom(1);
        setCrop({ x: 0, y: 0 });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImgSrc(reader.result);
                setImgSrc(reader.result);
                setIsCropping(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedBlob = await getCroppedImg(originalImgSrc, croppedAreaPixels);
            const croppedUrl = URL.createObjectURL(croppedBlob);
            setImgSrc(croppedUrl);
            setIsCropping(false);
        } catch (e) {
            console.error(e);
            alert("Error cropping image. Please try again.");
        }
    }, [originalImgSrc, croppedAreaPixels]);

    const processScan = async () => {
        setIsScanning(true);

        try {
            const res = await fetch(imgSrc);
            const blob = await res.blob();
            const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

            const result = await scanProduct(file);

            if (result.success) {
                navigate('/results', { state: { result: result.data } });
            } else {
                alert(result.message || "Scan failed. Please try again.");
            }
        } catch (error) {
            console.error("Scan error:", error);
            alert("An error occurred during scanning.");
        } finally {
            setIsScanning(false);
        }
    };

    if (isScanning) {
        return (
            <div className="scan-loader">
                <Loader text="Analyzing Product... Consulting AI Models..." />
            </div>
        );
    }

    return (
        <div className="scan-container">
            <AnimatedCard title={isCropping ? "Adjust Image" : "Scan Product"}>
                {!isCropping && !imgSrc && (
                    <>
                        <p className="scan-hint">
                            For best results, ensure the ingredients list is well-lit and clearly visible.
                        </p>
                        <div className="scan-toggle">
                            <button
                                className={`btn-secondary ${useCamera ? 'active' : ''}`}
                                onClick={() => setUseCamera(true)}
                            >
                                <Camera size={20} /> Camera
                            </button>
                            <button
                                className={`btn-secondary ${!useCamera ? 'active' : ''}`}
                                onClick={() => setUseCamera(false)}
                            >
                                <Upload size={20} /> Upload
                            </button>
                        </div>
                    </>
                )}

                <div className="scan-preview">
                    {isCropping ? (
                        <div className="crop-wrapper">
                            <div className="crop-container">
                                <Cropper
                                    image={originalImgSrc}
                                    crop={crop}
                                    zoom={zoom} // removed aspect ratio to allow free crop or keep 1? Usually product scans can be any aspect. Default is free.
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>
                            <div className="controls">
                                <div className="slider-container">
                                    <span className="slider-label">Zoom</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(e.target.value)}
                                        className="slider"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : imgSrc ? (
                        <img src={imgSrc} alt="Captured" />
                    ) : (
                        useCamera ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "environment" }}
                            />
                        ) : (
                            <div className="upload-placeholder">
                                <Upload size={64} />
                                <p>Click below to upload an image</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        )
                    )}
                </div>

                <div className="scan-actions">
                    {isCropping ? (
                        <>
                            <button onClick={cancelCrop} className="btn-secondary">
                                <Repeat size={20} /> Cancel
                            </button>
                            <button onClick={showCroppedImage} className="btn-primary">
                                <CheckCircle size={20} /> Done
                            </button>
                        </>
                    ) : imgSrc ? (
                        <>
                            <button onClick={retake} className="btn-secondary">
                                <Repeat size={20} /> Retake
                            </button>
                            <button onClick={startCrop} className="btn-secondary">
                                <CropIcon size={20} /> Crop
                            </button>
                            <button onClick={processScan} className="btn-primary">
                                <CheckCircle size={20} /> Analyze
                            </button>
                        </>
                    ) : (
                        useCamera && (
                            <button onClick={capture} className="btn-primary capture-btn">
                                <Camera size={32} />
                            </button>
                        )
                    )}
                </div>
            </AnimatedCard>
        </div>
    );
};

export default Scan;