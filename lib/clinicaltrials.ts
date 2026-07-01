const BASE_URL = "https://clinicaltrials.gov/api/v2";

export interface TrialLocation {
  facility?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
}

export interface TrialContact {
  name?: string;
  phone?: string;
  email?: string;
}

export interface Trial {
  nctId: string;
  title: string;
  status: string;
  phases: string[];
  startDate?: string;
  lastUpdatePostDate?: string;
  briefSummary?: string;
  eligibilityCriteria?: string;
  locations: TrialLocation[];
  contacts: TrialContact[];
  studyType?: string;
  enrollment?: number;
  primaryPurpose?: string;
  officialTitle?: string;
  sponsor?: string;
  interventions?: string[];
}

export interface SearchResult {
  trials: Trial[];
  nextPageToken?: string;
  totalCount?: number;
}

function parseTrial(study: Record<string, unknown>): Trial {
  const proto = study.protocolSection as Record<string, unknown> | undefined;
  if (!proto) {
    return {
      nctId: "",
      title: "Unknown trial",
      status: "Unknown",
      phases: [],
      locations: [],
      contacts: [],
    };
  }

  const id = proto.identificationModule as Record<string, unknown> | undefined;
  const status = proto.statusModule as Record<string, unknown> | undefined;
  const desc = proto.descriptionModule as Record<string, unknown> | undefined;
  const elig = proto.eligibilityModule as Record<string, unknown> | undefined;
  const design = proto.designModule as Record<string, unknown> | undefined;
  const contacts = proto.contactsLocationsModule as Record<string, unknown> | undefined;
  const sponsor = proto.sponsorCollaboratorsModule as Record<string, unknown> | undefined;
  const arms = proto.armsInterventionsModule as Record<string, unknown> | undefined;

  const rawLocations = (contacts?.locations as Record<string, unknown>[] | undefined) ?? [];
  const locations: TrialLocation[] = rawLocations.map((l) => ({
    facility: l.facility as string | undefined,
    city: l.city as string | undefined,
    state: l.state as string | undefined,
    country: l.country as string | undefined,
    status: l.status as string | undefined,
  }));

  const rawContacts =
    (contacts?.centralContacts as Record<string, unknown>[] | undefined) ?? [];
  const parsedContacts: TrialContact[] = rawContacts.map((c) => ({
    name: c.name as string | undefined,
    phone: c.phone as string | undefined,
    email: c.email as string | undefined,
  }));

  const phases =
    ((design?.phases as string[] | undefined) ?? []).map((p) =>
      p.replace("PHASE", "Phase ").replace("NA", "N/A")
    ) ?? [];

  const interventionList =
    (arms?.interventions as Record<string, unknown>[] | undefined) ?? [];
  const interventions = interventionList.map(
    (i) => `${i.type ?? ""}: ${i.name ?? ""}`.trim()
  );

  const leadSponsor = sponsor?.leadSponsor as Record<string, unknown> | undefined;

  return {
    nctId: (id?.nctId as string) ?? "",
    title: (id?.briefTitle as string) ?? "Untitled trial",
    officialTitle: id?.officialTitle as string | undefined,
    status: (status?.overallStatus as string) ?? "Unknown",
    phases,
    startDate: (status?.startDateStruct as Record<string, string> | undefined)
      ?.date,
    lastUpdatePostDate: (
      status?.lastUpdatePostDateStruct as Record<string, string> | undefined
    )?.date,
    briefSummary: desc?.briefSummary as string | undefined,
    eligibilityCriteria: elig?.eligibilityCriteria as string | undefined,
    locations,
    contacts: parsedContacts,
    studyType: design?.studyType as string | undefined,
    enrollment: (design?.enrollmentInfo as Record<string, unknown> | undefined)
      ?.count as number | undefined,
    primaryPurpose: (design?.designInfo as Record<string, unknown> | undefined)
      ?.primaryPurpose as string | undefined,
    sponsor: leadSponsor?.name as string | undefined,
    interventions,
  };
}

export async function searchTrials(params: {
  condition?: string;
  location?: string;
  status?: string;
  recruitingOnly?: boolean;
  recent?: boolean;
  phase?: string;
  ageGroup?: string;
  pageToken?: string;
  pageSize?: number;
}): Promise<SearchResult> {
  const query = new URLSearchParams();

  if (params.condition) query.set("query.cond", params.condition);
  if (params.location) query.set("query.locn", params.location);
  if (params.status) {
    query.set("filter.overallStatus", params.status);
  } else if (params.recruitingOnly) {
    query.set("filter.overallStatus", "RECRUITING");
  }
  if (params.phase) {
    const phaseMap: Record<string, string> = {
      "Phase 1": "PHASE1",
      "Phase 2": "PHASE2",
      "Phase 3": "PHASE3",
      "Phase 4": "PHASE4",
    };
    query.set("filter.phase", phaseMap[params.phase] ?? params.phase);
  }
  if (params.ageGroup) {
    const ageMap: Record<string, string> = {
      Child: "child",
      Adult: "adult",
      "Older Adult": "older adult",
    };
    query.set("filter.ageGroup", ageMap[params.ageGroup] ?? params.ageGroup);
  }
  query.set("pageSize", String(params.pageSize ?? 20));
  if (params.pageToken) query.set("pageToken", params.pageToken);
  if (params.recent) query.set("sort", "LastUpdatePostDate:desc");

  query.set(
    "fields",
    [
      "protocolSection.identificationModule",
      "protocolSection.statusModule",
      "protocolSection.descriptionModule.briefSummary",
      "protocolSection.eligibilityModule",
      "protocolSection.designModule",
      "protocolSection.contactsLocationsModule",
      "protocolSection.sponsorCollaboratorsModule",
      "protocolSection.armsInterventionsModule",
    ].join(",")
  );

  const url = `${BASE_URL}/studies?${query.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`ClinicalTrials.gov API error: ${res.status}`);
  }

  const data = await res.json();
  const studies = (data.studies as Record<string, unknown>[]) ?? [];

  return {
    trials: studies.map(parseTrial),
    nextPageToken: data.nextPageToken as string | undefined,
    totalCount: data.totalCount as number | undefined,
  };
}

export async function getTrialById(nctId: string): Promise<Trial | null> {
  const url = `${BASE_URL}/studies/${nctId}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) return null;

  const data = await res.json();
  return parseTrial(data);
}
