import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { searchTrials } from "@/lib/clinicaltrials";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = `You are a caring clinical trial navigator for TrialFind. Your job is to help patients find relevant clinical trials through friendly conversation.

What you need to gather:
1. The user's medical condition (REQUIRED — ask this first)
2. Their location — city, state, or country (optional, helps find nearby trials)

Rules:
- Keep replies short and warm (1–3 sentences max)
- Ask about condition and location together in your first question to keep it efficient
- Once you have the medical condition, call search_clinical_trials immediately — don't ask more questions first
- Include location in the search if the user mentioned one
- After searching, tell the user how many trials were found and ask them to scroll down to see their personalized results
- Never ask for personal identifying information beyond condition, location, and age group`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tools: any[] = [
  {
    type: "function",
    function: {
      name: "search_clinical_trials",
      description:
        "Search ClinicalTrials.gov for trials matching the user's profile. Call this as soon as you have the medical condition.",
      parameters: {
        type: "object",
        properties: {
          condition: {
            type: "string",
            description: "Medical condition or disease to search for",
          },
          location: {
            type: "string",
            description: "City, state, or country for location-based filtering",
          },
          ageGroup: {
            type: "string",
            enum: ["Child", "Adult", "Older Adult"],
            description: "Patient age group",
          },
        },
        required: ["condition"],
      },
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const firstResponse = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      max_tokens: 512,
      reasoning_effort: "low",
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      tools,
      tool_choice: "auto",
    });

    const firstMsg = firstResponse.choices[0].message;

    if (firstMsg.tool_calls?.length) {
      const toolCall = firstMsg.tool_calls[0];
      const input = JSON.parse(toolCall.function.arguments) as {
        condition: string;
        location?: string;
        ageGroup?: string;
      };

      const result = await searchTrials({
        condition: input.condition,
        location: input.location,
        ageGroup: input.ageGroup,
        pageSize: 6,
      });

      const secondResponse = await client.chat.completions.create({
        model: "openai/gpt-oss-120b",
        max_tokens: 512,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: SYSTEM },
          ...messages,
          firstMsg,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              found: result.trials.length,
              totalCount: result.totalCount ?? result.trials.length,
              condition: input.condition,
            }),
          },
        ],
        tools,
      });

      const text =
        secondResponse.choices[0].message.content ??
        "I found some trials for you! Scroll down to see your personalized results.";

      return NextResponse.json({
        message: text,
        trials: result.trials,
        searchParams: input,
      });
    }

    const text =
      firstMsg.content ??
      "I'm here to help you find clinical trials. What condition are you searching for?";

    return NextResponse.json({ message: text });
  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json({ error: "Agent unavailable" }, { status: 500 });
  }
}
