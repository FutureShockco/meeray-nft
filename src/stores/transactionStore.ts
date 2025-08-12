import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { TransactionStatus } from '../composables/useTransactionService'

export interface TransactionHistory {
  id: string
  type: string
  status: 'COMPLETED' | 'FAILED'
  timestamp: number
  result?: any
  error?: string
  steemTxId?: string
  sidechainTxId?: string
}

export const useTransactionStore = defineStore('transactions', () => {
  // State
  const transactionHistory = ref<TransactionHistory[]>([])
  const globalPendingTransactions = ref<Map<string, TransactionStatus>>(new Map())
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'info'
    title: string
    message: string
    timestamp: number
    read: boolean
  }>>([])

  // Getters
  const completedTransactions = computed(() => 
    transactionHistory.value.filter(tx => tx.status === 'COMPLETED')
  )

  const failedTransactions = computed(() => 
    transactionHistory.value.filter(tx => tx.status === 'FAILED')
  )

  const pendingTransactionsList = computed(() => 
    Array.from(globalPendingTransactions.value.values())
  )

  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  )

  const transactionsByType = computed(() => {
    const grouped: Record<string, TransactionHistory[]> = {}
    
    transactionHistory.value.forEach(tx => {
      if (!grouped[tx.type]) {
        grouped[tx.type] = []
      }
      grouped[tx.type].push(tx)
    })
    
    return grouped
  })

  // Actions
  const addPendingTransaction = (transaction: TransactionStatus) => {
    globalPendingTransactions.value.set(transaction.id, transaction)
  }

  const updateTransactionStatus = (txId: string, updates: Partial<TransactionStatus>) => {
    const existing = globalPendingTransactions.value.get(txId)
    if (existing) {
      const updated = { ...existing, ...updates }
      globalPendingTransactions.value.set(txId, updated)
      
      // Move to history if completed or failed
      if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
        moveToHistory(updated)
        globalPendingTransactions.value.delete(txId)
      }
    }
  }

  const moveToHistory = (transaction: TransactionStatus) => {
    const historyEntry: TransactionHistory = {
      id: transaction.id,
      type: transaction.type,
      status: transaction.status as 'COMPLETED' | 'FAILED',
      timestamp: transaction.timestamp,
      result: transaction.result,
      error: transaction.error,
      steemTxId: transaction.steemTxId,
      sidechainTxId: transaction.sidechainTxId
    }
    
    transactionHistory.value.unshift(historyEntry)
    
    // Keep only last 100 transactions
    if (transactionHistory.value.length > 100) {
      transactionHistory.value = transactionHistory.value.slice(0, 100)
    }

    // Add notification
    addNotification({
      type: transaction.status === 'COMPLETED' ? 'success' : 'error',
      title: getTransactionTitle(transaction.type, transaction.status),
      message: getTransactionMessage(transaction),
    })
  }

  const addNotification = (notification: {
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  }) => {
    const newNotification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    }
    
    notifications.value.unshift(newNotification)
    
    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  const markNotificationAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const clearTransactionHistory = () => {
    transactionHistory.value = []
  }

  const getTransactionById = (txId: string): TransactionHistory | TransactionStatus | null => {
    // Check pending first
    const pending = globalPendingTransactions.value.get(txId)
    if (pending) return pending
    
    // Check history
    return transactionHistory.value.find(tx => tx.id === txId) || null
  }

  const getTransactionTitle = (type: string, status: string): string => {
    const action = type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    return status === 'COMPLETED' ? `${action} Completed` : `${action} Failed`
  }

  const getTransactionMessage = (transaction: TransactionStatus): string => {
    if (transaction.status === 'COMPLETED') {
      switch (transaction.type) {
        case 'CREATE_COLLECTION':
          return `NFT collection "${transaction.result?.symbol}" created successfully`
        case 'MINT_NFT':
          return `NFT minted successfully in collection "${transaction.result?.collectionSymbol}"`
        case 'LIST_NFT':
          return `NFT listed for ${transaction.result?.price} ${transaction.result?.paymentTokenSymbol}`
        case 'BUY_NFT':
          return transaction.result?.bidAmount 
            ? `Bid placed for ${transaction.result.bidAmount}` 
            : 'NFT purchased successfully'
        case 'DELIST_NFT':
          return 'NFT delisted successfully'
        case 'TRANSFER_NFT':
          return `NFT transferred to ${transaction.result?.to}`
        case 'ACCEPT_BID':
          return 'Bid accepted successfully'
        case 'CLOSE_AUCTION':
          return 'Auction closed successfully'
        case 'BATCH_OPERATIONS':
          return `Batch operation completed (${transaction.result?.operations?.length || 0} operations)`
        default:
          return 'Transaction completed successfully'
      }
    } else {
      return transaction.error || 'Transaction failed'
    }
  }

  // Persistence (save to localStorage)
  const saveToStorage = () => {
    if (process.client) {
      try {
        localStorage.setItem('nft-transaction-history', JSON.stringify(transactionHistory.value))
        localStorage.setItem('nft-notifications', JSON.stringify(notifications.value))
      } catch (error) {
        console.error('Failed to save transaction data to localStorage:', error)
      }
    }
  }

  const loadFromStorage = () => {
    if (process.client) {
      try {
        const savedHistory = localStorage.getItem('nft-transaction-history')
        if (savedHistory) {
          transactionHistory.value = JSON.parse(savedHistory)
        }
        
        const savedNotifications = localStorage.getItem('nft-notifications')
        if (savedNotifications) {
          notifications.value = JSON.parse(savedNotifications)
        }
      } catch (error) {
        console.error('Failed to load transaction data from localStorage:', error)
      }
    }
  }

  // Watch for changes and save to storage
  if (process.client) {
    watch([transactionHistory, notifications], () => {
      saveToStorage()
    }, { deep: true })
  }

  return {
    // State
    transactionHistory: readonly(transactionHistory),
    globalPendingTransactions: readonly(globalPendingTransactions),
    notifications: readonly(notifications),
    
    // Getters
    completedTransactions,
    failedTransactions,
    pendingTransactionsList,
    unreadNotifications,
    transactionsByType,
    
    // Actions
    addPendingTransaction,
    updateTransactionStatus,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    clearTransactionHistory,
    getTransactionById,
    loadFromStorage,
    saveToStorage
  }
})
