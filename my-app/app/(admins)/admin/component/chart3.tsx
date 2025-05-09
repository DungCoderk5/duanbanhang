"use client"
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

const TaskChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx2 = canvas.getContext('2d');
    if (!ctx2) return;

    // Khởi tạo biểu đồ và lưu trữ đối tượng Chart
    chartInstanceRef.current = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: ["Jan1", "Jan8", "Jan16", "Jan24", "Jan31", "Feb1", "Feb8", "Feb16", "Feb24"],
        datasets: [{
          label: 'Tasks',
          data: [0, 100, 130, 300, 100, 200, 180, 220, 100],
          borderColor: '#00C6FF',
          borderWidth: 2,
          fill: false,
          tension: 0,
          pointRadius: 5,
          pointBackgroundColor: '#00C6FF',
          pointBorderColor: '#00C6FF',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#00C6FF',
          pointHoverBorderColor: '#00C6FF',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#cccccc' } },
          y: { ticks: { color: '#cccccc' } }
        }
      }
    });

    // Cleanup function để hủy chart khi component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="chart-container2">
      <canvas ref={chartRef} id="taskChart"></canvas>
    </div>
  );
};

export default TaskChart;
