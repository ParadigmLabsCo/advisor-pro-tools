import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Assuming savingsData and needsData are correctly structured and contain all needed points.
// Combine them into a single array with a shared age key.
const combineData = (savingsData, needsData) => {
  const combinedData = [];
  // Assuming both arrays are sorted by age
  for (let i = 0; i < savingsData.length; i++) {
    combinedData.push({
      age: savingsData[i].age,
      savings: savingsData[i].value,
      needs:
        needsData.find((item) => item.age === savingsData[i].age)?.value || 0,
    });
  }
  return combinedData;
};

const RetirementChart = ({ savingsData, needsData }) => {
  const combinedData = combineData(savingsData, needsData);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        width={500}
        height={300}
        data={combinedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="age" domain={["dataMin", "dataMax"]} />
        <YAxis />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value)
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="savings"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="needs" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RetirementChart;
