// Enterprise AI — AI Assistant Panel. Xarid/yetkazib beruvchi ma'lumotidan
// hisoblangan barcha tavsiya/ogohlantirish/bashorat/imkoniyat/kuzatuvlarni
// bitta joyda ko'rsatadi: filtr (kategoriya/ustuvorlik/qidiruv), holat
// tablari (faol/belgilangan/bajarilgan/yopilgan/tarix). Mavjud PurchaseTabs,
// PurchaseKpiCard, EmptyState komponentlari qayta ishlatiladi — yangi
// dizayn tizimi yaratilmaydi (Liquid Glass saqlanadi).
// `scopeFilter` — shu panelni bitta supplier yoki qisqa ro'yxatga toraytirish
// uchun ixtiyoriy predikat (masalan Supplier profilidagi "AI tahlil" tabi).
// `compact` — faqat qisqa ro'yxat (filtr/tab boshqaruvisiz) — Suppliers
// ro'yxat sahifasidagi "Tavsiya etilgan yetkazib beruvchilar" paneli uchun.

import { useMemo, useState } from "react";
import {
  Gauge,
  Gem,
  History,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import PurchaseKpiCard from "../../../components/PurchaseKpiCard/PurchaseKpiCard";
import PurchaseSelectField from "../../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseTabs from "../../../components/PurchaseTabs/PurchaseTabs";
import { EmptyState } from "../../../../../components/ui/EmptyState/EmptyState";
import { formatPurchaseDate } from "../../../utils/purchaseMoney";
import {
  AI_CATEGORY_LABELS,
  AI_HISTORY_ACTION_LABELS,
  AI_PRIORITY,
  AI_PRIORITY_LABELS,
  AI_PRIORITY_ORDER,
  AI_VIEW_TABS,
  AI_VIEW_TAB_LABELS,
} from "../../aiConstants";
import { useAIWorkspace } from "../../useAIWorkspace";
import AIInsightCard from "../AIInsightCard/AIInsightCard";

import "./AIWorkspace.scss";

const AIWorkspace = ({
  title = "AI ishchi maydoni",
  description = "Xarid va yetkazib beruvchi ma'lumotlaridan avtomatik hisoblangan tavsiya, ogohlantirish, bashorat va imkoniyatlar.",
  scopeFilter,
  compact = false,
  maxItems,
  hideSummary = false,
  emptyText = "Hozircha AI tavsiyalari yo'q — barcha ko'rsatkichlar me'yorida.",
}) => {
  const { insights, summary, history, actions } = useAIWorkspace({ scopeFilter });
  const [activeTab, setActiveTab] = useState(AI_VIEW_TABS.active);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");

  const counts = useMemo(
    () => ({
      [AI_VIEW_TABS.active]: insights.filter((entry) => !entry.dismissed && !entry.completed).length,
      [AI_VIEW_TABS.pinned]: insights.filter((entry) => entry.pinned && !entry.dismissed).length,
      [AI_VIEW_TABS.completed]: insights.filter((entry) => entry.completed).length,
      [AI_VIEW_TABS.dismissed]: insights.filter((entry) => entry.dismissed).length,
      [AI_VIEW_TABS.history]: history.length,
    }),
    [insights, history],
  );

  const availableCategories = useMemo(
    () => Array.from(new Set(insights.map((entry) => entry.category))),
    [insights],
  );

  const visibleByTab = useMemo(() => {
    switch (activeTab) {
      case AI_VIEW_TABS.pinned:
        return insights.filter((entry) => entry.pinned && !entry.dismissed);
      case AI_VIEW_TABS.completed:
        return insights.filter((entry) => entry.completed);
      case AI_VIEW_TABS.dismissed:
        return insights.filter((entry) => entry.dismissed);
      default:
        return insights.filter((entry) => !entry.dismissed && !entry.completed);
    }
  }, [insights, activeTab]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visibleByTab
      .filter((entry) => {
        const matchesQuery =
          !query ||
          entry.title.toLowerCase().includes(query) ||
          entry.message.toLowerCase().includes(query);
        const matchesCategory = category === "all" || entry.category === category;
        const matchesPriority = priority === "all" || entry.priority === priority;

        return matchesQuery && matchesCategory && matchesPriority;
      })
      .sort(
        (a, b) => AI_PRIORITY_ORDER.indexOf(a.priority) - AI_PRIORITY_ORDER.indexOf(b.priority),
      );
  }, [visibleByTab, search, category, priority]);

  const displayed = maxItems ? filtered.slice(0, maxItems) : filtered;

  const tabs = Object.values(AI_VIEW_TABS).map((id) => ({
    id,
    label: AI_VIEW_TAB_LABELS[id],
    count: counts[id],
  }));
  const categoryOptions = [
    { value: "all", label: "Barcha kategoriya" },
    ...availableCategories.map((id) => ({
      value: id,
      label: AI_CATEGORY_LABELS[id] || id,
    })),
  ];
  const priorityOptions = [
    { value: "all", label: "Barcha ustuvorlik" },
    ...Object.values(AI_PRIORITY).map((id) => ({
      value: id,
      label: AI_PRIORITY_LABELS[id],
    })),
  ];

  return (
    <section className={["ai-workspace", compact ? "ai-workspace--compact" : ""].filter(Boolean).join(" ")}>
      <header className="ai-workspace__header">
        <div className="ai-workspace__heading">
          <span className="ai-workspace__badge">
            <Sparkles size={14} />
            ZENIX AI
          </span>
          <h3>{title}</h3>
          {!compact && <p>{description}</p>}
        </div>
      </header>

      {!hideSummary && (
        <div className="ai-workspace__summary">
          <PurchaseKpiCard icon={Sparkles} label="Jami tavsiya" value={String(summary.total)} hint={summary.headline} />
          <PurchaseKpiCard icon={ShieldAlert} label="Kritik" value={String(summary.critical)} tone="danger" />
          <PurchaseKpiCard icon={Gauge} label="Yuqori ustuvor" value={String(summary.high)} tone="warning" />
          <PurchaseKpiCard icon={Gem} label="Imkoniyat" value={String(summary.opportunities)} tone="success" />
        </div>
      )}

      {!compact && (
        <div className="ai-workspace__controls">
          <div className="ai-workspace__search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Tavsiyalarni qidirish..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <PurchaseSelectField
            className="ai-workspace__select"
            value={category}
            options={categoryOptions}
            onChange={setCategory}
            placeholder="Barcha kategoriya"
          />

          <PurchaseSelectField
            className="ai-workspace__select"
            value={priority}
            options={priorityOptions}
            onChange={setPriority}
            placeholder="Barcha ustuvorlik"
          />
        </div>
      )}

      {!compact && <PurchaseTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />}

      <div className="ai-workspace__list">
        {activeTab === AI_VIEW_TABS.history && !compact ? (
          history.length ? (
            history.map((entry) => (
              <div className="ai-workspace__history-row" key={entry.id}>
                <History size={13} />
                <span className="ai-workspace__history-title">{entry.title}</span>
                <span className="ai-workspace__history-action">
                  {AI_HISTORY_ACTION_LABELS[entry.action] || entry.action}
                </span>
                <span className="ai-workspace__history-date">
                  {formatPurchaseDate(entry.at, { withTime: true })}
                </span>
              </div>
            ))
          ) : (
            <EmptyState icon={History} title="Tarix bo'sh" description="Hali hech qanday amal bajarilmagan." />
          )
        ) : displayed.length ? (
          displayed.map((insight) => (
            <AIInsightCard
              key={insight.id}
              insight={insight}
              onPin={actions.pin}
              onComplete={actions.complete}
              onDismiss={actions.dismiss}
              onRestore={actions.restore}
            />
          ))
        ) : (
          <EmptyState icon={Sparkles} title="Natija topilmadi" description={emptyText} />
        )}
      </div>
    </section>
  );
};

export default AIWorkspace;
