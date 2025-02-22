// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   const body = await request.json();
//   const { event, call } = body;

  
//   switch (event) {
//     case "call_ended":
//       console.log("Call ended:", call.call_id);
//       break;
//     default:
//       console.log("Received event:", event, "for call:", call.call_id);
//   }

//   return NextResponse.json({ received: true }, { status: 200 });
// }

// export const dynamic = 'force-dynamic'; 