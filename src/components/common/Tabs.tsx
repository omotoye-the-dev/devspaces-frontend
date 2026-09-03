import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
  type KeyboardEvent,
  type JSX,
} from "react";
import { cn } from "@/lib/utils/cn";

export type TabsVariant = "line" | "pills" | "enclosed";
export type TabsSize = "sm" | "md" | "lg";

export interface TabItem {
  id: string;
  label: ReactNode;
  count?: number | string;
  icon?: ReactNode;
  badge?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a <Tabs> container");
  }
  return context;
}

// ---------------------------------------------------------
// Root Tabs Container
// ---------------------------------------------------------
export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  items?: TabItem[];
  variant?: TabsVariant;
  size?: TabsSize;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onChange,
  items,
  variant = "line",
  size = "md",
  fullWidth = false,
  className,
  children,
}: TabsProps): JSX.Element {
  const [internalTab, setInternalTab] = useState<string>(
    defaultValue ?? (items && items.length > 0 ? items[0].id : ""),
  );

  const activeTab = value !== undefined ? value : internalTab;

  const handleTabChange = (newTab: string): void => {
    if (value === undefined) {
      setInternalTab(newTab);
    }
    onChange?.(newTab);
  };

  const contextValue: TabsContextValue = {
    activeTab,
    setActiveTab: handleTabChange,
    variant,
    size,
    baseId: "tabs",
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("w-full flex flex-col gap-4 font-inter", className)}>
        {items ? (
          <>
            <TabList fullWidth={fullWidth}>
              {items.map((item) => (
                <Tab
                  key={item.id}
                  id={item.id}
                  disabled={item.disabled}
                  icon={item.icon}
                  count={item.count}
                  badge={item.badge}
                >
                  {item.label}
                </Tab>
              ))}
            </TabList>

            {items.map((item) =>
              item.content ? (
                <TabPanel key={item.id} id={item.id}>
                  {item.content}
                </TabPanel>
              ) : null,
            )}
          </>
        ) : (
          children
        )}
      </div>
    </TabsContext.Provider>
  );
}

// ---------------------------------------------------------
// TabList Component
// ---------------------------------------------------------
export interface TabListProps {
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export function TabList({ fullWidth = false, className, children }: TabListProps): JSX.Element {
  const { variant } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const listVariantStyles: Record<TabsVariant, string> = {
    line: "border-b border-border gap-6",
    pills: "bg-border/30 p-1 rounded-lg gap-1",
    enclosed: "border-b border-border gap-2",
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (!listRef.current) return;
    const tabs = Array.from(
      listRef.current.querySelectorAll<HTMLButtonElement>('button[role="tab"]:not([disabled])'),
    );
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex((t) => t === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number;

    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-center overflow-x-auto sm:overflow-visible overflow-y-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none",
        fullWidth && "w-full justify-between",
        listVariantStyles[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------
// Tab Component
// ---------------------------------------------------------
export interface TabProps {
  id: string;
  disabled?: boolean;
  icon?: ReactNode;
  count?: number | string;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Tab({
  id,
  disabled = false,
  icon,
  count,
  badge,
  className,
  children,
}: TabProps): JSX.Element {
  const { activeTab, setActiveTab, variant, size } = useTabsContext();
  const isSelected = activeTab === id;

  const sizeStyles: Record<TabsSize, string> = {
    sm: "text-xs py-1.5 px-2.5 gap-1.5",
    md: "text-sm py-2 px-3.5 gap-2",
    lg: "text-base py-2.5 px-4.5 gap-2.5",
  };

  const getVariantStyles = (): string => {
    if (variant === "line") {
      return isSelected
        ? "text-primary font-semibold border-b-2 border-primary"
        : "text-text/60 font-medium hover:text-text border-b-2 border-transparent";
    }
    if (variant === "pills") {
      return isSelected
        ? "bg-white text-text font-semibold shadow-xs rounded-md"
        : "text-text/60 font-medium hover:text-text rounded-md";
    }
    if (variant === "enclosed") {
      return isSelected
        ? "bg-white text-primary font-semibold border-t border-x border-border rounded-t-md"
        : "text-text/60 font-medium hover:text-text border-t border-x border-transparent rounded-t-md";
    }
    return "";
  };

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={isSelected}
      aria-controls={`panel-${id}`}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveTab(id)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        sizeStyles[size],
        getVariantStyles(),
        className,
      )}
    >
      {icon && <span className="shrink-0 inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.2 text-[11px] font-mono rounded-full shrink-0",
            isSelected ? "bg-primary/10 text-primary font-bold" : "bg-border/60 text-text/60",
          )}
        >
          {count}
        </span>
      )}
      {badge && <span className="ml-1 shrink-0">{badge}</span>}
    </button>
  );
}

// ---------------------------------------------------------
// TabPanel Component
// ---------------------------------------------------------
export interface TabPanelProps {
  id: string;
  className?: string;
  children: ReactNode;
}

export function TabPanel({ id, className, children }: TabPanelProps): JSX.Element | null {
  const { activeTab } = useTabsContext();
  if (activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={cn(
        "w-full animate-in fade-in-50 duration-150 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
