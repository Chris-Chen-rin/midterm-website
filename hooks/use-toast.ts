"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToast = (state: State, toast: ToasterToast) => {
  const { toasts } = state

  toast.id = toast.id || genId()

  if (toasts.length > TOAST_LIMIT - 1) {
    toasts.pop()
  }

  return {
    ...state,
    toasts: [toast, ...toasts],
  }
}

const updateToast = (state: State, toast: Partial<ToasterToast>) => {
  if (!toast.id) {
    return state
  }

  const { toasts } = state

  const newToasts = toasts.map((t) =>
    t.id === toast.id ? { ...t, ...toast } : t
  )

  return {
    ...state,
    toasts: newToasts,
  }
}

const dismissToast = (state: State, toastId?: string) => {
  const { toasts } = state

  const newToasts = toasts.map((t) =>
    t.id === toastId || toastId === undefined
      ? {
          ...t,
          open: false,
        }
      : t
  )

  return {
    ...state,
    toasts: newToasts,
  }
}

const removeToast = (state: State, toastId?: string) => {
  if (toastId === undefined) {
    return {
      ...state,
      toasts: [],
    }
  }

  return {
    ...state,
    toasts: state.toasts.filter((t) => t.id !== toastId),
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return addToast(state, action.toast)
    case "UPDATE_TOAST":
      return updateToast(state, action.toast)
    case "DISMISS_TOAST":
      return dismissToast(state, action.toastId)
    case "REMOVE_TOAST":
      return removeToast(state, action.toastId)
    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
