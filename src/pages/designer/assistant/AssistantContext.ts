import { createContext } from "react";
import { RequestHistoryItem } from "src/model";

export type AssistantContextType<T = any> = {
  requestHistory: RequestHistoryItem<T>[],
  setRequestHistory: (newHistory: RequestHistoryItem<T>[]) => void,
  onClose: () => void,
  isAssistantRequestPending: boolean,
  setIsAssistantRequestPending: (isPending: boolean) => void,
}

const AssistantContext = createContext<AssistantContextType>({
  requestHistory: [],
  setRequestHistory: () => { },
  onClose: () => { },
  isAssistantRequestPending: false,
  setIsAssistantRequestPending: () => { },
})

export default AssistantContext