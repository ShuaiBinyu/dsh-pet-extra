
import type { PetAnimationConfig } from '../types/pet'
/* ==================== 导入 ==================== */
// import yuandiyouzhuanbenpao from '../assets/pet/webm/原地右转奔跑.webm'
import yuandizuozhuanbenpao from '../assets/pet/webm/原地左转奔跑.webm'
import yuandiyouzhuanbenpao from '../assets/pet/webm/原地右转奔跑.webm'
import aojiaoshengqi from '../assets/pet/webm/点击-傲娇生气.webm'
import haixiujingya from '../assets/pet/webm/点击-害羞惊讶.webm'
import kaixinyuedong from '../assets/pet/webm/点击-开心跃动.webm'
import jingyutupaopao from '../assets/pet/webm/鲸鱼吐泡泡.webm'
import quxiliyi from '../assets/pet/webm/屈膝礼仪.webm'
import shenlanyao from '../assets/pet/webm/伸懒腰.webm'
import yuandipiaofutabu from '../assets/pet/webm/原地漂浮踏步.webm'
import yuandizhuasuitoudingwupin from '../assets/pet/webm/原地跳跃抓碎头顶物品.webm'
import yuandixiaoqishenmian from '../assets/pet/webm/原地小憩深眠.webm'
import yuandixuanzhuan from '../assets/pet/webm/原地旋转.webm'




/* ==================== 清单 ==================== */
export const petAnimations: PetAnimationConfig[] = [
  {
    id: 'yuandiyouzhuanbenpao',
    name: '原地右转奔跑',
    src: yuandiyouzhuanbenpao,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 50, dy: 0 }
  },
  {
    id: 'yuandizuozhuanbenpao',
    name: '原地左转奔跑',
    src: yuandizuozhuanbenpao,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: -50, dy: 0 }
  },
  {
    id: 'aojiaoshengqi',
    name: '傲娇生气',
    src: aojiaoshengqi,
    type: 'click',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'haixiujingya',
    name: '害羞惊讶',
    src: haixiujingya,
    type: 'click',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'kaixinyuedong',
    name: '开心跃动',
    src: kaixinyuedong,
    type: 'click',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'jingyutupaopao',
    name: '鲸鱼吐泡泡',
    src: jingyutupaopao,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'quxiliyi',
    name: '屈膝跳跃',
    src: quxiliyi,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'shenlanyao',
    name: '伸懒腰',
    src: shenlanyao,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'yuandipiaofutabu',
    name: '原地漂浮踏步',
    src: yuandipiaofutabu,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'yuandizhuasuitoudingwupin',
    name: '原地跳跃抓碎头顶物品',
    src: yuandizhuasuitoudingwupin,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'yuandixiaoqishenmian',
    name: '原地小憩深眠',
    src: yuandixiaoqishenmian,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
  {
    id: 'yuandixuanzhuan',
    name: '原地旋转',
    src: yuandixuanzhuan,
    type: 'idle',
    loop: false,
    duration: 10,
    weight: 1,
    motion: { dx: 0, dy: 0 }
  },
]
