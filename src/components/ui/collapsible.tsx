import React, { createContext, useContext } from "react";

interface CollapsibleContextValue {
  open: boolean;
  onToggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Collapsible({
  open = false,
  onOpenChange,
  children,
}: CollapsibleProps) {
  const handleToggle = () => {
    onOpenChange?.(!open);
  };

  return (
    <CollapsibleContext.Provider value={{ open, onToggle: handleToggle }}>
      <div data-state={open ? "open" : "closed"}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
}

export function CollapsibleTrigger({
  asChild = false,
  children,
}: CollapsibleTriggerProps) {
  const context = useContext(CollapsibleContext);
  if (!context) return children;

  const triggerProps = {
    onClick: (event: React.MouseEvent) => {
      (
        children.props as { onClick?: (event: React.MouseEvent) => void }
      )?.onClick?.(event);
      context.onToggle();
    },
  };

  if (asChild) {
    return React.cloneElement(children, triggerProps);
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  );
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleContent({
  children,
  className = "",
}: CollapsibleContentProps) {
  const context = useContext(CollapsibleContext);
  if (!context || !context.open) return null;

  return (
    <div className={className} data-state={context.open ? "open" : "closed"}>
      {children}
    </div>
  );
}
