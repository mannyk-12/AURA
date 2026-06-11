import { GoogleGenAI } from "@google/genai";
import { getGeminiToolDeclarations, executeMcpTool } from "@/lib/mcp";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const maxDuration = 60; // Next.js max execution time (Vercel)

export async function POST(req: Request) {
  try {
    const { messages, chatId: incomingChatId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;
    let uid = "anonymous";
    let chatId = incomingChatId || crypto.randomUUID();

    // Verify Firebase auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userProfile = {
      studentId: "CS-2021-042",
      branch: "Computer Science",
      name: "Student",
      dietaryPreferences: ["vegetarian"]
    };

    if (adminAuth && adminDb) {
      try {
        const token = authHeader.slice(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userDoc = await adminDb.doc(`users/${decodedToken.uid}`).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          userProfile = {
            studentId: data?.studentId || "CS-2021-042",
            branch: data?.branch || "Computer Science",
            name: data?.displayName?.split(" ")[0] || "Student",
            dietaryPreferences: data?.dietaryPreferences || ["vegetarian"]
          };
          uid = decodedToken.uid;
        }
      } catch (adminError) {
        console.error("[Chat API] Firebase Admin verification failed:", adminError);
        // Fallback context will be used
      }
    } else {
      console.warn("[Chat API] Firebase Admin not initialized, using fallback context.");
    }

    // Save user message to Firestore before processing
    if (adminDb && uid !== "anonymous") {
      const chatRef = adminDb.doc(`users/${uid}/chatHistory/${chatId}`);
      const chatDoc = await chatRef.get();
      
      const userMsgObj = {
        role: "user",
        content: latestMessage,
        timestamp: new Date()
      };

      if (!chatDoc.exists) {
        await chatRef.set({
          id: chatId,
          title: latestMessage.substring(0, 40) + (latestMessage.length > 40 ? "..." : ""),
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [userMsgObj]
        });
      } else {
        const { FieldValue } = await import("firebase-admin/firestore");
        await chatRef.update({
          messages: FieldValue.arrayUnion(userMsgObj),
          updatedAt: new Date()
        });
      }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    console.log("[Chat API] Fetching MCP Tools...");
    const tools = await getGeminiToolDeclarations();
    
    // System prompt instructs Gemini on its role
    const systemInstruction = `You are a helpful campus assistant AI for the Unified Campus Intelligence Dashboard.
You have access to a suite of tools that pull real-time data from 4 different campus services: Library, Cafeteria, Events, and Academics.

Current Context:
- Today's Date: ${new Date().toDateString()}
- Student Name: ${userProfile.name}
- Student ID: ${userProfile.studentId}
- Branch: ${userProfile.branch}
- Dietary Preference: ${userProfile.dietaryPreferences.join(", ")}

You can call multiple tools to answer a user's question.

CRITICAL UI REQUIREMENT (Generative UI):
When returning a list of books, meals, or events, DO NOT use standard markdown lists. You MUST output a JSON code block formatted exactly like this:

For Books:
\`\`\`json
{
  "type": "library_cards",
  "data": [
    { "title": "Book Title", "author": "Author Name", "status": "Available/Due..." }
  ]
}
\`\`\`

For Events:
\`\`\`json
{
  "type": "event_cards",
  "data": [
    { "title": "Event Name", "date": "Date/Time", "venue": "Location" }
  ]
}
\`\`\`

For Meals/Cafeteria:
\`\`\`json
{
  "type": "cafeteria_cards",
  "data": [
    { "name": "Item Name", "price": "150" }
  ]
}
\`\`\`

For Academics (Classes/Exams):
\`\`\`json
{
  "type": "academics_cards",
  "data": [
    { "course_name": "Data Structures", "course_code": "CS301", "start_time": "09:00", "end_time": "10:30", "venue": "Room 301", "type": "Lecture" }
  ]
}
\`\`\`

Answer questions naturally and concisely, and seamlessly include the JSON block inside your natural language response.`;

    // Instead of sending the full thread every time, we should format the history 
    // for Gemini's session so it understands context.
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined
      },
      history: history.length > 0 ? history : undefined
    });

    console.log(`[Chat API] Sending request to Gemini with ${tools.length} available tools...`);
    
    // Format previous messages for Gemini
    let responseText = "";
    
    let response = await chat.sendMessage({ message: latestMessage });

    // Handle the Tool Calling loop
    let iteration = 0;
    while (response.functionCalls && response.functionCalls.length > 0 && iteration < 10) {
      iteration++;
      console.log(`[Chat API] Gemini requested ${response.functionCalls.length} tool calls (Iteration ${iteration})`);
      
      const functionResponses = await Promise.all(
        response.functionCalls.map(async (call) => {
          if (!call.name) return null;
          console.log(`[Chat API] Executing tool: ${call.name}`);
          const result = await executeMcpTool(call.name, call.args || {});
          
          return {
            functionResponse: {
              ...(call.id ? { id: call.id } : {}),
              name: call.name,
              response: result
            }
          };
        })
      ).then(res => res.filter(Boolean) as any[]);
      
      console.log(`[Chat API] Sending tool results back to Gemini...`);
      // Send the results back
      response = await chat.sendMessage({ message: functionResponses });
    }

    console.log("[Chat API] Final text response received from Gemini.");
    
    const finalContent = response.text || "I'm sorry, I couldn't generate a response.";

    // Save assistant response to Firestore
    if (adminDb && uid !== "anonymous") {
      const chatRef = adminDb.doc(`users/${uid}/chatHistory/${chatId}`);
      const { FieldValue } = await import("firebase-admin/firestore");
      
      const assistantMsgObj = {
        role: "assistant",
        content: finalContent,
        timestamp: new Date()
      };

      await chatRef.update({
        messages: FieldValue.arrayUnion(assistantMsgObj),
        updatedAt: new Date()
      });
    }

    return Response.json({ 
      role: "assistant", 
      content: finalContent,
      chatId: chatId
    });

  } catch (error: any) {
    console.error("[Chat API Error]", error);
    return Response.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
