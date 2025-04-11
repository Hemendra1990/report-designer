// components/ui/ToastMessage.tsx
import React from "react";

interface ToastMessageProps {
  type: "success" | "error";
  message: string;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ type, message }) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 dark:bg-green-900/20"
      : "bg-red-100 dark:bg-red-900/20";
  const borderColor =
    type === "success"
      ? "border-green-200 dark:border-green-800"
      : "border-red-200 dark:border-red-800";
  const textColor =
    type === "success"
      ? "text-green-800 dark:text-green-300"
      : "text-red-800 dark:text-red-300";
  const iconColor =
    type === "success"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-md shadow-lg animate-fade-in-out ${bgColor} ${borderColor} ${textColor}`}
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconColor}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default ToastMessage;
