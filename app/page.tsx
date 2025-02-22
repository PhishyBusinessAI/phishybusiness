"use client"
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  async function callUser() {
    try {
      const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_number: '+16509999723',
          to_number: phoneNumber,
          override_agent_id: 'agent_7a7a2fff71b3119b46a4afa692',
          retell_llm_dynamic_variables: {
            user_name: userName
          }
        })
      });
      const data = await response.json();
      console.log('Call initiated:', data);
    } catch (error) {
      console.error('Error making call:', error);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input
          type="tel"
          placeholder="Enter phone number (+1XXXXXXXXXX)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="p-2 border rounded-md"
        />
        <button 
          onClick={() => callUser()} 
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Start Call
        </button>
      </div>
      <h1>Hello World</h1>
    </div>
  );
}
