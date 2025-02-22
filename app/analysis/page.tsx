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
                    <Plot data={[{ type: "bar", x: scenarios, y: scenarioCounts, marker: { color: "#36A2EB" } }]} layout={{ title: "📈 Scenario Frequency", xaxis: { title: "Scenario Type" }, yaxis: { title: "Count" } }} />
                );
            case "Call Length Distribution":
                return (
                    <Plot data={[{ type: "histogram", x: callLengths, marker: { color: "#FF5733" } }]} layout={{ title: "📞 Call Length Distribution", xaxis: { title: "Call Length (s)" }, yaxis: { title: "Frequency" } }} />
                );
            case "Response Type Distribution":
                return (
                    <Plot data={[{ type: "pie", labels: Object.keys(responseCounts), values: Object.values(responseCounts), textinfo: "label+percent" }]} layout={{ title: "🎭 Response Type Distribution" }} />
                );
            case "Top Responses":
                return (
                    <Plot data={[{ type: "bar", orientation: "h", x: Object.values(responseCounts), y: Object.keys(responseCounts), marker: { color: "#4BC0C0" } }]} layout={{ title: "💬 Top Response Types", xaxis: { title: "Count" }, yaxis: { title: "Response Type" } }} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">📊 Phishing Scenario Analysis</h1>
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
            <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                {loading ? <p className="text-gray-500">Loading CSV data...</p> : renderChart()}
            </div>
        </div>
    );
}
