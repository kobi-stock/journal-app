import React, { useState, useEffect, useCallback } from "react";

function App() {
  const [text, setText] = useState("");

  // 🔥 saveJournal 안정화 (ESLint 해결)
  const saveJournal = useCallback(() => {
    try {
      localStorage.setItem("journal", text);
    } catch (e) {
      console.error("저장 실패:", e);
    }
  }, [text]);

  // 🔥 dependency 문제 해결
  useEffect(() => {
    saveJournal();
  }, [saveJournal]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Journal App</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="오늘의 기록을 입력하세요..."
        style={{ width: "100%", height: "200px" }}
      />
    </div>
  );
}

export default App;