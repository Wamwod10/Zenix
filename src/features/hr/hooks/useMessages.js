import { useMemo } from "react";

export const useMessages = (state, currentEmployeeId = "") =>
  useMemo(() => {
    const threads = state.messages.reduce((map, message) => {
      const current = map[message.threadId] || [];
      return { ...map, [message.threadId]: [message, ...current] };
    }, {});
    const unread = state.messages.filter((message) => !(message.readBy || []).includes(currentEmployeeId));
    return { messages: state.messages, threads, unread };
  }, [currentEmployeeId, state.messages]);

export default useMessages;
