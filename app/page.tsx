'use client';

import React from 'react';
import data from '../public/data.json';
import ChocolateChart from './components/ChocolateChart';

export default function Home() {
  return (
    <div className="main-container">
      <ChocolateChart data={data} />
    </div>
  );
}