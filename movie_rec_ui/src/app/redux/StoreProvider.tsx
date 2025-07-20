'use client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { makeStore, persistor } from './store'

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={makeStore}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>

  )
}