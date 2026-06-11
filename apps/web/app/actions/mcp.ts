"use server";

import { executeMcpTool } from "@/lib/mcp";
import { unstable_noStore as noStore } from 'next/cache';
import { adminAuth } from "@/lib/firebase/admin";

async function verifyAuth(idToken?: string) {
  if (!idToken) throw new Error("Unauthorized");
  if (!adminAuth) throw new Error("Admin Auth not initialized");
  await adminAuth.verifyIdToken(idToken);
}

export async function getClassScheduleAction(branch: string, idToken: string, dayOfWeek?: string) {
  noStore();
  try {
    await verifyAuth(idToken);
    const args: Record<string, any> = { branch };
    if (dayOfWeek) args.day_of_week = dayOfWeek;
    const result = await executeMcpTool("get_class_schedule", args);
    if (result.error) throw new Error(result.error);
    return result.result || result;
  } catch (error) {
    console.error("[Server Action] getClassSchedule error:", error);
    return null;
  }
}

export async function getCafeteriaMenuAction(date: string, idToken: string) {
  noStore();
  try {
    await verifyAuth(idToken);
    const result = await executeMcpTool("get_menu_for_date", { date });
    if (result.error) throw new Error(result.error);
    return result.result || result;
  } catch (error) {
    console.error("[Server Action] getCafeteriaMenu error:", error);
    return null;
  }
}

export async function getUpcomingEventsAction(idToken: string) {
  noStore();
  try {
    await verifyAuth(idToken);
    const result = await executeMcpTool("get_upcoming_events", {});
    if (result.error) throw new Error(result.error);
    return result.result || result;
  } catch (error) {
    console.error("[Server Action] getUpcomingEvents error:", error);
    return null;
  }
}

export async function getNewArrivalsAction(idToken: string) {
  noStore();
  try {
    await verifyAuth(idToken);
    const result = await executeMcpTool("get_new_arrivals", {});
    if (result.error) throw new Error(result.error);
    return result.result || result;
  } catch (error) {
    console.error("[Server Action] getNewArrivals error:", error);
    return null;
  }
}

export async function getPopularBooksAction(idToken: string) {
  noStore();
  try {
    await verifyAuth(idToken);
    const result = await executeMcpTool("get_popular_books", {});
    if (result.error) throw new Error(result.error);
    return result.result || result;
  } catch (error) {
    console.error("[Server Action] getPopularBooks error:", error);
    return null;
  }
}

export async function getRandomBooksAction(idToken: string) {
  noStore();
  try {
    await verifyAuth(idToken);
    const result = await executeMcpTool("search_books", { query: "" });
    if (result.error) throw new Error(result.error);
    
    let allBooks = result.result || result;
    if (!Array.isArray(allBooks)) return [];

    const interdisciplinaryCategories = [
      'Management', 
      'Entrepreneurship', 
      'Mathematics', 
      'Data Science',
      'Artificial Intelligence'
    ];
    
    const filtered = allBooks.filter(b => interdisciplinaryCategories.includes(b.category));
    
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    return filtered.slice(0, 3);
  } catch (error) {
    console.error("[Server Action] getRandomBooks error:", error);
    return null;
  }
}

export async function getServiceStatusesAction(idToken?: string) {
  noStore();
  
  const servers = [
    { name: "Library", url: "http://127.0.0.1:3001/" },
    { name: "Cafeteria", url: "http://127.0.0.1:3002/" },
    { name: "Events", url: "http://127.0.0.1:3003/" },
    { name: "Academics", url: "http://127.0.0.1:3004/" }
  ];

  const statuses: Record<string, boolean> = {
    Academics: false,
    Library: false,
    Events: false,
    Cafeteria: false
  };

  await Promise.all(servers.map(async (server) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout
      
      await fetch(server.url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      statuses[server.name] = true;
    } catch (error: any) {
      statuses[server.name] = false;
    }
  }));

  return statuses;
}
