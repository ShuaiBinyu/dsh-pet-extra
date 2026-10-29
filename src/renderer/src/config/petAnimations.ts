
import type { PetAnimationConfig } from '../types/pet'
/* ==================== 导入 ==================== */
import sanQiuPaoJie from '../assets/pet/webm/三球抛接.webm'
import xiaWuZiQi from '../assets/pet/webm/下五子棋.webm'
import dongZhangXiWang from '../assets/pet/webm/东张西望.webm'
import zhongQiuShangYue from '../assets/pet/webm/中秋赏月吃月饼.webm'
import youYaNvPuWu from '../assets/pet/webm/优雅女仆舞.webm'
import yuEFenWenBuSheng from '../assets/pet/webm/余额-分文不剩.webm'
import yuEShuJinZhouMei from '../assets/pet/webm/余额-数金皱眉.webm'
import yuEDaiKongRuXi from '../assets/pet/webm/余额-袋空如洗.webm'
import yuEJinDaiDingDang from '../assets/pet/webm/余额-金袋叮当.webm'
import yuEQianDaiRuChang from '../assets/pet/webm/余额-钱袋如常.webm'
import yuEQianDaiManYi from '../assets/pet/webm/余额-钱袋满溢.webm'
import touChiLingShiBeiZhua from '../assets/pet/webm/偷吃零食被抓住.webm'
import xieDaiMa from '../assets/pet/webm/写代码.webm'
import xieFuZi from '../assets/pet/webm/写福字.webm'
import pingKongShengHua from '../assets/pet/webm/凭空生花.webm'
import dongWuHuanRao from '../assets/pet/webm/动物环绕.webm'
import yuanDiWanMoFang from '../assets/pet/webm/原地专心玩魔方.webm'
import yuanDiXiaoQi from '../assets/pet/webm/原地小憩沉眠.webm'
import yuanDiZuoZhuanBenPao from '../assets/pet/webm/原地左转奔跑.webm'
import yuanDiQiaoJi from '../assets/pet/webm/原地敲击桌面互动.webm'
import yuanDiPiaoFu from '../assets/pet/webm/原地漂浮踏步.webm'
import yuanDiTiaoYue from '../assets/pet/webm/原地跳跃抓碎头顶物品.webm'
import yuanDiDunXia from '../assets/pet/webm/原地蹲下玩玩具汽车.webm'
import yuanDiZhongLi from '../assets/pet/webm/原地重力下蹲压缩.webm'
import bianGeZi from '../assets/pet/webm/变鸽子.webm'
import keAiZhaiWu from '../assets/pet/webm/可爱宅舞.webm'
import chiToken from '../assets/pet/webm/吃Token.webm'
import chiBingQiLin from '../assets/pet/webm/吃冰淇淋融化.webm'
import chiWuCan from '../assets/pet/webm/吃午餐.webm'
import chiDaZhaXie from '../assets/pet/webm/吃大闸蟹.webm'
import chiNianGao from '../assets/pet/webm/吃年糕.webm'
import chiZaoCan from '../assets/pet/webm/吃早餐.webm'
import chiWanCan from '../assets/pet/webm/吃晚餐.webm'
import chiTangYuan from '../assets/pet/webm/吃汤圆.webm'
import chiBaiFan from '../assets/pet/webm/吃白饭.webm'
import chiZongZi from '../assets/pet/webm/吃粽子.webm'
import chiTangHuLu from '../assets/pet/webm/吃糖葫芦.webm'
import chiLaBaZhou from '../assets/pet/webm/吃腊八粥.webm'
import chiXiGua from '../assets/pet/webm/吃西瓜.webm'
import chiChongYangGao from '../assets/pet/webm/吃重阳糕.webm'
import chiChangShouMian from '../assets/pet/webm/吃长寿面.webm'
import chiQingTuan from '../assets/pet/webm/吃青团.webm'
import chiJiaoZi from '../assets/pet/webm/吃饺子.webm'
import chuiQiQiu from '../assets/pet/webm/吹气球.webm'
import chuiDiZi from '../assets/pet/webm/吹笛子.webm'
import haQianLianTian from '../assets/pet/webm/哈欠连天.webm'
import duiXueRen from '../assets/pet/webm/堆雪人.webm'
import daKouChiLingShi from '../assets/pet/webm/大口吃零食.webm'
import nvPuQuXi from '../assets/pet/webm/女仆屈膝礼仪.webm'
import xiaoFuDuXuanZhuan from '../assets/pet/webm/小幅度原地360度旋转展示.webm'
import xiaoTiQin from '../assets/pet/webm/小提琴演奏.webm'
import gongZuoDuoBu from '../assets/pet/webm/工作状态-原地踱步张望.webm'
import gongZuoChuiTou from '../assets/pet/webm/工作状态-垂头叹气冒汗.webm'
import gongZuoMangLu from '../assets/pet/webm/工作状态-忙碌点按.webm'
import gongZuoSiKao from '../assets/pet/webm/工作状态-思考冒泡.webm'
import gongZuoQingDian from '../assets/pet/webm/工作状态-清点归档.webm'
import gongZuoQueYue from '../assets/pet/webm/工作状态-雀跃庆祝.webm'
import daiJiHuXi from '../assets/pet/webm/待机呼吸休闲.webm'
import youXianHengGe from '../assets/pet/webm/悠闲哼歌.webm'
import puKeMoShu from '../assets/pet/webm/扑克魔术.webm'
import daKeShui from '../assets/pet/webm/打瞌睡被惊醒.webm'
import chouTuoLuo from '../assets/pet/webm/抽陀螺.webm'
import chaiLiWu from '../assets/pet/webm/拆礼物.webm'
import chaZhuYu from '../assets/pet/webm/插茱萸赏菊.webm'
import yaoShanNaLiang from '../assets/pet/webm/摇扇纳凉.webm'
import luMao from '../assets/pet/webm/撸猫.webm'
import shouHongBao from '../assets/pet/webm/收红包.webm'
import fangKongMingDeng from '../assets/pet/webm/放孔明灯.webm'
import fangHeDeng from '../assets/pet/webm/放河灯.webm'
import fangYanHua from '../assets/pet/webm/放烟花.webm'
import fangFengZheng from '../assets/pet/webm/放风筝.webm'
import zhengTiHuanZhuang from '../assets/pet/webm/整体换装试色.webm'
import shiAChiShenMe from '../assets/pet/webm/是啊，吃什么.webm'
import chenJianShuaYa from '../assets/pet/webm/晨间刷牙.webm'
import shuanHuoGuo from '../assets/pet/webm/涮火锅.webm'
import shenDuSiKao from '../assets/pet/webm/深度思考碎碎念.webm'
import dianJiAoJiao from '../assets/pet/webm/点击回应-傲娇生气.webm'
import dianJiYuanQi from '../assets/pet/webm/点击回应-元气挥手.webm'
import dianJiHaiXiu from '../assets/pet/webm/点击回应-害羞惊讶.webm'
import dianJiKaiXin from '../assets/pet/webm/点击回应-开心跃动.webm'
import dianJiNaoYang from '../assets/pet/webm/点击回应-挠痒咯咯笑.webm'
import zhaoJingZi from '../assets/pet/webm/照镜子.webm'
import wanShuiQiang from '../assets/pet/webm/玩水枪.webm'
import wanYouXi from '../assets/pet/webm/玩游戏气急败坏.webm'
import jingYuWeiBa from '../assets/pet/webm/用鲸鱼尾巴拍打地面.webm'
import suiSuiNianFaDai from '../assets/pet/webm/碎碎念-发呆碎碎念.webm'
import suiSuiNianDuiPing from '../assets/pet/webm/碎碎念-对屏碎碎念.webm'
import suiSuiNianCaZhuo from '../assets/pet/webm/碎碎念-擦桌碎碎念.webm'
import chuanZhenQiQiao from '../assets/pet/webm/穿针乞巧.webm'
import wuShiTou from '../assets/pet/webm/舞狮头.webm'
import dangQiuQian from '../assets/pet/webm/荡秋千.webm'
import mengHuaXiaoYouLing from '../assets/pet/webm/萌化小幽灵.webm'
import lanJingXianShi from '../assets/pet/webm/蓝鲸现世.webm'
import huDieMiFeng from '../assets/pet/webm/蝴蝶蜜蜂环绕头顶开花.webm'
import pangXieZouLu from '../assets/pet/webm/螃蟹走路.webm'
import beiXiaYiTiao from '../assets/pet/webm/被吓一跳.webm'
import beiLuoYeYanMo from '../assets/pet/webm/被落叶淹没.webm'
import beiShuBiaoTuoZhua from '../assets/pet/webm/被鼠标拖拽悬空反馈.webm'
import zhuangDianShengDanShu from '../assets/pet/webm/装点圣诞树.webm'
import taoTangNanGuaDeng from '../assets/pet/webm/讨糖南瓜灯.webm'
import chaoDaShenLanYao from '../assets/pet/webm/超大伸懒腰.webm'
import tiJianZi from '../assets/pet/webm/踢毽子.webm'
import qingKuaiYaoBaiWu from '../assets/pet/webm/轻快摇摆舞.webm'
import qingKuaiJiLu from '../assets/pet/webm/轻快记录.webm'
import qiMuMa from '../assets/pet/webm/骑木马.webm'
import jingYuTuPaoPao from '../assets/pet/webm/鲸鱼吐泡泡特效.webm'



