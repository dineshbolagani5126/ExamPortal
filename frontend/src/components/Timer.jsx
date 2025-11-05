import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '../utils/helpers';
import { FaClock } from 'react-icons/fa';

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const getTimerColor = () => {
    const percentageLeft = (timeLeft / (duration * 60)) * 100;
    if (percentageLeft > 50) return 'text-green-600';
    if (percentageLeft > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex items-center space-x-2 text-2xl font-bold ${getTimerColor()}`}>
      <FaClock />
      <span>{formatTimeRemaining(timeLeft)}</span>
    </div>
  );
};

export default Timer;
