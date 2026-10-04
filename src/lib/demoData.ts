import { DocumentRecord, DrawerSummary, DrawerType, DeadlineUrgency } from './types';
import SAMPLES_DATA from '../../backend/synthetic/samples.json';

// Compute days until deadline relative to current date
export function computeUrgency(expiryDateStr: string | null | undefined): { days: number | null; urgency: DeadlineUrgency } {
  if (!expiryDateStr) return { days: null, urgency: 'calm' };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(expiryDateStr.slice(0, 10));
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (days < 30) {
      return { days, urgency: 'red' };
    } else if (days <= 90) {
      return { days, urgency: 'amber' };
    } else {
      return { days, urgency: 'calm' };
    }
  } catch {
    return { days: null, urgency: 'calm' };
  }
}

export const SYNTHETIC_DOCUMENTS: DocumentRecord[] = (SAMPLES_DATA as any[]).map(doc => {
  const { days, urgency } = computeUrgency(doc.confirmed_expiry_date);
  return {
    ...doc,
    days_until_deadline: days,
    urgency
  } as DocumentRecord;
});

export function getDemoDrawersSummary(): DrawerSummary[] {
  const canonicalDrawers: DrawerType[] = ['Insurance', 'Property', 'Vehicle', 'Warranties', 'Identity'];
  
  return canonicalDrawers.map(drawer => {
    const docs = SYNTHETIC_DOCUMENTS.filter(d => d.confirmed_drawer === drawer);
    
    // Sort docs by urgency (lowest positive/negative days first)
    const docsWithDeadlines = docs.filter(d => d.days_until_deadline !== null && d.days_until_deadline !== undefined);
    docsWithDeadlines.sort((a, b) => (a.days_until_deadline ?? 9999) - (b.days_until_deadline ?? 9999));
    
    const nearestDoc = docsWithDeadlines[0];
    
    let urgency: DeadlineUrgency = 'calm';
    if (nearestDoc?.urgency) {
      urgency = nearestDoc.urgency;
    }
    
    return {
      drawer,
      total_documents: docs.length,
      nearest_deadline_days: nearestDoc?.days_until_deadline ?? null,
      nearest_deadline_date: nearestDoc?.confirmed_expiry_date ?? null,
      urgency,
      documents: docs
    };
  });
}
