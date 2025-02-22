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

    useEffect(() => {
        fetch(csvPath)
            .then((response) => response.text())
            .then((csvText) => {
                console.log("Raw CSV Data:", csvText);

                // Parse CSV
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        console.log("Parsed CSV Data:", results.data);

                        const scenarioData: Record<string, number> = {};
                        const responseData: Record<string, number> = {};
                        const callLengthData: number[] = [];

                        results.data.forEach((row: any) => {
                            // Count phishing scenario occurrences
                            const scenario = row["Phishing Scenario"];
                            if (scenario) {
                                scenarioData[scenario] = (scenarioData[scenario] || 0) + 1;
                            }

                            // Track response types
                            const response = row["Response Description"];
                            if (response) {
                                responseData[response] = (responseData[response] || 0) + 1;
                            }

                            // Collect call lengths
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 space-y-10">
            <h1 className="text-3xl font-bold text-gray-800">📊 Phishing Scenario Analysis</h1>

            {loading ? (
                <p className="text-gray-500">Loading CSV data...</p>
            ) : (
                <>
                    {/* 📊 Bar Chart: Phishing Scenarios Frequency */}
                    <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Phishing Scenarios Frequency</h2>
                        <Plot
                            data={[
                                {
                                    type: "bar",
                                    x: scenarios,
                                    y: scenarioCounts,
                                    marker: {
                                        color: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
                                    },
                                },
                            ]}
                            layout={{
                                title: "📈 Scenario Frequency",
                                xaxis: { title: "Scenario Type" },
                                yaxis: { title: "Count" },
                                bargap: 0.3,
                            }}
                        />
                    </div>

                    {/* 📈 Line Chart: Call Lengths Distribution */}
                    <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Call Lengths Over Time</h2>
                        <Plot
                            data={[
                                {
                                    type: "scatter",
                                    mode: "lines+markers",
                                    y: callLengths,
                                    marker: { color: "#FF5733" },
                                },
                            ]}
                            layout={{
                                title: "📞 Call Lengths Distribution",
                                xaxis: { title: "Call Index" },
                                yaxis: { title: "Call Length (s)" },
                            }}
                        />
                    </div>

                    {/* 🥧 Pie Chart: Response Distribution */}
                    <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Response Type Distribution</h2>
                        <Plot
                            data={[
                                {
                                    type: "pie",
                                    labels: Object.keys(responseCounts),
                                    values: Object.values(responseCounts),
                                    textinfo: "label+percent",
                                    marker: {
                                        colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                                    },
                                },
                            ]}
                            layout={{ title: "🎭 Response Type Distribution" }}
                        />
                    </div>

                    {/* 📊 Horizontal Bar Chart: Top Responses */}
                    {/* 📊 Horizontal Bar Chart: Top Responses */}
                    <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Common Responses</h2>
                        <Plot
                            data={[
                                {
                                    type: "bar",
                                    orientation: "h",
                                    x: Object.values(responseCounts),
                                    y: Object.keys(responseCounts),
                                    marker: { color: "#4BC0C0" },
                                    text: Object.values(responseCounts).map(String),
                                    textposition: "outside", // Ensures counts are visible
                                },
                            ]}
                            layout={{
                                title: "💬 Top Response Types",
                                xaxis: { title: "Count" },
                                yaxis: {
                                    title: "Response Type",
                                    automargin: true, // Auto adjust margins
                                },
                                margin: { l: 250 }, // Increased left margin to prevent text cut-off
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}