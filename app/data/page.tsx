"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Select from "react-select";
import Papa from "papaparse";

const csvPath = "/synthetic_calls_scenarios.csv";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Analysis() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [scenarios, setScenarios] = useState<string[]>([]);
    const [names, setNames] = useState<string[]>([]);
    const [selectedScenarios, setSelectedScenarios] = useState<string[]>(["All"]);
    const [selectedNames, setSelectedNames] = useState<string[]>(["All"]);
    const [selectedChart, setSelectedChart] = useState("Scenario Frequency");

    useEffect(() => {
        fetch(csvPath)
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setData(results.data);
                        setLoading(false);

                        const uniqueScenarios = [...new Set(results.data.map((row: any) => row["Phishing Scenario"]))].filter(Boolean);
                        const uniqueNames = [...new Set(results.data.map((row: any) => row["Name"]))].filter(Boolean);

                        setScenarios(uniqueScenarios);
                        setNames(uniqueNames);
                    },
                });
            })
            .catch((error) => {
                console.error("Error loading CSV:", error);
                setLoading(false);
            });
    }, []);

    const filteredData = data.filter((row) => {
        const scenarioMatch = selectedScenarios.includes("All") || selectedScenarios.includes(row["Phishing Scenario"]);
        const nameMatch = selectedNames.includes("All") || selectedNames.includes(row["Name"]);
        return scenarioMatch && nameMatch;
    });

    const scenarioCounts = filteredData.reduce((acc: Record<string, number>, row) => {
        const scenario = row["Phishing Scenario"];
        acc[scenario] = (acc[scenario] || 0) + 1;
        return acc;
    }, {});

    const callLengths = filteredData.map(row => parseFloat(row["Call Length (s)"])).filter(n => !isNaN(n));

    const responseCounts = filteredData.reduce((acc: Record<string, number>, row) => {
        const response = row["Response Description"];
        acc[response] = (acc[response] || 0) + 1;
        return acc;
    }, {});

    const scenarioOptions = [{ value: "All", label: "🌍 All Scenarios" }, ...scenarios.map((s) => ({ value: s, label: s }))];
    const nameOptions = [{ value: "All", label: "👥 All Names" }, ...names.map((n) => ({ value: n, label: n }))];

    const chartOptions = [
        { value: "Scenario Frequency", label: "📈 Scenario Frequency" },
        { value: "Call Length Distribution", label: "📞 Call Length Distribution" },
        { value: "Response Type Distribution", label: "🎭 Response Type Distribution" },
        { value: "Top Responses", label: "💬 Top Responses" },
    ];

    const renderChart = () => {
        switch (selectedChart) {
            case "Scenario Frequency":
                return (
                    <Plot
                        data={[{
                            type: "bar",
                            x: Object.keys(scenarioCounts),
                            y: Object.values(scenarioCounts),
                            marker: { color: "#36A2EB" },
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
                        data={[{
                            type: "histogram",
                            x: callLengths,
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
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mt-10">📊 Phishing Scenario Analysis</h1>

            {/* Filters */}
            <div className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg flex flex-col space-y-4">
                <div>
                    <label className="block text-gray-700 font-semibold">Filter by Scenario:</label>
                    <Select
                        options={scenarioOptions}
                        isMulti
                        value={scenarioOptions.filter(opt => selectedScenarios.includes(opt.value))}
                        placeholder="Select scenarios..."
                        onChange={(selected) => {
                            const values = selected.map(opt => opt.value);
                            setSelectedScenarios(values.includes("All") ? ["All"] : values);
                        }}
                        className="mt-2"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold">Filter by Name:</label>
                    <Select
                        options={nameOptions}
                        isMulti
                        value={nameOptions.filter(opt => selectedNames.includes(opt.value))}
                        placeholder="Select names..."
                        onChange={(selected) => {
                            const values = selected.map(opt => opt.value);
                            setSelectedNames(values.includes("All") ? ["All"] : values);
                        }}
                        className="mt-2"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold">Select Chart:</label>
                    <Select
                        options={chartOptions}
                        placeholder="Choose a chart..."
                        onChange={(selected) => setSelectedChart(selected?.value || "Scenario Frequency")}
                        className="mt-2"
                    />
                </div>
            </div>

            {/* Graph Display */}
            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
                {loading ? <p className="text-gray-500">Loading CSV data...</p> : renderChart()}
            </div>
        </div>
    );
}