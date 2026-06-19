/**
 * API Client Module
 * Wraps all communication with the Flask backend.
 */

export async function fetchReleaseNotes(forceRefresh = false) {
  const url = `/api/notes${forceRefresh ? '?refresh=true' : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Server API returned error HTTP ${response.status}`);
  }
  
  const data = await response.json();
  if (data.status === 'error') {
    throw new Error(data.message);
  }
  
  return data;
}

export async function requestAiAnalysis(noteId, noteContent, dateStr, typeStr, mode, length) {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: noteId,
      content: noteContent,
      date: dateStr,
      type: typeStr,
      mode: mode,      // summary, explanation_beginner, explanation_tech, impact, migration, upgrade_checklist, breaking_warning, tweet, linkedin, blog
      length: length   // short, medium, long
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI Service returned HTTP ${response.status}`);
  }
  
  const data = await response.json();
  if (data.status === 'error') {
    throw new Error(data.message);
  }
  
  return data;
}