/* ==================== 清单 ==================== */
export const petAnimations: PetAnimationConfig[] = [
  { id: 'sanQiuPaoJie', name: '三球抛接', src: sanQiuPaoJie, type: 'idle', loop: false, weight: 1, motion: { dx: -50, dy: 0 } },
  { id: 'xiaWuZiQi', name: '下五子棋', src: xiaWuZiQi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dongZhangXiWang', name: '东张西望', src: dongZhangXiWang, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'zhongQiuShangYue', name: '中秋赏月吃月饼', src: zhongQiuShangYue, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'youYaNvPuWu', name: '优雅女仆舞', src: youYaNvPuWu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuEFenWenBuSheng', name: '余额-分文不剩', src: yuEFenWenBuSheng, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuEShuJinZhouMei', name: '余额-数金皱眉', src: yuEShuJinZhouMei, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuEDaiKongRuXi', name: '余额-袋空如洗', src: yuEDaiKongRuXi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuEJinDaiDingDang', name: '余额-金袋叮当', src: yuEJinDaiDingDang, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuEQianDaiRuChang', name: '余额-钱袋如常', src: yuEQianDaiRuChang, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuEQianDaiManYi', name: '余额-钱袋满溢', src: yuEQianDaiManYi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'touChiLingShiBeiZhua', name: '偷吃零食被抓住', src: touChiLingShiBeiZhua, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'xieDaiMa', name: '写代码', src: xieDaiMa, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'xieFuZi', name: '写福字', src: xieFuZi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'pingKongShengHua', name: '凭空生花', src: pingKongShengHua, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dongWuHuanRao', name: '动物环绕', src: dongWuHuanRao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuanDiWanMoFang', name: '原地专心玩魔方', src: yuanDiWanMoFang, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuanDiXiaoQi', name: '原地小憩沉眠', src: yuanDiXiaoQi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuanDiZuoZhuanBenPao', name: '原地左转奔跑', src: yuanDiZuoZhuanBenPao, type: 'idle', loop: false, weight: 1, motion: { dx: -10, dy: 0 } },
  { id: 'yuanDiQiaoJi', name: '原地敲击桌面互动', src: yuanDiQiaoJi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuanDiPiaoFu', name: '原地漂浮踏步', src: yuanDiPiaoFu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuanDiTiaoYue', name: '原地跳跃抓碎头顶物品', src: yuanDiTiaoYue, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuanDiDunXia', name: '原地蹲下玩玩具汽车', src: yuanDiDunXia, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yuanDiZhongLi', name: '原地重力下蹲压缩', src: yuanDiZhongLi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'bianGeZi', name: '变鸽子', src: bianGeZi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'keAiZhaiWu', name: '可爱宅舞', src: keAiZhaiWu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiToken', name: '吃Token', src: chiToken, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiBingQiLin', name: '吃冰淇淋融化', src: chiBingQiLin, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiWuCan', name: '吃午餐', src: chiWuCan, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiDaZhaXie', name: '吃大闸蟹', src: chiDaZhaXie, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiNianGao', name: '吃年糕', src: chiNianGao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiZaoCan', name: '吃早餐', src: chiZaoCan, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiWanCan', name: '吃晚餐', src: chiWanCan, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiTangYuan', name: '吃汤圆', src: chiTangYuan, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiBaiFan', name: '吃白饭', src: chiBaiFan, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiZongZi', name: '吃粽子', src: chiZongZi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiTangHuLu', name: '吃糖葫芦', src: chiTangHuLu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiLaBaZhou', name: '吃腊八粥', src: chiLaBaZhou, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiXiGua', name: '吃西瓜', src: chiXiGua, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiChongYangGao', name: '吃重阳糕', src: chiChongYangGao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiChangShouMian', name: '吃长寿面', src: chiChangShouMian, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiQingTuan', name: '吃青团', src: chiQingTuan, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chiJiaoZi', name: '吃饺子', src: chiJiaoZi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chuiQiQiu', name: '吹气球', src: chuiQiQiu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chuiDiZi', name: '吹笛子', src: chuiDiZi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'haQianLianTian', name: '哈欠连天', src: haQianLianTian, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'duiXueRen', name: '堆雪人', src: duiXueRen, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'daKouChiLingShi', name: '大口吃零食', src: daKouChiLingShi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'nvPuQuXi', name: '女仆屈膝礼仪', src: nvPuQuXi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'xiaoFuDuXuanZhuan', name: '小幅度原地360度旋转展示', src: xiaoFuDuXuanZhuan, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'xiaoTiQin', name: '小提琴演奏', src: xiaoTiQin, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'gongZuoDuoBu', name: '工作状态-原地踱步张望', src: gongZuoDuoBu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'gongZuoChuiTou', name: '工作状态-垂头叹气冒汗', src: gongZuoChuiTou, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'gongZuoMangLu', name: '工作状态-忙碌点按', src: gongZuoMangLu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'gongZuoSiKao', name: '工作状态-思考冒泡', src: gongZuoSiKao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'gongZuoQingDian', name: '工作状态-清点归档', src: gongZuoQingDian, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'gongZuoQueYue', name: '工作状态-雀跃庆祝', src: gongZuoQueYue, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'daiJiHuXi', name: '待机呼吸休闲', src: daiJiHuXi, type: 'idle', loop: true, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'youXianHengGe', name: '悠闲哼歌', src: youXianHengGe, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'puKeMoShu', name: '扑克魔术', src: puKeMoShu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'daKeShui', name: '打瞌睡被惊醒', src: daKeShui, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chouTuoLuo', name: '抽陀螺', src: chouTuoLuo, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chaiLiWu', name: '拆礼物', src: chaiLiWu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chaZhuYu', name: '插茱萸赏菊', src: chaZhuYu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'yaoShanNaLiang', name: '摇扇纳凉', src: yaoShanNaLiang, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'luMao', name: '撸猫', src: luMao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'shouHongBao', name: '收红包', src: shouHongBao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'fangKongMingDeng', name: '放孔明灯', src: fangKongMingDeng, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'fangHeDeng', name: '放河灯', src: fangHeDeng, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'fangYanHua', name: '放烟花', src: fangYanHua, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'fangFengZheng', name: '放风筝', src: fangFengZheng, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'zhengTiHuanZhuang', name: '整体换装试色', src: zhengTiHuanZhuang, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'shiAChiShenMe', name: '是啊，吃什么', src: shiAChiShenMe, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chenJianShuaYa', name: '晨间刷牙', src: chenJianShuaYa, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'shuanHuoGuo', name: '涮火锅', src: shuanHuoGuo, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'shenDuSiKao', name: '深度思考碎碎念', src: shenDuSiKao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dianJiAoJiao', name: '点击回应-傲娇生气', src: dianJiAoJiao, type: 'dbclick', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dianJiYuanQi', name: '点击回应-元气挥手', src: dianJiYuanQi, type: 'dbclick', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dianJiHaiXiu', name: '点击回应-害羞惊讶', src: dianJiHaiXiu, type: 'dbclick', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dianJiKaiXin', name: '点击回应-开心跃动', src: dianJiKaiXin, type: 'dbclick', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dianJiNaoYang', name: '点击回应-挠痒咯咯笑', src: dianJiNaoYang, type: 'dbclick', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'zhaoJingZi', name: '照镜子', src: zhaoJingZi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'wanShuiQiang', name: '玩水枪', src: wanShuiQiang, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'wanYouXi', name: '玩游戏气急败坏', src: wanYouXi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'jingYuWeiBa', name: '用鲸鱼尾巴拍打地面', src: jingYuWeiBa, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'suiSuiNianFaDai', name: '碎碎念-发呆碎碎念', src: suiSuiNianFaDai, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'suiSuiNianDuiPing', name: '碎碎念-对屏碎碎念', src: suiSuiNianDuiPing, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'suiSuiNianCaZhuo', name: '碎碎念-擦桌碎碎念', src: suiSuiNianCaZhuo, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chuanZhenQiQiao', name: '穿针乞巧', src: chuanZhenQiQiao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'wuShiTou', name: '舞狮头', src: wuShiTou, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'dangQiuQian', name: '荡秋千', src: dangQiuQian, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'mengHuaXiaoYouLing', name: '萌化小幽灵', src: mengHuaXiaoYouLing, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'lanJingXianShi', name: '蓝鲸现世', src: lanJingXianShi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'huDieMiFeng', name: '蝴蝶蜜蜂环绕头顶开花', src: huDieMiFeng, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'pangXieZouLu', name: '螃蟹走路', src: pangXieZouLu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'beiXiaYiTiao', name: '被吓一跳', src: beiXiaYiTiao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'beiLuoYeYanMo', name: '被落叶淹没', src: beiLuoYeYanMo, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'beiShuBiaoTuoZhua', name: '被鼠标拖拽悬空反馈', src: beiShuBiaoTuoZhua, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'zhuangDianShengDanShu', name: '装点圣诞树', src: zhuangDianShengDanShu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'taoTangNanGuaDeng', name: '讨糖南瓜灯', src: taoTangNanGuaDeng, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'chaoDaShenLanYao', name: '超大伸懒腰', src: chaoDaShenLanYao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'tiJianZi', name: '踢毽子', src: tiJianZi, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'qingKuaiYaoBaiWu', name: '轻快摇摆舞', src: qingKuaiYaoBaiWu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'qingKuaiJiLu', name: '轻快记录', src: qingKuaiJiLu, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'qiMuMa', name: '骑木马', src: qiMuMa, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
  { id: 'jingYuTuPaoPao', name: '鲸鱼吐泡泡特效', src: jingYuTuPaoPao, type: 'idle', loop: false, weight: 1, motion: { dx: 0, dy: 0 } },
]
