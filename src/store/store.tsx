// Entry component
import { App, message as messageAnt, notification as notificationAnt, } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { Configuration, ErrorContext, ResponseContext } from 'src/gen';
import * as apis from 'src/gen/apis';

let message: MessageInstance = messageAnt;
let notification: NotificationInstance = notificationAnt;

const TIMEOUT = 1000 * 60 * 10
let config = window['aiConfig'] || {}
let configuration: Configuration = new Configuration({
  ...config,
  middleware: [
    {
      pre: async (context) => {
        const controller = new AbortController()
        setTimeout(() => controller.abort({ message: 'Request timed out' }), TIMEOUT)
        context.init.signal = controller.signal
        return Promise.resolve(context)
      },
      post: async (context) => {
        if (context.response.status !== 200) {
          await readErrorMessage(context);
        }
        return Promise.resolve()
      },
      onError: async (context) => {
        await readErrorMessage(context);
        return Promise.resolve()
      }
    }
  ]
})

async function readErrorMessage(context: ResponseContext | ErrorContext) {
  const reader = context.response.body?.getReader();
  if (!reader) return;
  let msg = ''
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      let parsedError
      try {
        parsedError = JSON.parse(msg);
      } catch (e) {
        // not json
      }
      showError(parsedError?.detail?.message || parsedError?.detail || msg || 'Check the console for more details');
      return;
    }
    msg += new TextDecoder("utf-8").decode(value);
  }
}

export function showError(message: string) {
  notification.error({
    message: 'Error',
    description: <div style={{ maxHeight: 300, overflow: 'auto' }}>
      {message}
    </div>,
    duration: 0
  })
}

const StaticComponents = () => {
  const staticFunction = App.useApp();
  message = staticFunction.message;
  notification = staticFunction.notification;
  return null;
};

export default StaticComponents;

export { message, notification };

export let ConvertApi = new apis.ConvertApi(configuration)
export let PromptApi = new apis.PromptApi(configuration)
export let RAGApi = new apis.RAGApi(configuration)

export const setStore = (
  newMessage: MessageInstance,
  newNotification: NotificationInstance,
  newPromptApi: apis.PromptApi,
  newRAGApi: apis.RAGApi
) => {
  message = newMessage
  notification = newNotification
  PromptApi = newPromptApi
  RAGApi = newRAGApi
}
