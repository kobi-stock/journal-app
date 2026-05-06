import React, { useState, useEffect, useRef, useCallback } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const STORAGE_KEY = "journal-temp";

function App() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const saveTimer = useRef(null);

  // 로그인 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 로그인
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("로그인 실패");
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    await signOut(auth);
  };

  // 저장 함수
  const saveData = useCallback(
    async (value) => {
      try {
        const payload = {
          text: value,
          savedAt: new Date().toISOString()
        };

        if (user) {
          await setDoc(doc(db, "notes", user.uid), payload);
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }

        setSavedAt(payload.savedAt);
      } catch (e) {
        console.error("저장 실패:", e);
      }
    },
    [user]
  );

  // 자동 저장
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      saveData(text);
    }, 500);

    return () => clearTimeout(saveTimer.current);
  }, [text, saveData]);

  // 로그인 시 데이터 불러오기
  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "notes", user.uid));
        if (snap.exists()) {
          setText(snap.data().text || "");
        }
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📒 노트 앱</h2>

      <div style={{ marginBottom: 10 }}>
        {user ? (
          <>
            <span>{user.email}</span>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <button onClick={handleLogin}>구글 로그인</button>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", height: 200 }}
      />

      <div>
        저장 상태: {savedAt ? new Date(savedAt).toLocaleString() : "없음"}
      </div>
    </div>
  );
}

export default App;