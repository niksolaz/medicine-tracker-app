import { useState, useEffect } from 'react'
import { Toast, ToastProps } from './toast'

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: Omit<ToastProps, 'id'>) => {
    const id = Date.now().toString()
    setToasts((prevToasts) => [...prevToasts, { id, ...props }])
  }

  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dismissToast(toasts[0].id)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [toasts])

  return { toast, toasts, dismissToast }
}