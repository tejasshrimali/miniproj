import React, { useState } from "react";
import Papa from "papaparse";

const WEBHOOK_URL =
  "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjIwNTY5MDYzMTA0MzQ1MjZiNTUzNyI_3D_pc/IjU3NjcwNTZlMDYzNTA0M2M1MjZlNTUzNzUxMzIi_pc";

export default function App() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Parsing CSV...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data || [];
        setRows(cleaned);
        setStatus(`Parsed ${cleaned.length} rows`);
      },
      error: (err) => setStatus("Parse error: " + err.message),
    });
  }

  async function sendData() {
    if (!rows.length) {
      setStatus("No data to send");
      return;
    }

    console.log("Total rows:", rows.length);
    setStatus("Sending...");

    try {
      // ✅ Convert to form-data style (CRITICAL FIX)
      const formData = new URLSearchParams();

      // stringify array so Pabbly can read it
      formData.append("students", JSON.stringify(rows));

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      setStatus("Sent successfully");
    } catch (err) {
      console.error(err);
      setStatus("Send error: " + err.message);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, Arial" }}>
      <h2>CSV Uploader</h2>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={sendData} disabled={!rows.length}>
          Send to webhook
        </button>
      </div>

      <p>Status: {status}</p>

      {rows.length > 0 && (
        <>
          <h4>Preview (first 5 rows)</h4>
          <pre style={{ maxHeight: 200, overflow: "auto" }}>
            {JSON.stringify(rows.slice(0, 5), null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}