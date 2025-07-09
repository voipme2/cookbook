import React from "react";
import { Step } from "@/types";

const Steps = ({ steps }: { steps: Step[] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
        Steps
      </h3>
      {steps.length === 0 && (
        <div className="p-4 text-gray-600 dark:text-gray-400">
          Just mix the ingredients
        </div>
      )}
      {steps.map((step: Step, idx: number) => (
        <div key={idx} className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {idx + 1}
          </div>
          <div className="flex-1 text-gray-900 dark:text-white">
            {step.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Steps; 