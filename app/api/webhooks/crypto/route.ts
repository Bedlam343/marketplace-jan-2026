import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log("Crypto webhook payload:", payload);

        // TO DO: update orders table here...

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("Crypto webhook error:", error);
        return new NextResponse("Bad Request", { status: 400 });
    }
}
