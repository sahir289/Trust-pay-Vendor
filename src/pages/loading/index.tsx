import React from 'react';
import { Spin } from 'antd';

const Loading: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-light text-dark dark:bg-darkmode-800 dark:text-white transition-colors">
      <Spin size="large" />
      <p className="text-lg font-medium">Loading, please wait...</p>
    </div>
  );
};

export default Loading;
