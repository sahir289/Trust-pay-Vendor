import Chart from "@/components/Base/Chart";
import { ChartData, ChartOptions } from "chart.js/auto";
import { getColor } from "@/utils/colors";
// import { selectColorScheme } from "@/redux-toolkit/slices/common/colorScheme/colorSchemeSlice";
import { selectDarkMode } from "@/redux-toolkit/slices/common/darkMode/darkModeSlice";
import { useAppSelector } from "@/redux-toolkit/hooks/useAppSelector";
import { useMemo } from "react";

// interface Dataset {
//   label: string;
//   data: Array<{
//     x: string;
//     y: number;
//     total?: number;
//     success?: number;
//     utrSubmitted?: number;
//     utrRatio?: number;
//   }>;
//   borderColor?: string;
//   tension?: number;
// }

interface MainProps {
  width?: number | "auto";
  height?: number | "auto";
  className?: string;
  datasets?: Array<{
    merchantCode: string;
    stats: Array<{
      interval: string;
      total: number;
      success: number;
      utrSubmitted: number;
      successRatio: number;
      utrRatio: number;
    }>;
  }>;
  options?: ChartOptions;
}

function Main({ width = "auto", height = "auto", className = "", datasets = [], options = {} }: MainProps) {
  // const colorScheme = useAppSelector(selectColorScheme);
  const darkMode = useAppSelector(selectDarkMode);

  const transformedDatasets = useMemo(() => {
    return datasets.map((merchant) => ({
      label: merchant.merchantCode,
      data: merchant.stats.map((stat) => stat.successRatio),
      borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
      backgroundColor: 'transparent',
      tension: 0.4,
      pointStyle: 'circle',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false
    }));
  }, [datasets]);

  const chartData: ChartData = {
    labels: datasets[0]?.stats.map(stat => stat.interval) || [],
    datasets: transformedDatasets
  };

  const defaultOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: getColor("slate.500", 0.8),
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        ...options.plugins?.tooltip
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: getColor("slate.500", 0.8)
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? getColor("slate.500", 0.3) : getColor("slate.300"),
          // drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: getColor("slate.500", 0.8),
          callback: (value) => `${value}%`
        }
      }
    },
    ...options
  };

  if (!datasets?.length) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <Chart
      type="line"
      width={width}
      height={height}
      data={chartData}
      options={defaultOptions}
      className={className}
    />
  );
}

export default Main;
