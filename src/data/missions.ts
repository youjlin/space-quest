export interface Mission {
  id: number
  title: string
  question: string
  description: string
  topics: string[]
  icon: 'planet' | 'satellite' | 'signal'
  path?: string
  entryLabel: string
  completedLabel?: string
  replayLabel?: string
}

export const missions: Mission[] = [
  {
    id: 1,
    title: '這件事，可以請衛星幫忙嗎？',
    question: '原來，太空離我們這麼近。',
    description: '看看颱風、偏遠地區聯絡與登山找路等生活情境，認識衛星的三種用途。',
    topics: ['生活情境', '衛星用途'],
    icon: 'planet',
    path: '/missions/1',
    entryLabel: '進入第一關', completedLabel: '第一關已完成', replayLabel: '重玩第一關',
  },
  {
    id: 2,
    title: '幫衛星準備出任務',
    question: '拍到照片之後，還需要什麼？',
    description: '要取得地球影像並傳回地面，衛星需要哪些功能？一起認識任務背後的分工。',
    topics: ['功能選擇', '任務規劃'],
    icon: 'satellite',
    path: '/missions/2',
    entryLabel: '進入第二關', completedLabel: '第二關已完成', replayLabel: '再看第二關',
  },
  {
    id: 3,
    title: '執行衛星任務',
    question: '換你坐上任務控制台。',
    description: '安排充電、拍攝與傳送，在有限的電量與回合中，讓地球影像順利回家。',
    topics: ['回合操作', '資源管理'],
    icon: 'signal',
    path: '/missions/3',
    entryLabel: '挑戰第三關',
  },
]
