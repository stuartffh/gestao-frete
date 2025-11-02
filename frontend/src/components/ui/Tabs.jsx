import React, { useState } from 'react';
import { cn } from '../../lib/utils';

const Tabs = ({ children, defaultValue, onValueChange, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  const childrenArray = React.Children.toArray(children);
  const listItems = childrenArray.filter((child) => child.type === TabsList);
  const panels = childrenArray.filter((child) => child.type === TabsContent);

  return (
    <div className={className}>
      {listItems.map((list, idx) =>
        React.cloneElement(list, { activeTab, onTabChange: handleTabChange, key: idx })
      )}
      {panels.map((panel, idx) =>
        React.cloneElement(panel, { activeTab, key: idx })
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange, className }) => {
  return (
    <div
      className={cn('flex border-b border-border gap-1', className)}
      role="tablist"
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, onTabChange })
      )}
    </div>
  );
};

const TabsTrigger = ({ value, children, activeTab, onTabChange, className }) => {
  const isActive = activeTab === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tab-${value}`}
      onClick={() => onTabChange?.(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-muted hover:text-text',
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, activeTab, className }) => {
  if (activeTab !== value) return null;
  return (
    <div
      id={`tab-${value}`}
      role="tabpanel"
      className={cn('mt-4', className)}
    >
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;

