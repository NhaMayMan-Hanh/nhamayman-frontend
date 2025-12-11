"use client";

import { useState, useEffect } from "react";
import { Gift, X, Sparkles } from "lucide-react";

interface Prize {
  id: number;
  text: string;
  color: string;
  isWin: boolean;
}

const LuckyWheel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [buttonPulse, setButtonPulse] = useState(true);

  const prizes: Prize[] = [
    { id: 1, text: "Chúc bạn may mắn lần sau", color: "#4ECDC4", isWin: false },
    { id: 2, text: "Bạn đã nhận được 1 phần thưởng", color: "#FF6B6B", isWin: true },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setButtonPulse((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Random result
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    const prizeIndex = prizes.findIndex((p) => p.id === randomPrize.id);

    // Calculate rotation
    const segmentAngle = 360 / prizes.length;
    const targetAngle = prizeIndex * segmentAngle;
    const spins = 5; // Number of full rotations
    const finalRotation = 360 * spins + (360 - targetAngle) + segmentAngle / 2;

    setRotation(finalRotation);

    // Show result after animation
    setTimeout(() => {
      setIsSpinning(false);
      setResult(randomPrize);
    }, 4000);
  };

  const resetWheel = () => {
    setResult(null);
    setRotation(0);
  };

  return (
    <>
      {/* Floating Button - Responsive */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed cursor-pointer bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 ${
          buttonPulse ? "scale-110" : "scale-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          animation: "float 3s ease-in-out infinite",
        }}
        aria-label="Vòng quay may mắn"
      >
        <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
        </div>
      </button>

      {/* Modal - Responsive */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] sm:max-w-md md:max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                resetWheel();
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Title */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Vòng Quay May Mắn
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">Quay và nhận phần thưởng của bạn!</p>
            </div>

            {/* Wheel Container */}
            <div className="relative mb-4 sm:mb-6">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[12px] sm:border-l-[15px] border-r-[12px] sm:border-r-[15px] border-t-[24px] sm:border-t-[30px] border-l-transparent border-r-transparent border-t-red-500"></div>
              </div>

              {/* Wheel */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning
                      ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                      : "none",
                  }}
                >
                  {prizes.map((prize, index) => {
                    const segmentAngle = 360 / prizes.length;
                    const startAngle = index * segmentAngle - 90;
                    const endAngle = startAngle + segmentAngle;

                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    const x1 = 100 + 90 * Math.cos(startRad);
                    const y1 = 100 + 90 * Math.sin(startRad);
                    const x2 = 100 + 90 * Math.cos(endRad);
                    const y2 = 100 + 90 * Math.sin(endRad);

                    const largeArc = segmentAngle > 180 ? 1 : 0;

                    return (
                      <g key={prize.id}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={prize.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}

                  {/* Center Circle */}
                  <circle cx="100" cy="100" r="15" fill="white" stroke="#333" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div
                className={`text-center mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl ${
                  result.isWin
                    ? "bg-green-50 border-2 border-green-300"
                    : "bg-gray-50 border-2 border-gray-300"
                }`}
              >
                <p
                  className={`font-semibold text-sm sm:text-base md:text-lg ${
                    result.isWin ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  {result.text}
                </p>
              </div>
            )}

            {/* Spin Button */}
            <button
              onClick={result ? resetWheel : spinWheel}
              disabled={isSpinning}
              className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-300 ${
                isSpinning
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 active:scale-95"
              }`}
            >
              {isSpinning ? "Đang quay..." : result ? "Quay lại" : "Quay ngay!"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
};

export default LuckyWheel;
