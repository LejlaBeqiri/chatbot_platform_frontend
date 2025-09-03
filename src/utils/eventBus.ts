import mitt from 'mitt';

type ToastAction = {
    text: string;
    callback: () => void;
};

export type BaseToastPayload = {
    title: string;
    message: string;
    persistent?: boolean;
    action?: ToastAction;
};

type ShowToastPayload = BaseToastPayload & {
    type: 'success' | 'error' | 'warning' | 'info';
    onMount?: (id: string) => void;
};

type Events = {
    'show-toast': ShowToastPayload;
    'show-success': BaseToastPayload;
    'show-error': BaseToastPayload;
    'show-warning': BaseToastPayload;
    'hide-all-toasts': void;
    'hide-toast': string;
    'show-notification': {
        title: string;
        message: string;
    };
    'workflow-data': any;
    'workflow-create': void;
    'workflow-update': void;
    'toggle-workflow-actions': {
        show: boolean;
        position?: { x: number; y: number };
    };
    'workflow-add-new-node': any;
    'disable-create-workflow': void;
    'enable-create-workflow': void;
    'node-sheet-show': any;
};

const emitter = mitt<Events>();

export default emitter;