"use client"
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ChartOptions } from "chart.js/auto";
const NestedDonutChart = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null); // đúng kiểu là ChartJS

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    }
  };
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Hủy biểu đồ cũ nếu có
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
  
      const labels = ["Organic", "Social", "Direct"];
      const dataValues = [80, 60, 50]; // Giá trị dữ liệu chính
      const backgroundColors = ['#b134eb', '#2979ff', '#26c6da'];

      // Khởi tạo biểu đồ
      // new Chart(ctx!, {
      //   type: "doughnut", // Phải là 'doughnut'
      //   data: {
      //     datasets: [
      //       {
      //         label: "Organic",
      //         data: [dataValues[0], 100 - dataValues[0]],
      //         backgroundColor: [backgroundColors[0], 'rgba(255, 255, 255, 0)'],
      //         borderWidth: 0,
      //       },
      //       {
      //         label: "Social",
      //         data: [dataValues[1], 100 - dataValues[1]],
      //         backgroundColor: [backgroundColors[1], 'rgba(255, 255, 255, 0)'],
      //         borderWidth: 0,
      //       //   cutout:80%
      //       },
      //       {
      //         label: "Direct",
      //         data: [dataValues[2], 100 - dataValues[2]],
      //         backgroundColor: [backgroundColors[2], 'rgba(255, 255, 255, 0)'],
      //         borderWidth: 0,
      //       }
      //     ]
      //   },
      //   options,
      //   plugins: [ChartDataLabels]
      // });
      const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [
            {
              label: "Organic",
              data: [dataValues[0], 100 - dataValues[0]],
              backgroundColor: [backgroundColors[0], 'rgba(255, 255, 255, 0)'],
              borderWidth: 0,
            },
            {
              label: "Social",
              data: [dataValues[1], 100 - dataValues[1]],
              backgroundColor: [backgroundColors[1], 'rgba(255, 255, 255, 0)'],
              borderWidth: 0,
            },
            {
              label: "Direct",
              data: [dataValues[2], 100 - dataValues[2]],
              backgroundColor: [backgroundColors[2], 'rgba(255, 255, 255, 0)'],
              borderWidth: 0,
            }
          ]
        },
        options,
        plugins: [ChartDataLabels],
      });

      chartInstanceRef.current = chart;

      // Tạo chú thích (legend) thủ công
      const legendContainer = document.getElementById("legend");
      if (legendContainer) { // Kiểm tra nếu container tồn tại
        labels.forEach((label, index) => {
          const legendItem = document.createElement("div");
          legendItem.classList.add("legend-item");

          const colorBox = document.createElement("span");
          colorBox.classList.add("legend-color");
          colorBox.style.backgroundColor = backgroundColors[index];

          const textLabel = document.createElement("span");
          textLabel.classList.add("legend-text");
          textLabel.textContent = `${label}: ${dataValues[index]}%`;

          legendItem.appendChild(colorBox);
          legendItem.appendChild(textLabel);
          legendContainer.appendChild(legendItem);
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      <div className="chart-container">
        <canvas ref={chartRef} id="nestedDonutChart"></canvas>
      </div>
      <div className="legend-container" id="legend"></div>
    </div>
  );
};

export default NestedDonutChart;
