"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";

const csvPath = "/synthetic_calls_scenarios.csv";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Analysis() {
    const [scenarios, setScenarios] = useState<string[]>([]);
    const [scenarioCounts, setScenarioCounts] = useState<number[]>([]);
    const [callLengths, setCallLengths] = useState<number[]>([]);
    const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedChart, setSelectedChart] = useState("Scenario Frequency");
    const [scenarioFilter, setScenarioFilter] = useState(""); // Filter by Scenario
    const [nameFilter, setNameFilter] = useState(""); // Filter by Name
    const [data, setData] = useState<any[]>([]); // Store raw CSV data

    useEffect(() => {
        fetch(csvPath)
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setData(results.data); // Store the full data
                        setLoading(false);

                        // Extract unique scenarios for the dropdown
                        const uniqueScenarios = [
                            ...new Set(results.data.map((row: any) => row["Phishing Scenario"]))
                        ];
                        setScenarios(uniqueScenarios);
                    },
                });
            })
            .catch((error) => {
                console.error("Error loading CSV:", error);
                setLoading(false);
            });
    }, []);

    // Filter data based on scenario and name
    const filteredData = data.filter((row) => {
        const matchesScenario = row["Phishing Scenario"]?.toLowerCase().includes(scenarioFilter.toLowerCase()) || scenarioFilter === "";
        const matchesName = row["Name"]?.toLowerCase().includes(nameFilter.toLowerCase()) || nameFilter === "";
        return matchesScenario && matchesName;
    });

    // Recompute counts based on the filtered data
    useEffect(() => {
        const scenarioData: Record<string, number> = {};
        const responseData: Record<string, number> = {};
        const callLengthData: number[] = [];

        filteredData.forEach((row: any) => {
            const scenario = row["Phishing Scenario"];
            if (scenario) {
                scenarioData[scenario] = (scenarioData[scenario] || 0) + 1;
            }

            const response = row["Response Description"];
            if (response) {
                responseData[response] = (responseData[response] || 0) + 1;
            }

            const callLength = parseFloat(row["Call Length (s)"]);
            if (!isNaN(callLength)) {
                callLengthData.push(callLength);
            }
        });

        setScenarios(Object.keys(scenarioData));
        setScenarioCounts(Object.values(scenarioData));
        setResponseCounts(responseData);
        setCallLengths(callLengthData);
    }, [filteredData]);

    const charts = [
        "Scenario Frequency",
        "Call Length Distribution",
        "Response Type Distribution",
        "Top Responses"
    ];

    const renderChart = () => {
        switch (selectedChart) {
            case "Scenario Frequency":
                return (
                    <Plot
                        data={[{
                            type: "bar",
                            x: scenarios,
                            y: scenarioCounts,
                            marker: { color: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"] },
                        }]}
                        layout={{
                            title: "📈 Scenario Frequency",
                            xaxis: { title: "Scenario Type" },
                            yaxis: { title: "Count" },
                            bargap: 0.3,
                        }}
                    />
                );
            case "Call Length Distribution":
                const callLengthRanges = [
                    { range: [0, 50], label: "0-50s" },
                    { range: [50, 100], label: "50-100s" },
                    { range: [100, 150], label: "100-150s" },
                    { range: [150, 200], label: "150-200s" },
                    { range: [200, 250], label: "200-250s" },
                    { range: [250, Infinity], label: "250+s" }
                ];

                const callLengthDistribution = callLengthRanges.map((range) => {
                    return callLengths.filter((length) => length >= range.range[0] && length < range.range[1]).length;
                });

                return (
                    <Plot
                        data={[{
                            type: "bar",
                            x: callLengthRanges.map(range => range.label),
                            y: callLengthDistribution,
                            marker: { color: "#FF5733", opacity: 0.6 },
                        }]}
                        layout={{
                            title: "📞 Call Length Distribution",
                            xaxis: { title: "Call Length (s)" },
                            yaxis: { title: "Frequency" },
                            bargap: 0.05,
                        }}
                    />
                );
            case "Response Type Distribution":
                return (
                    <Plot
                        data={[{
                            type: "pie",
                            labels: Object.keys(responseCounts),
                            values: Object.values(responseCounts),
                            textinfo: "label+percent",
                            marker: { colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] },
                        }]}
                        layout={{ title: "🎭 Response Type Distribution" }}
                    />
                );
            case "Top Responses":
                return (
                    <Plot
                        data={[{
                            type: "bar",
                            orientation: "h",
                            x: Object.values(responseCounts),
                            y: Object.keys(responseCounts),
                            marker: { color: "#4BC0C0" },
                            text: Object.values(responseCounts).map(String),
                            textposition: "outside",
                        }]}
                        layout={{
                            title: "💬 Top Response Types",
                            xaxis: { title: "Count" },
                            yaxis: { title: "Response Type", automargin: true },
                            margin: { l: 250 },
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mt-8">📊 Phishing Scenario Analysis</h1>

            {/* Filter Bar */}
            <div className="flex space-x-6 mb-6 bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl">
                {/* Scenario Filter Dropdown */}
                <select
                    value={scenarioFilter}
                    onChange={(e) => setScenarioFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 w-1/3"
                >
                    <option value="">Select a Scenario</option>
                    {scenarios.map((scenario, index) => (
                        <option key={index} value={scenario}>
                            {scenario}
                        </option>
                    ))}
                </select>

                {/* Name Filter Input */}
                <input
                    type="text"
                    placeholder="Filter by Name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 w-1/3"
                />
            </div>

            {/* Chart Buttons */}
            <div className="w-full max-w-4xl bg-white p-4 rounded-2xl shadow-lg flex justify-around">
                {charts.map((chart) => (
                    <button
                        key={chart}
                        onClick={() => setSelectedChart(chart)}
                        className={`px-4 py-2 rounded-lg text-gray-700 font-semibold ${selectedChart === chart ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    >
                        {chart}
                    </button>
                ))}
            </div>

            {/* Render Chart */}
            <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                {loading ? <p className="text-gray-500">Loading CSV data...</p> : renderChart()}
            </div>
        </div>
    );
}