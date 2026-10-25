import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import type { Trial } from "@/lib/clinicaltrials";

interface SavedTrialRow {
  client_id: string;
  nct_id: string;
  trial_data: Trial;
  created_at?: string;
}

/**
 * GET /api/bookmarks?clientId=<id>
 * Returns all saved trials for a given client/device ID from Supabase.
 */
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId")?.trim();
  if (!clientId) {
    return NextResponse.json(
      { error: "Missing clientId parameter", trials: [] },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({
      configured: false,
      trials: [],
    });
  }

  try {
    const { data, error } = await supabase
      .from("saved_trials")
      .select("trial_data, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET bookmarks error:", error.message);
      return NextResponse.json(
        { error: error.message, configured: true, trials: [] },
        { status: 500 }
      );
    }

    const trials = ((data as SavedTrialRow[] | null) ?? []).map(
      (row) => row.trial_data
    );

    return NextResponse.json({
      configured: true,
      trials,
    });
  } catch (err) {
    console.error("Unexpected GET bookmarks error:", err);
    return NextResponse.json(
      { error: "Failed to load saved trials", trials: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookmarks
 * Body: { clientId: string, trial?: Trial, trials?: Trial[] }
 * Upserts one or more saved trials into Supabase for the given clientId.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      clientId?: string;
      trial?: Trial;
      trials?: Trial[];
    };

    const clientId = body.clientId?.trim();
    const items = body.trials ?? (body.trial ? [body.trial] : []);

    if (!clientId || items.length === 0) {
      return NextResponse.json(
        { error: "clientId and trial(s) are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ configured: false, saved: false });
    }

    const rows: SavedTrialRow[] = items
      .filter((t) => Boolean(t?.nctId))
      .map((trial) => ({
        client_id: clientId,
        nct_id: trial.nctId,
        trial_data: trial,
      }));

    const { error } = await supabase
      .from("saved_trials")
      .upsert(rows, { onConflict: "client_id,nct_id" });

    if (error) {
      console.error("Supabase POST bookmarks error:", error.message);
      return NextResponse.json(
        { error: error.message, configured: true, saved: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ configured: true, saved: true });
  } catch (err) {
    console.error("Unexpected POST bookmarks error:", err);
    return NextResponse.json(
      { error: "Failed to save bookmark" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookmarks?clientId=<id>&nctId=<nctId>
 * Removes a saved trial from Supabase for the given clientId.
 */
export async function DELETE(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId")?.trim();
  const nctId = req.nextUrl.searchParams.get("nctId")?.trim();

  if (!clientId || !nctId) {
    return NextResponse.json(
      { error: "clientId and nctId are required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ configured: false, removed: false });
  }

  try {
    const { error } = await supabase
      .from("saved_trials")
      .delete()
      .eq("client_id", clientId)
      .eq("nct_id", nctId);

    if (error) {
      console.error("Supabase DELETE bookmark error:", error.message);
      return NextResponse.json(
        { error: error.message, configured: true, removed: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ configured: true, removed: true });
  } catch (err) {
    console.error("Unexpected DELETE bookmark error:", err);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
