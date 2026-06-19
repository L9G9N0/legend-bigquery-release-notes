/**
 * Export Engine Module
 * Handles copying content (Plain, Markdown, HTML) and exporting data (JSON, CSV, PDF).
 */

// ==========================================================================
// Formatting Helpers
// ==========================================================================
export function formatAsMarkdown(note) {
  return `## BigQuery Release Note: ${note.type} (${note.date})

${note.plain_text}

*Source: ${note.link || 'https://cloud.google.com/bigquery/docs/release-notes'}*`;
}

export function formatAsHtml(note) {
  return `<article class="bigquery-release-note">
  <header>
    <h2>BigQuery Release Note: ${note.type}</h2>
    <time datetime="${note.updated}">${note.date}</time>
  </header>
  <div class="content">
    ${note.html}
  </div>
  <footer>
    <p>Source: <a href="${note.link}">${note.link}</a></p>
  </footer>
</article>`;
}

// ==========================================================================
// Clipboard Actions
// ==========================================================================
export async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    throw new Error("Clipboard API not supported in this browser environment");
  }
  await navigator.clipboard.writeText(text);
}

// ==========================================================================
// Download Exporters (JSON / CSV)
// ==========================================================================
export function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function exportToJSON(notes, filename = 'bigquery_release_notes.json') {
  const jsonContent = JSON.stringify(notes, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

export function exportToCSV(notes, filename = 'bigquery_release_notes.csv') {
  // Define columns
  const headers = ['ID', 'Date', 'Type', 'Description', 'Link'];
  
  const csvRows = [
    headers.join(','), // header row
    ...notes.map(note => {
      const escape = (text) => `"${(text || '').replace(/"/g, '""').replace(/\r?\n|\r/g, ' ')}"`;
      return [
        escape(note.id),
        escape(note.date),
        escape(note.type),
        escape(note.plain_text),
        escape(note.link)
      ].join(',');
    })
  ];
  
  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

// PDF Export uses the native print engine with print-optimized styling
export function exportToPDF() {
  window.print();
}
