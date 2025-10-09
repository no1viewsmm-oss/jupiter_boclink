import { useState, useEffect } from "react";

export const LoadingDots = () => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 5 ? 0 : prev + 1));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-4 w-24 items-center justify-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-colors duration-200 ${
            dots >= i + 1 ? "bg-[#1877f2]" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default LoadingDots;
