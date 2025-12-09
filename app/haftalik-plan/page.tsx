"use client";

import { useEffect, useMemo, useState } from "react";

type DayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

type TaskStatus = "pending" | "done" | "postponed";

type WeeklyTask = {
  id: string;
  day: DayKey;
  text: string;
  status: TaskStatus;
  createdAt: string;
};

const STORAGE_KEY = "crm-weekly-plan";

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "mon", label: "Pazartesi", short: "Pzt" },
  { key: "tue", label: "Salı", short: "Sal" },
  { key: "wed", label: "Çarşamba", short: "Çar" },
  { key: "thu", label: "Perşembe", short: "Per" },
  { key: "fri", label: "Cuma", short: "Cum" },
  { key: "sat", label: "Cumartesi", short: "Cmt" },
  { key: "sun", label: "Pazar", short: "Paz" },
];

function getTodayDayKey(): DayKey {
  const d = new Date().getDay(); // 0=Sunday, 1=Monday...
  switch (d) {
    case 1:
      return "mon";
    case 2:
      return "tue";
    case 3:
      return "wed";
    case 4:
      return "thu";
    case 5:
      return "fri";
    case 6:
      return "sat";
    case 0:
    default:
      return "sun";
  }
}

function loadTasks(): WeeklyTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WeeklyTask[];
    return parsed;
  } catch {
    return [];
  }
}

function saveTasks(tasks: WeeklyTask[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export default function HaftalikPlanPage() {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayDayKey());
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    const data = loadTasks();
    setTasks(data);
  }, []);

  const tasksForSelectedDay = useMemo(
    () => tasks.filter((t) => t.day === selectedDay),
    [tasks, selectedDay]
  );

  const dayStats = useMemo(() => {
    const stats: Record<
      DayKey,
      { total: number; done: number; pending: number; postponed: number }
    > = {
      mon: { total: 0, done: 0, pending: 0, postponed: 0 },
      tue: { total: 0, done: 0, pending: 0, postponed: 0 },
      wed: { total: 0, done: 0, pending: 0, postponed: 0 },
      thu: { total: 0, done: 0, pending: 0, postponed: 0 },
      fri: { total: 0, done: 0, pending: 0, postponed: 0 },
      sat: { total: 0, done: 0, pending: 0, postponed: 0 },
      sun: { total: 0, done: 0, pending: 0, postponed: 0 },
    };

    tasks.forEach((t) => {
      const s = stats[t.day];
      s.total += 1;
      if (t.status === "done") s.done += 1;
      else if (t.status === "pending") s.pending += 1;
      else if (t.status === "postponed") s.postponed += 1;
    });

    return stats;
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;
    const nowIso = new Date().toISOString();

    const newTask: WeeklyTask = {
      id: `${selectedDay}-${Date.now()}`,
      day: selectedDay,
      text,
      status: "pending",
      createdAt: nowIso,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setNewTaskText("");
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, status } : t
      );
      saveTasks(updated);
      return updated;
    });
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTasks(updated);
      return updated;
    });
  };

  return (
    <div className="crm-layout">
      {/* BAŞLIK */}
      <section className="page-card crm-header">
        <div>
          <h1 className="crm-title">Bir Haftalık Plan</h1>
          <p className="crm-subtitle">
            Hafta içi (ve istersen hafta sonu) için günlük yapılacak işleri
            planla. Her görev için durum seç: Bekliyor, Tamamlandı, Ertelendi.
          </p>
        </div>
        <div className="crm-header-meta">
          <div className="crm-header-count">
            Toplam görev: <strong>{tasks.length}</strong>
          </div>
          <div className="crm-header-note">
            Kısa, net maddeler halinde haftalık aksiyonlarını burada
            tutabilirsin.
          </div>
        </div>
      </section>

      {/* GÖVDE */}
      <div className="crm-grid">
        {/* SOL: Gün seçimi */}
        <section className="page-card">
          <h2 className="crm-section-title">Gün Seç</h2>
          <p className="crm-section-subtitle">
            Önce plan yapmak istediğin günü seç, sonra sağ taraftan görev ekle.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
              marginTop: 6,
            }}
          >
            {DAYS.map((d) => {
              const stat = dayStats[d.key];
              const isToday = d.key === getTodayDayKey();
              const active = d.key === selectedDay;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  style={{
                    borderRadius: 10,
                    padding: "8px 10px",
                    border: active
                      ? "1px solid rgba(56,189,248,0.9)"
                      : "1px solid rgba(148,163,184,0.4)",
                    backgroundColor: active
                      ? "rgba(15,23,42,0.96)"
                      : "transparent",
                    textAlign: "left",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{d.label}</span>
                    {isToday && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 999,
                          border: "1px solid rgba(56,189,248,0.8)",
                        }}
                      >
                        Bugün
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      display: "flex",
                      gap: 6,
                    }}
                  >
                    <span>Toplam: {stat.total}</span>
                    <span>✓ {stat.done}</span>
                    <span>⏳ {stat.pending}</span>
                    <span>➡️ {stat.postponed}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SAĞ: Seçilen günün görevleri */}
        <section className="page-card">
          <h2 className="crm-section-title">
            {DAYS.find((d) => d.key === selectedDay)?.label} Planı
          </h2>
          <p className="crm-section-subtitle">
            Örneğin &quot;X müşterisi aranacak&quot;, &quot;Teklif revize
            edilecek&quot;, &quot;Anlaşmalı istasyonla görüşülecek&quot; gibi
            maddeler ekleyebilirsin.
          </p>

          {/* Yeni görev formu */}
          <form
            onSubmit={handleAddTask}
            style={{ marginTop: 6, marginBottom: 10 }}
          >
            <div className="crm-form-group">
              <label>
                Yeni görev
                <textarea
                  className="crm-textarea"
                  rows={2}
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Örn: X lojistik ile yakıt anlaşması için dönüş yapılacak"
                />
              </label>
            </div>
            <button type="submit" className="crm-submit-btn">
              Görev Ekle
            </button>
          </form>

          {/* Görev listesi */}
          {tasksForSelectedDay.length === 0 ? (
            <div
              style={{
                fontSize: 12,
                color: "#9ca3af",
                marginTop: 6,
              }}
            >
              Bu gün için henüz görev eklenmemiş.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 4,
              }}
            >
              {tasksForSelectedDay.map((task) => (
                <div
                  key={task.id}
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.4)",
                    padding: "6px 8px",
                    fontSize: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        textDecoration:
                          task.status === "done"
                            ? "line-through"
                            : "none",
                        color:
                          task.status === "postponed"
                            ? "#facc15"
                            : undefined,
                      }}
                    >
                      {task.text}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      style={{
                        fontSize: 11,
                        border: "none",
                        background: "transparent",
                        color: "#f97373",
                        cursor: "pointer",
                      }}
                    >
                      Sil
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>
                      {new Date(task.createdAt).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 11 }}>Durum:</span>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(
                            task.id,
                            e.target.value as TaskStatus
                          )
                        }
                        className="crm-input"
                        style={{
                          fontSize: 11,
                          height: 28,
                          padding: "2px 6px",
                          width: 130,
                        }}
                      >
                        <option value="pending">Bekliyor</option>
                        <option value="done">Tamamlandı</option>
                        <option value="postponed">Ertelendi</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
