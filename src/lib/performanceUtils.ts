import { normalizeDealValue } from "@/lib/dealValue";
import { isInLocalTimeframe, type Timeframe } from "@/lib/timeframe";

export interface SetterMetrics {
  totalLeads: number;
  totalDials: number;
  totalBooked: number;
  bookedWithoutValue: number;
  conversionRate: number;
  powerScore: number;
  projectedRevenue: number;
}

export interface SetterActivityMetrics {
  leadsWorked: number;
  callsPlaced: number;
  demosBooked: number;
  bookRate: number;
  projectedRevenue: number;
  powerScore: number;
  messagesSent: number;
  ignored: number;
  bookedWithoutValue: number;
  actionTotal: number;
}

interface SetterInteractionEntry {
  lead_id: string;
  actor_id: string;
  kind: "call" | "sms" | "email";
  occurred_at: string;
}

interface SetterStatusEventEntry {
  lead_id: string;
  actor_id: string;
  to_status: string;
  value_snapshot: number | null;
  occurred_at: string;
}

export function calculateSetterMetrics(
  allLeads: any[],
  allNotes: Record<string, any>,
  userId: string,
  timeframe: Timeframe = 'all'
): SetterMetrics {
  const notesArray = Object.values(allNotes);

  const filteredNotes = notesArray.filter((n: any) => {
    // SECURITY: Always filter by the current user for individual performance
    if (n.setter_id !== userId) return false;
    return timeframe === "all" ? true : isInLocalTimeframe(n.synced_at, timeframe);
  });

  const totalDials = filteredNotes.filter((n: any) => n.status !== "new" && n.status !== "ignored").length;
  const bookedNotes = filteredNotes.filter((n: any) => n.status === "booked");
  const totalBooked = bookedNotes.length;
  const bookedWithoutValue = bookedNotes.filter((n: any) => normalizeDealValue(n.deal_value) === null).length;
  const conversionRate = totalDials > 0 ? (totalBooked / totalDials) * 100 : 0;
  const projectedRevenue = bookedNotes.reduce((sum: number, n: any) => {
    const value = normalizeDealValue(n.deal_value);
    return sum + (value ?? 0);
  }, 0);
  
  // Power Score = (ConvRate * 0.7) + (Bookings/10 * 30) - capped at 100
  const powerScore = Math.min(Math.round((conversionRate * 0.7) + (Math.min(totalBooked, 10) * 3)), 100);

  return {
    totalLeads: allLeads.length,
    totalDials,
    totalBooked,
    bookedWithoutValue,
    conversionRate,
    powerScore,
    projectedRevenue
  };
}

export function calculateSetterActionMetrics(
  interactions: SetterInteractionEntry[],
  statusEvents: SetterStatusEventEntry[],
  userId: string,
  timeframe: Timeframe = "all",
): SetterActivityMetrics {
  const filteredInteractions = interactions.filter(
    (entry) => entry.actor_id === userId && isInLocalTimeframe(entry.occurred_at, timeframe),
  );
  const filteredStatusEvents = statusEvents.filter(
    (entry) => entry.actor_id === userId && isInLocalTimeframe(entry.occurred_at, timeframe),
  );

  const callsPlaced = filteredInteractions.filter((entry) => entry.kind === "call").length;
  const messagesSent = filteredInteractions.filter((entry) => entry.kind === "sms" || entry.kind === "email").length;
  const bookedEvents = filteredStatusEvents.filter((entry) => entry.to_status === "booked");
  const ignored = filteredStatusEvents.filter((entry) => entry.to_status === "ignored").length;
  const demosBooked = bookedEvents.length;
  const projectedRevenue = bookedEvents.reduce((sum, entry) => sum + (normalizeDealValue(entry.value_snapshot) ?? 0), 0);
  const bookedWithoutValue = bookedEvents.filter((entry) => normalizeDealValue(entry.value_snapshot) === null).length;
  const bookRate = callsPlaced > 0 ? (demosBooked / callsPlaced) * 100 : 0;
  const powerScore = Math.min(Math.round((bookRate * 0.7) + (Math.min(demosBooked, 10) * 3)), 100);

  const uniqueLeadIds = new Set<string>();
  filteredInteractions.forEach((entry) => uniqueLeadIds.add(entry.lead_id));
  filteredStatusEvents.forEach((entry) => uniqueLeadIds.add(entry.lead_id));

  return {
    leadsWorked: uniqueLeadIds.size,
    callsPlaced,
    demosBooked,
    bookRate,
    projectedRevenue,
    powerScore,
    messagesSent,
    ignored,
    bookedWithoutValue,
    actionTotal: callsPlaced + messagesSent + demosBooked + ignored,
  };
}
