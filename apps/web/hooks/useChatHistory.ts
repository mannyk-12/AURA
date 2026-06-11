import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, setDoc, Timestamp, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/AuthProvider";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Timestamp;
}

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  messages: ChatMessage[];
}

export function useChatHistory() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setThreads([]);
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, "users", user.uid, "chatHistory");
    const q = query(chatsRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedThreads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatThread[];
      
      setThreads(fetchedThreads);
      setLoading(false);
      
      // Auto-select the most recent thread if none selected and threads exist
      // We don't auto-select anymore so users can start new chats easily, 
      // but it's an option. Let's keep activeThreadId as null by default for "New Chat"
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const createNewChat = () => {
    setActiveThreadId(null);
  };

  const selectChat = (id: string) => {
    setActiveThreadId(id);
  };

  const deleteChat = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "chatHistory", id));
      if (activeThreadId === id) {
        setActiveThreadId(null);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return {
    threads,
    activeThreadId,
    setActiveThreadId,
    createNewChat,
    selectChat,
    deleteChat,
    loading
  };
}
