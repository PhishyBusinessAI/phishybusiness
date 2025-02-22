"use client";

import { useState } from "react";

interface CallDetails {
    transcript: string;
}

type PhishingAnalysis = {
    mistakes: string[];
    risks: string[];
    bestPractices: string[];
};

const Analysis = ({ callDetails }: { callDetails: CallDetails }) => {

    const [aiResponse, setAIResponse] = useState<PhishingAnalysis | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    async function getAnalysis(transcript: string) {
        setIsLoading(true);
        try {
        const response = await fetch("/api/webhook/new_gpt", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ transcript }),
        });

        const text = await response.text(); // Get the raw response text
        // console.log(text)

        if (response.ok) {
            const parsedOuter = JSON.parse(text); // First parse
            const jsonData: PhishingAnalysis = JSON.parse(parsedOuter.response);
            setAIResponse(jsonData);
        } else {
            setAIResponse({ mistakes: [], risks: [], bestPractices: [] });
        }
        } catch (error) {
        console.error("Error generating analysis:", error);
        setAIResponse({ mistakes: [], risks: [], bestPractices: [] });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <>
        <h3 className="text-xl font-semibold mb-4">Call Analysis</h3>
        <div className="space-y-4">
            <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {/* {(aiResponse && JSON.stringify(aiResponse))|| "null"} */}
                <div
                style={{
                    fontFamily: "Arial, sans-serif",
                    padding: "15px",
                    borderRadius: "10px",
                    background: "#f9f9f9",
                    border: "1px solid #ddd",
                }}
                >
                <h2 className="font-bold">Phishing Analysis Report</h2>

                <h3 className="text-[#d9534f]">Mistakes Made</h3>
                <ul>
                    {aiResponse?.mistakes.map((m, index) => (
                    <li key={index}>{m}</li>
                    ))}
                </ul>

                <h3 className="text-[#f0ad4e]">Potential Risks</h3>
                <ul>
                    {aiResponse?.risks.map((r, index) => (
                    <li key={index}>{r}</li>
                    ))}
                </ul>

                <h3 className="text-[#5cb85c]">Best Practices</h3>
                <ul>
                    {aiResponse?.bestPractices.map((b, index) => (
                    <li key={index}>{b}</li>
                    ))}
                </ul>
                </div>
            </pre>
            <button
                onClick={() => getAnalysis(callDetails.transcript)}
                // onClick={() => getAnalysis("Agent: Hello, is this Bob? \n User: Yes this is Bob, here is my social security number 994128442")}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                {isLoading ? "Analyzing..." : "Analyze Transcript"}
            </button>
        </div>
        </>
    );
};
export default Analysis;