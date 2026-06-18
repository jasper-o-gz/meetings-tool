export interface Client {
  id: string
  name: string
  color: string       // tekstkleur hex, bijv. '#4f7eff'
  color_bg: string    // achtergrondkleur hex, bijv. '#1a2438'
  created_at: string
}

export interface Meeting {
  id: string
  client_id: string
  date: string        // 'YYYY-MM-DD'
  type: string
  notes: string
  actions: string[]
  created_at: string
}
