/**
 * Toast Demo Component
 * Demonstrates the new convenience methods in the useToast hook
 */

import React from "react";
import { useToast } from "../features/ui/hooks/useToast";

export const ToastDemo: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning, showToast } = useToast();

  return (
    <div className="p-6 space-y-4 max-w-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Enhanced Toast API Demo
      </h2>
      
      <div className="space-y-3">
        <button
          onClick={() => showSuccess("Operation completed successfully!")}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Show Success Toast
        </button>
        
        <button
          onClick={() => showError("Something went wrong!")}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Show Error Toast
        </button>
        
        <button
          onClick={() => showInfo("Here's some useful information")}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Show Info Toast
        </button>
        
        <button
          onClick={() => showWarning("Please be careful!")}
          className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
        >
          Show Warning Toast
        </button>
        
        <button
          onClick={() => showToast("Old API still works", "info")}
          className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Legacy showToast (still works)
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">API Improvements:</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>✅ <code>showSuccess()</code> - cleaner than <code>showToast(msg, "success")</code></li>
          <li>✅ <code>showError()</code> - more intuitive</li>
          <li>✅ <code>showInfo()</code> - shorter syntax</li>
          <li>✅ <code>showWarning()</code> - better DX</li>
          <li>✅ Backward compatible</li>
          <li>✅ Type-safe</li>
        </ul>
      </div>
    </div>
  );
};