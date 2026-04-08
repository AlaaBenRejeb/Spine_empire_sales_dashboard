import { normalizeDealValue } from "@/lib/dealValue";

export interface SetterMetrics {
  totalLeads: number;
  totalDials: number;
  totalBooked: number;
  bookedWithoutValue: number;
  conversionRate: number;
  powerScore: number;
  projectedRevenue: number;
}

export function calculateSetterMetrics(
  allLeads: any[],
  allNotes: Record<string, any>,
  userId: string,
  timeframe: 'today' | 'month' | 'all' = 'all'
): SetterMetrics {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const notesArray = Object.values(allNotes);

  const filteredNotes = notesArray.filter((n: any) => {
    // SECURITY: Always filter by the current user for individual performance
    if (n.setter_id !== userId) return false;

    if (timeframe === 'today') {
      return n.synced_at?.startsWith(todayStr);
    } else if (timeframe === 'month') {
      const d = new Date(n.synced_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true; // 'all'
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
