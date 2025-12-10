import Chart from "@/components/Base/Chart";
import { ChartOptions, TooltipItem } from "chart.js";
import { getColor } from "@/utils/colors";
// import { selectColorScheme } from "@/redux-toolkit/slices/common/colorScheme/colorSchemeSlice";
import { selectDarkMode } from "@/redux-toolkit/slices/common/darkMode/darkModeSlice";
import { useAppSelector } from "@/redux-toolkit/hooks/useAppSelector";
import React, { useMemo } from "react";
import dayjs from "dayjs";

interface ChartData {
  date: string;
  amount: number;
  count: number;
  totalCommission?: number; // Added totalCommission property
}

interface DataSet {
  data: ChartData[];
  label: string;
  color: string; // color for the dataset
  type?: string;
  stack?: string;
  barPercentage?: number;
}

interface MainProps extends React.ComponentPropsWithoutRef<"canvas"> {
  width?: number | "auto";
  height?: number | "auto";
  datasets: DataSet[];
  className?: string;
}

function Main({ 
  width = "auto", 
  height = "auto", 
  className = "", 
  datasets = []
}: MainProps) {
  const props = {
    width: width,
    height: height,
    className: className,
  };

  // const colorScheme = useAppSelector(selectColorScheme);
  const darkMode = useAppSelector(selectDarkMode);

  const combinedDates = useMemo(() => {
    const allDates = datasets.flatMap(dataset => 
      dataset.data.map(entry => entry.date)
    );
    
    // Sort dates using dayjs for proper chronological order
    return [...new Set(allDates)].sort((a, b) => {
      return dayjs(b, 'DD-MM-YYYY').tz('Asia/Kolkata').valueOf() - dayjs(a, 'DD-MM-YYYY').tz('Asia/Kolkata').valueOf();
    });
  }, [datasets]);

  const data = useMemo(() => ({
    labels: combinedDates,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      label: dataset.label,
      data: dataset.data?.map(entry => entry.amount) || [],
      backgroundColor: `rgba(${dataset.color}, 0.5)`,
      borderColor: `rgba(${dataset.color}, 0.7)`,
      borderWidth: 1,
      type: "bar" as const,
      categoryPercentage: 0.8, // Controls space between groups
      barPercentage: 0.9,     // Controls bar width within group
    }))
  }), [datasets, combinedDates]); 

  // Configure chart options
  const options: ChartOptions = useMemo(() => ({
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: getColor("slate.500", 0.8),
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              const dataPoint = datasets[context.datasetIndex]?.data[context.dataIndex];
              const count = dataPoint?.count;
              
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
              }).format(value);

              if (count) {
                label += ` (count: ${count})`;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,  // Important: set to false to show bars side by side
        ticks: {
          font: { size: 12 },
          color: getColor("slate.500", 0.8),
        },
        grid: { display: false }
      },
      y: {
        stacked: false,  // Important: set to false to show actual values
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          color: getColor("slate.500", 0.8),
        },
        grid: {
          color: darkMode ? getColor("slate.500", 0.3) : getColor("blue.300"),
          borderDash: [2, 2],
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  }), [darkMode, datasets]);

  return (
    <Chart
      type="bar"
      width={props.width}
      height={props.height}
      data={data}
      options={options}
      className={props.className}
    />
  );
}

export default Main;
