import { useEffect, useState } from "react";

function LoadingDots() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDotCount((currentCount) =>
        currentCount === 3 ? 1 : currentCount + 1,
      );
    }, 350);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <span aria-hidden="true" className="inline-block w-4 text-left">
      {".".repeat(dotCount)}
    </span>
  );
}

export default LoadingDots;
