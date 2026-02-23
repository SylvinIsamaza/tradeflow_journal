"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CommentType } from "@/types";

interface DayDetailsContextType {
  // State
  selectedDate: string | null;
  isTradeEditorOpen: boolean;
  commentEditorState: { isOpen: boolean; type: CommentType } | null;

  // Actions
  setSelectedDate: (date: string | null) => void;
  setIsTradeEditorOpen: (open: boolean) => void;
  setCommentEditorState: (
    state: { isOpen: boolean; type: CommentType } | null,
  ) => void;
  openDayDetails: (date: string) => void;
  closeDayDetails: () => void;
  openCommentEditor: (type: CommentType) => void;
  closeCommentEditor: () => void;
  openTradeEditor: () => void;
  closeTradeEditor: () => void;
}

const DayDetailsContext = createContext<DayDetailsContextType | undefined>(
  undefined,
);

export function DayDetailsProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isTradeEditorOpen, setIsTradeEditorOpen] = useState(false);
  const [commentEditorState, setCommentEditorState] = useState<{
    isOpen: boolean;
    type: CommentType;
  } | null>(null);

  const contextValue: DayDetailsContextType = {
    selectedDate,
    isTradeEditorOpen,
    commentEditorState,

    setSelectedDate,
    setIsTradeEditorOpen,
    setCommentEditorState,

    openDayDetails: (date: string) => setSelectedDate(date),
    closeDayDetails: () => {
      setSelectedDate(null);
      setIsTradeEditorOpen(false);
      setCommentEditorState(null);
    },
    openCommentEditor: (type: CommentType) => {
      setCommentEditorState({ isOpen: true, type });
    },
    closeCommentEditor: () => {
      setCommentEditorState(null);
    },
    openTradeEditor: () => {
      setIsTradeEditorOpen(true);
    },
    closeTradeEditor: () => {
      setIsTradeEditorOpen(false);
    },
  };

  return (
    <DayDetailsContext.Provider value={contextValue}>
      {children}
    </DayDetailsContext.Provider>
  );
}

export function useDayDetails() {
  const context = useContext(DayDetailsContext);
  if (!context) {
    throw new Error("useDayDetails must be used within DayDetailsProvider");
  }
  return context;
}
