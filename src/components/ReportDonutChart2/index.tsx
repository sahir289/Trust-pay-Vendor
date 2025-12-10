/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from "react";
import Chart from "@/components/Base/Chart";
import { ChartData, ChartOptions } from "chart.js/auto";
import { getColor } from "@/utils/colors";
import { selectColorScheme } from "@/redux-toolkit/slices/common/colorScheme/colorSchemeSlice";
import { selectDarkMode } from "@/redux-toolkit/slices/common/darkMode/darkModeSlice";
import { useAppSelector } from "@/redux-toolkit/hooks/useAppSelector";
import { useMemo } from "react";

interface DataItem {
  status: string;
  amount: string;
}

interface MainProps extends React.ComponentPropsWithoutRef<"canvas"> {
  width?: number | "auto";
  height?: number | "auto";
  inputData?: Array<DataItem>;
}

function Main({ width = "auto", height = "auto", inputData = [], className = "" }: MainProps) {
  const props = { width, height, className, inputData };
  const colorScheme = useAppSelector(selectColorScheme);
  const darkMode = useAppSelector(selectDarkMode);

  // ✅ Generate data
  const generateData = () => [
    inputData.filter(item => item.status === "Dropped" || item.status === "Failed" || item.status === "Rejected").length,
    inputData.filter(item => item.status === "Duplicate" || item.status === "Dispute" || item.status === "Bank Mismatch").length,
    inputData.filter(item => item.status === "Pending" || item.status === "Image Pending").length,
    inputData.filter(item => item.status === "Assigned").length,
    inputData.filter(item => item.status === "Initiated").length,
    inputData.filter(item => item.status === "Success").length,
  ];
  const chartData = useMemo(() => generateData(), []);

  // ✅ Compute total count and total commission
  // const totalCount = inputData.length;
  // const totalAmount = inputData.reduce((sum, item) => {
  //   // Remove ₹ symbol, replace commas, and convert to float
  //   const numericAmount = parseFloat(item.amount.replace(/[₹,]/g, ''));
  //   return sum + numericAmount;
  // }, 0);
  // const commissionRate = 0.1; // Example 10% commission rate
  // const totalCommission = useMemo(() => (totalAmount * commissionRate).toFixed(2), [totalAmount]);

  const payinColors = () => [
    getColor("danger", 0.9),
    getColor("pending", 0.9),
    getColor("warning", 0.9),
    getColor("info", 0.9),
    getColor("success", 0.9),
    getColor("primary", 0.9),
  ];

  const data: ChartData = useMemo(() => {
    return {
      labels: ["Failed", "Dispute", "Pending", "Assigned", "Initiated", "Success"],
      datasets: [
        {
          data: chartData,
          backgroundColor: colorScheme ? payinColors() : "",
          hoverBackgroundColor: colorScheme ? payinColors() : "",
          borderWidth: 5,
          borderColor: darkMode ? getColor("darkmode.700") : getColor("slate.200"),
        },
      ],
    };
  }, [colorScheme, darkMode]);

  const options: ChartOptions = useMemo(() => {
    return {
      maintainAspectRatio: false,
      cutout: "82%",
      plugins: {
        legend: {
          display: false,
        },
      },
    };
  }, [colorScheme, darkMode]);

  // ✅ FINAL FIX: Ensure text is drawn **AFTER** the chart has fully rendered
  // const centerTextPlugin: Plugin<"doughnut"> = {
  //   id: "centerText",
  //   afterDatasetsDraw: (chart) => {
  //     const { ctx, chartArea } = chart;
  //     if (!chartArea) return;

  //     // Calculate center position
  //     const centerX = (chartArea.left + chartArea.right) / 2;
  //     const centerY = (chartArea.top + chartArea.bottom) / 2;

  //     ctx.save();

  //     // **Total Count** (Larger text)
  //     ctx.font = "bold 18px sans-serif";
  //     ctx.textAlign = "center";
  //     ctx.textBaseline = "middle";
  //     ctx.fillStyle = darkMode ? "#fff" : "#000";
  //     ctx.fillText(`Total: ${totalCount}`, centerX, centerY - 10);

  //     // **Total Commission** (Smaller text)
  //     ctx.font = "bold 14px sans-serif";
  //     ctx.fillStyle = darkMode ? "#ccc" : "#555";
  //     ctx.fillText(`Commission: $${totalCommission}`, centerX, centerY + 15);

  //     ctx.restore();
  //   },
  // };

  return (
    <Chart
      type="doughnut"
      width={props.width}
      height={props.height}
      data={data}
      options={options}
      className={props.className}
      // plugins={[centerTextPlugin]} // ✅ Attach final fix plugin
    />
  );
}

export default Main;
