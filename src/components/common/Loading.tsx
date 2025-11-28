import Lottie from "lottie-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "full";
  overlay?: boolean;
}

export function Loading({ message = "Đang tải...", size = "md", overlay = false }: LoadingProps) {
  // Lottie animation data cho loading spinner
  const loadingAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 120 }] },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 10 },
              },
              {
                ty: "st",
                c: { a: 0, k: [0.4, 0.6, 1, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 2,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
          },
        ],
      },
    ],
  };

  const sizeMap = {
    sm: { width: 80, height: 80 },
    md: { width: 150, height: 150 },
    lg: { width: 200, height: 200 },
    full: { width: 300, height: 300 },
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Lottie animationData={loadingAnimation} loop style={sizeMap[size]} />
      {message && <p className="text-gray-600 text-lg font-medium animate-pulse">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}
