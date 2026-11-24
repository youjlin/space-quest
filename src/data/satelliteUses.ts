export type SatelliteUse = 'observe' | 'communicate' | 'locate'
export type SituationScene = 'storm' | 'village' | 'phone' | 'forest' | 'ship' | 'hiker'

export const USES_CONTENT = {
  title: '這件事，可以請衛星幫忙嗎？',
  introduction: '看看生活中遇到的問題，選出衛星可以怎麼幫忙。',
  prompt: '這個情境主要需要衛星提供哪一種幫助？',
  completion: '你已認識衛星的3種用途。',
} as const

// 選項順序固定，重試時不重新排列。圖示只作輔助，文字不需專業背景。
export const USES_OPTIONS = [
  { id: 'observe', label: '觀察地球', icon: 'planet', review: '看看地球發生什麼事。' },
  { id: 'communicate', label: '傳遞訊息', icon: 'signal', review: '幫忙傳遞訊息。' },
  { id: 'locate', label: '協助確認位置', icon: 'orbit', review: '協助我們確認位置。' },
] as const

export interface UsesQuestion {
  id: SituationScene
  title: string
  situation: string
  illustrationDescription: string
  correctAnswer: SatelliteUse
  hints: Partial<Record<SatelliteUse, string>>
  explanation: string
}

// 每種用途各兩題；情境、提示、解說及答案集中於本檔。
export const USES_QUESTIONS: readonly UsesQuestion[] = [
  {
    id: 'storm',
    title: '從上空觀察颱風雲系',
    situation: '氣象人員想從上空觀察颱風雲系的形狀與範圍。',
    illustrationDescription: '衛星從地球上方觀察旋轉的颱風雲系，這是雲系觀測的簡化示意。',
    correctAnswer: 'observe',
    hints: {
      communicate: '這題想了解雲系的樣子與範圍。想想哪一種幫助可以讓我們看到上空的影像。',
      locate: '留意題目中的「雲系」：我們需要了解雲如何分布，不是確認設備在哪裡。',
    },
    explanation: '衛星可以從上空觀察颱風雲系，協助了解雲的分布與變化。',
  },
  {
    id: 'village',
    title: '把偏遠地區的訊息送出去',
    situation: '偏遠地區的居民使用相應的衛星通訊設備與服務，想把訊息傳給遠方的人。',
    illustrationDescription: '山區村落的通訊天線透過衛星與遠方的接收站連結，村落旁有訊息符號。',
    correctAnswer: 'communicate',
    hints: {
      observe: '居民現在要把一段訊息送到遠方；請想想哪種幫助能把訊息傳出去。',
      locate: '知道所在位置與把訊息送出去是不同的功能。居民這次要完成的是哪件事？',
    },
    explanation: '衛星可以幫忙傳遞訊息，讓偏遠地區與遠方聯絡。這需要相應的通訊設備與服務。',
  },
  {
    id: 'phone',
    title: '用手機確認所在位置',
    situation: '你想知道自己在哪裡，手機正接收多顆定位衛星的訊號來計算位置。',
    illustrationDescription: '多顆定位衛星的訊號傳向手機，手機在地圖上顯示計算出的位置；沒有衛星拍攝使用者。',
    correctAnswer: 'locate',
    hints: {
      observe: '手機正在用收到的訊號計算位置，並不是取得一張拍到你的照片。',
      communicate: '這題的目標是確認「我在哪裡」。取得位置，不等於把訊息送給別人。',
    },
    explanation: '手機通常接收多顆定位衛星的訊號，再計算所在位置。定位衛星並不是直接看見或追蹤每位使用者。',
  },
  {
    id: 'forest',
    title: '比較不同日期的森林影像',
    situation: '研究人員比較兩個不同日期的衛星影像，想了解森林覆蓋範圍有沒有變化。',
    illustrationDescription: '較早與較晚日期的兩張簡化森林影像並排，顯示可比較的覆蓋範圍差異，並非真實影像。',
    correctAnswer: 'observe',
    hints: {
      communicate: '研究人員已經拿到兩個日期的影像，現在要比較森林的樣子與範圍。',
      locate: '這次重點是看出森林隨時間的變化，而不是計算研究人員所在的位置。',
    },
    explanation: '不同日期的衛星影像能協助觀察森林變化，但不代表一定能看清所有細節。',
  },
  {
    id: 'ship',
    title: '讓遠洋船舶保持聯絡',
    situation: '船舶遠離陸地時，船員透過船上的衛星通訊設備與服務聯絡岸上的人。',
    illustrationDescription: '海上的船舶裝有通訊天線，透過衛星與岸邊接收站傳遞訊息。',
    correctAnswer: 'communicate',
    hints: {
      observe: '船員這次想與岸上的人交換訊息，重點不是取得海面影像。',
      locate: '確認船在哪裡與聯絡岸上的人是不同的需求。留意題目要完成的是「聯絡」。',
    },
    explanation: '衛星通訊可以幫船員與岸上傳遞訊息，需要相應的設備與通訊服務。取得船的位置是另一種功能。',
  },
  {
    id: 'hiker',
    title: '登山途中確認位置',
    situation: '登山者使用具衛星定位功能的設備，接收多顆定位衛星的訊號，確認自己目前的位置。',
    illustrationDescription: '山中的登山者拿著定位設備，接收多顆定位衛星的訊號；圖中沒有求救訊息的發送路徑。',
    correctAnswer: 'locate',
    hints: {
      observe: '登山者要用手上的設備計算目前位置，而不是取得一張拍到自己的衛星影像。',
      communicate: '這題是確認位置；具定位功能，不代表設備也能發送求救訊息。',
    },
    explanation: '定位設備通常接收多顆定位衛星的訊號，再計算所在位置。能取得位置，不代表也能發送求救訊息。',
  },
]

// 供內容維護時查核；不在主要作答畫面加入額外閱讀框。
export const USES_SOURCES = [
  { title: 'NASA Space Place：How Does GPS Work?', url: 'https://spaceplace.nasa.gov/gps/en/' },
  { title: 'GPS.gov：GPS', url: 'https://www.gps.gov/gps' },
  { title: 'NOAA：Hurricane Imagery', url: 'https://www.nesdis.noaa.gov/imagery/hurricane-imagery' },
  { title: 'ESA：Satellite communications', url: 'https://www.esa.int/Applications/Connectivity_and_Secure_Communications/Satellite_communications' },
  { title: 'NASA：How to Interpret a Satellite Image', url: 'https://science.nasa.gov/earth/earth-observatory/how-to-interpret-a-satellite-image/' },
]
