'use client';

import React, { useState, useEffect } from 'react';
import data from '../public/data.json';

export default function Home() {
  return (
    <div>
      <h2>Data Visualization</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}