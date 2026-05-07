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
    setStatus("Sending...");
    try {
      const formData = new URLSearchParams();
      formData.append("students", JSON.stringify(rows));
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setStatus("Sent successfully");
    } catch (err) {
      setStatus("Send error: " + err.message);
    }
  }

  return (
    <div className="modern-center-wrapper">
      <style>{`
        .modern-center-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f7f8fa;
        }
        .modern-uploader-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.07);
          padding: 2.5rem 2rem 2rem 2rem;
          min-width: 320px;
          max-width: 95vw;
          width: 370px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modern-uploader-box h2 {
          margin-bottom: 1.2rem;
          font-weight: 600;
          font-size: 1.5rem;
          color: #222;
        }
        .modern-uploader-box input[type="file"] {
          margin-bottom: 1.2rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 0.5rem 0.7rem;
          background: #fafbfc;
          font-size: 1rem;
        }
        .modern-uploader-box button {
          background: #222;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0.6rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          margin-top: 0.5rem;
          cursor: pointer;
          transition: background 0.18s;
        }
        .modern-uploader-box button:disabled {
          background: #bbb;
          cursor: not-allowed;
        }
        .modern-status {
          margin: 1.2rem 0 0.5rem 0;
          color: #666;
          font-size: 0.98rem;
          min-height: 1.2em;
        }
        .modern-preview {
          width: 100%;
          background: #f4f6f8;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1.2rem;
          font-size: 0.98rem;
          color: #222;
          max-height: 200px;
          overflow: auto;
        }
        .modern-preview h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.08rem;
          color: #444;
        }
      `}</style>
      <div className="modern-uploader-box">
        <h2>Exam Notification</h2>
        <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        <button onClick={sendData} disabled={!rows.length}>
          Send to webhook
        </button>
        <div className="modern-status">{status}</div>
        {rows.length > 0 && (
          <div className="modern-preview">
            <h4>Preview (first 5 rows)</h4>
            <pre style={{ margin: 0, background: "none", padding: 0 }}>
              {JSON.stringify(rows.slice(0, 5), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
