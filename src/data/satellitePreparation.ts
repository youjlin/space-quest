export type PreparedFunction = 'camera' | 'power' | 'storage' | 'communication' | 'attitude'
export type PreparationChoice = PreparedFunction | 'navigation' | 'imaging-storage'

export const PREPARATION_CONTENT = {
  title: '幫衛星準備出任務',
  goal: '拍下地球照片，並把照片傳回地面。',
  completion: '衛星準備好了！接下來，試著安排它的工作。',
  support: '電力供應與姿態控制，協助這些工作進行。',
  limitation: '這裡介紹的是任務需要的部分功能，真實衛星還需要其他系統配合。',
  nextMission: '第三關主要練習電力、照片儲存與傳送時機，並未模擬所有衛星功能。',
  flow: [
    { label: '拍照', icon: 'camera' },
    { label: '暫存照片', icon: 'data' },
    { label: '傳回地面', icon: 'signal' },
  ],
} as const

export interface PreparationOption {
  id: PreparationChoice
  label: string
  hint?: string
}

export interface PreparationStep {
  id: PreparedFunction
  diagramLabel: string
  question: string
  options: readonly PreparationOption[]
  correctAnswer: PreparationChoice
  explanation: string
}

// 選項位置預先安排為 2、1、3、2、1，重試時保持不變。
export const PREPARATION_STEPS: readonly PreparationStep[] = [
  {
    id: 'camera', diagramLabel: '相機',
    question: '要拍下地球，需要什麼？',
    options: [
      { id: 'communication', label: '通訊天線', hint: '天線幫忙傳遞訊號。這一步要先取得地球的影像，想想哪種設備能拍照。' },
      { id: 'camera', label: '相機' },
      { id: 'navigation', label: '定位接收器', hint: '定位接收器利用訊號計算位置；這題要完成的是拍下地球影像。' },
    ],
    correctAnswer: 'camera',
    explanation: '相機能取得地球影像；照片是否清楚，還受到光線、朝向與設備等條件影響。',
  },
  {
    id: 'power', diagramLabel: '電力供應',
    question: '相機和其他設備需要電力，怎麼取得並保存？',
    options: [
      { id: 'power', label: '太陽能板與電池' },
      { id: 'imaging-storage', label: '相機與資料儲存裝置', hint: '拍照和保存照片都需要用電。想想哪組設備能把陽光變成電，並儲存電力。' },
      { id: 'communication', label: '通訊設備與天線', hint: '通訊設備也需要電力才能運作。這一步要找的是發電和儲存電力的設備。' },
    ],
    correctAnswer: 'power',
    explanation: '太陽能板在有日照時發電，電池則儲存電力，供沒有日照等需要時使用。電池可提供的電力也有限。',
  },
  {
    id: 'storage', diagramLabel: '照片暫存',
    question: '地面站還收不到訊號，拍好的照片先放哪裡？',
    options: [
      { id: 'communication', label: '通訊設備與天線', hint: '地面站暫時收不到時，照片還不能傳出去，需要先保留在衛星裡。' },
      { id: 'navigation', label: '定位接收器', hint: '計算位置不會幫照片留下檔案；想想哪種設備能把資料留到之後使用。' },
      { id: 'storage', label: '衛星上的資料儲存裝置' },
    ],
    correctAnswer: 'storage',
    explanation: '照片可以先存在衛星裡，等地面站收得到時再傳送。',
  },
  {
    id: 'communication', diagramLabel: '通訊',
    question: '要把照片傳回地面，需要什麼？',
    options: [
      { id: 'storage', label: '衛星上的資料儲存裝置', hint: '儲存裝置負責留下照片；這一步還需要把照片變成訊號，送到地面。' },
      { id: 'communication', label: '通訊設備與天線' },
      { id: 'power', label: '太陽能板與電池', hint: '供電能讓設備運作，但把照片送回地面還需要能傳遞訊號的設備。' },
    ],
    correctAnswer: 'communication',
    explanation: '通訊設備與天線能幫忙把照片傳回地面，還要等地面站能接收時才能傳送。',
  },
  {
    id: 'attitude', diagramLabel: '朝向控制',
    question: '要讓相機朝向地球，需要什麼幫忙？',
    options: [
      { id: 'attitude', label: '姿態控制系統' },
      { id: 'power', label: '太陽能板與電池', hint: '電力讓設備能運作，但還需要能確認並調整衛星朝向的功能。' },
      { id: 'communication', label: '通訊設備與天線', hint: '通訊負責傳遞訊號；把衛星調整到合適朝向，還需要專門的控制功能。' },
    ],
    correctAnswer: 'attitude',
    explanation: '姿態控制系統協助確認及調整衛星朝向，讓相機能對準地球，不只是讓衛星保持不動。',
  },
]

export const PREPARATION_SOURCES = [
  { title: 'NASA：Onboard Systems', url: 'https://science.nasa.gov/learn/basics-of-space-flight/chapter11-1/' },
  { title: 'NASA：Attitude and Telecommunications', url: 'https://science.nasa.gov/learn/basics-of-space-flight/chapter11-2/' },
  { title: 'ESA：Serving the spacecraft', url: 'https://www.esa.int/Science_Exploration/Space_Science/Serving_the_spacecraft' },
]
