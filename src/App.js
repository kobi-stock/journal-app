import React, { useState, useEffect, useMemo, useRef } from "react";

// 🔥 Firebase 추가
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ===== 기존 코드 유지 =====
const today = new Date();
const pad = (n) => String(n).padStart(2, "0");
const defaultDate =
  today.getFullYear() +
  "-" +
  pad(today.getMonth() + 1) +
  "-" +
  pad(today.getDate());

const STORAGE_KEY = "my-cute-journal-v8";
const PASSWORD_KEY = "journal-password-v1";

function App() {
  // 🔥 Firebase user
  const [user, setUser] = useState(null);

  // ===== 기존 state =====
  const [pages, setPages] = useState([
    {
      id: 1,
      date: defaultDate,
      title: "첫 페이지",
      photo: "",
      leftMemo: "",
      rightText: "",
      favorite: false,
    },
  ]);

  const [savedAt, setSavedAt] = useState(null);
  const saveTimerRef = useRef(null);

  // ===== 🔥 로그인 상태 감지 =====
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // ===== 🔥 로그인 함수 =====
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("로그인 실패");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ===== 🔥 저장 함수 (핵심) =====
  const saveJournal = async (data = pages) => {
    try {
      const payload = { pages: data, savedAt: new Date().toISOString() };

      if (user) {
        await setDoc(doc(db, "journals", user.uid), payload);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }

      setSavedAt(payload.savedAt);
    } catch (e) {
      console.error("저장 실패:", e);
    }
  };

  // ===== 🔥 자동 저장 =====
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      saveJournal().catch(console.error);
    }, 500);

    return () => clearTimeout(saveTimerRef.current);
  }, [pages, user]);

  // ===== 🔥 로그인 시 데이터 불러오기 =====
  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "journals", user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setPages(data.pages || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, [user]);

  // ===== UI 테스트용 간단 구성 =====
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
        value={pages[0]?.rightText || ""}
        onChange={(e) =>
          setPages([{ ...pages[0], rightText: e.target.value }])
        }
        style={{ width: "100%", height: 200 }}
      />

      <div style={{ marginTop: 10 }}>
        저장 상태: {savedAt ? new Date(savedAt).toLocaleString() : "없음"}
      </div>
    </div>
  );
}

export default App;