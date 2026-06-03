import { GrapholElement, GrapholEntity } from "grapholscape";

export interface MessageItem<T = any> {
  author: string;
  content: string;
  datetime: number;
  // avatar?: string;
  extraData?: T,
  accepted?: boolean,
}

export type NewItem = {
  grapholElement: GrapholElement,
  grapholEntity: GrapholEntity,
}

export type NewClassItem = NewItem & {
  properties?: NewItem[],
}

export enum AssistantRequestStatusEnum {
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

export type RequestHistoryItem<T = any> = {
  messageSent: MessageItem<undefined>,
  response?: MessageItem<T>,
  status: {
    code: AssistantRequestStatusEnum,
    progress: number,
    errorMessage?: string,
  },
}

export type ExplainerResponseExtraData = {
  words: string[],
  ontologyEntities: { [x: string]: string }
}