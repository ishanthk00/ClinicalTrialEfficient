import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, briefSummary, eligibilityCriteria, studyType, enrollment, phases, interventions } = body;

    const prompt = `You are helping patients and caregivers understand a clinical trial. Use simple, clear language at an 8th grade reading level. Be warm and reassuring, not clinical.

Clinical trial: "${title}"
Study type: ${studyType ?? "Not specified"}
Phases: ${phases?.join(", ") ?? "Not specified"}
Enrollment target: ${enrollment ?? "Not specified"} participants
Interventions: ${interventions?.join("; ") ?? "Not specified"}

Brief summary from researchers:
${briefSummary ?? "Not provided"}

Eligibility criteria (raw):
${eligibilityCriteria ?? "Not provided"}

Please respond with a JSON object (no markdown, just the raw JSON) with exactly these fields:

{
  "plainSummary": "3-4 sentences in plain English explaining what this trial is studying and why it matters to patients. No jargon.",
  "qualify": ["bullet 1", "bullet 2", "..."],
  "notQualify": ["bullet 1", "bullet 2", "..."],
  "involved": "2-3 sentences describing what participation looks like: how long the study runs, roughly how many visits or procedures, and what participants actually do."
}

For qualify and notQualify: extract the most important criteria from the eligibility text above. Each bullet should be a complete, plain-English sentence starting with a condition (e.g. "You have been diagnosed with...", "You are between 18 and 65 years old"). Include 3-6 bullets per list. If criteria are not available, return empty arrays.`;

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      max_tokens: 1024,
      reasoning_effort: "low",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      plainSummary: parsed.plainSummary ?? "",
      qualify: parsed.qualify ?? [],
      notQualify: parsed.notQualify ?? [],
      involved: parsed.involved ?? "",
    });
  } catch (err) {
    console.error("Summarize error:", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
