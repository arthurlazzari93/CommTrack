// src/variables/charts.js

// Extensão do Chart.js para barras arredondadas (opcional)
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';

// Registrar os componentes necessários
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Legend,
  Tooltip
);


// Verifica se Chart está disponível no objeto window
if (typeof window !== "undefined" && window.Chart) {
  // Extensão para tornar as barras arredondadas
  Chart.elements.Rectangle.prototype.draw = function () {
    const ctx = this._chart.ctx;
    const vm = this._view;
    const left = vm.x - vm.width / 2;
    const right = vm.x + vm.width / 2;
    const top = vm.y;
    const bottom = vm.base;
    const borderWidth = vm.borderWidth;
    const cornerRadius = 6;

    ctx.beginPath();
    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = borderWidth;

    // Calcula os cantos arredondados
    ctx.moveTo(left + cornerRadius, bottom);
    ctx.lineTo(left + cornerRadius, top);
    ctx.quadraticCurveTo(left + cornerRadius, top, left, top);
    ctx.lineTo(left, bottom - cornerRadius);
    ctx.quadraticCurveTo(left, bottom - cornerRadius, left + cornerRadius, bottom);
    ctx.closePath();
    ctx.fill();
    if (borderWidth) {
      ctx.stroke();
    }
  };
}

// Opções globais dos gráficos
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return data.datasets[tooltipItem.datasetIndex].label + ": " + tooltipItem.yLabel;
      },
    },
  },
  legend: {
    display: false,
  },
  scales: {
    x: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          fontColor: "#9aa0ac",
        },
      },
    ],
    y: [
      {
        gridLines: {
          color: "#e9ecef",
          zeroLineColor: "#e9ecef",
        },
        ticks: {
          beginAtZero: true,
          fontColor: "#9aa0ac",
        },
      },
    ],
  },
};

// Função para gerar dados do Gráfico de Linha
export const getLineChartData = (labels, data) => ({
  labels,
  datasets: [
    {
      label: "Total de Vendas",
      data,
      fill: false,
      borderColor: "#5e72e4",
      backgroundColor: "#5e72e4",
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: "#fff",
      pointBorderColor: "#5e72e4",
      pointHoverBackgroundColor: "#5e72e4",
      pointHoverBorderColor: "#fff",
    },
  ],
});

// Função para gerar dados do Gráfico de Barras
export const getBarChartData = (labels, data) => ({
  labels,
  datasets: [
    {
      label: "Vendas por Consultor",
      data,
      backgroundColor: "rgba(94, 114, 228, 0.6)",
      borderColor: "rgba(94, 114, 228, 1)",
      borderWidth: 1,
    },
  ],
});

// Função para gerar dados do Gráfico de Pizza
export const getPieChartData = (labels, data) => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
      hoverBackgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
    },
  ],
});

// Função para gerar dados do Gráfico de Donut
export const getDoughnutChartData = (labels, data) => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor: [
        "#36A2EB",
        "#FFCE56",
        "#FF6384",
        "#4BC0C0",
      ],
      hoverBackgroundColor: [
        "#36A2EB",
        "#FFCE56",
        "#FF6384",
        "#4BC0C0",
      ],
    },
  ],
});
