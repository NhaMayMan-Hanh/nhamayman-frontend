import React from "react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  variant?: "spinner" | "dots" | "pulse";
}

export default function Loading({
  message = "Đang tải...",
  size = "md",
  fullScreen = false,
  variant = "spinner",
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 bg-white/80 backdrop-blur-sm"
    : "w-full";

  const SpinnerLoader = () => (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin`}
      ></div>
      <div
        className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-r-amber-400 rounded-full animate-spin`}
        style={{ animationDirection: "reverse", animationDuration: "1s" }}
      ></div>
    </div>
  );

  const DotsLoader = () => {
    const dotSize = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4",
      xl: "w-5 h-5",
    };

    return (
      <div className="flex space-x-2">
        <div
          className={`${dotSize[size]} bg-amber-500 rounded-full animate-bounce`}
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className={`${dotSize[size]} bg-amber-500 rounded-full animate-bounce`}
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className={`${dotSize[size]} bg-amber-500 rounded-full animate-bounce`}
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    );
  };

  const PulseLoader = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} bg-amber-500 rounded-full animate-pulse`}></div>
      <div
        className={`absolute inset-0 ${sizeClasses[size]} bg-amber-400 rounded-full animate-ping`}
      ></div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center min-h-[200px] py-12">
        {renderLoader()}
        {message && (
          <p className={`mt-4 ${textSizeClasses[size]} font-medium text-gray-600 animate-pulse`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// Export các variant khác nhau để dễ sử dụng
export function LoadingSpinner(props: Omit<LoadingProps, "variant">) {
  return <Loading {...props} variant="spinner" />;
}

export function LoadingDots(props: Omit<LoadingProps, "variant">) {
  return <Loading {...props} variant="dots" />;
}

export function LoadingPulse(props: Omit<LoadingProps, "variant">) {
  return <Loading {...props} variant="pulse" />;
}

// Loading Overlay - cho loading toàn màn hình với content bên dưới
export function LoadingOverlay({
  isLoading,
  children,
  message = "Đang xử lý...",
}: {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner message={message} size="lg" />
          </div>
        </div>
      )}
    </div>
  );
}

// Loading Page - cho loading full page
export function LoadingPage({ message = "Đang tải trang..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-amber-400 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
      </div>
    </div>
  );
}

// Loading Card - cho loading trong card/component
export function LoadingCard({ message = "Đang tải..." }: { message?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <LoadingSpinner message={message} size="md" />
    </div>
  );
}

// Loading Inline - cho loading nhỏ inline
export function LoadingInline({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"></div>
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}

// Loading Button - cho trạng thái loading của button
export function LoadingButton({
  loading,
  children,
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <button disabled={loading} {...props}>
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Đang xử lý...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
