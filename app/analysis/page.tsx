"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";

// Import CSV dynamically using fetch (prevents hydration error)
const csvPath = "/synthetic_calls_scenarios.csv";

// Dynamically import Plotly
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Analysis() {
    const [scenarios, setScenarios] = useState<string[]>([]);
    const [scenarioCounts, setScenarioCounts] = useState<number[]>([]);
    const [callLengths, setCallLengths] = useState<number[]>([]);
    const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedChart, setSelectedChart] = useState("Scenario Frequency");

    useEffect(() => {
        fetch(csvPath)
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const scenarioData: Record<string, number> = {};
                        const responseData: Record<string, number> = {};
                        const callLengthData: number[] = [];

                        results.data.forEach((row: any) => {
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
                        setLoading(false);
                    },
                });
            })
            .catch((error) => {
                console.error("Error loading CSV:", error);
                setLoading(false);
            });
    }, []);

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
                return (
                    <Plot
                        data={[
                            {
                                type: "bar",
                                x: ["0-50s", "50-100s", "100-150s", "150-200s", "200-250s", "250+s"], // Binned ranges
                                y: [0.12, 0.25, 0.20, 0.18, 0.15, 0.10], // Placeholder probabilities
                                marker: { color: "#FF5733", opacity: 0.6 },
                                name: "Call Length Histogram",
                            },
                        ]}
                        layout={{
                            title: "📞 Call Length Distribution with PDF",
                            xaxis: { title: "Call Length (s)" },
                            yaxis: { title: "Probability Density" },
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 space-y-10">
            <h1 className="text-3xl font-bold text-gray-800">📊 Phishing Scenario Analysis</h1>

            {loading ? (
                <p className="text-gray-500">Loading CSV data...</p>
            ) : (
                <>
                    <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Chart</h2>
                        <select
                            className="p-2 border rounded-lg"
                            value={selectedChart}
                            onChange={(e) => setSelectedChart(e.target.value)}
                        >
                            <option>Scenario Frequency</option>
                            <option>Call Length Distribution</option>
                            <option>Response Type Distribution</option>
                            <option>Top Responses</option>
                        </select>
                    </div>

                    <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                        {renderChart()}
                    </div>
                </>
            )}
        </div>
    );
}
