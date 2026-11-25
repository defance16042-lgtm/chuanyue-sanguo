// 可招收將領的專屬計謀與軍師計。每人 4 招個人計謀（Lv1／5／10／18）＋ 2 招軍師計（被任命為軍師才能用）。
// 型態 b 猛將／t 謀士／s 疾風：同型態的招式結構相近，但名字、特效、數值各自不同。
(function () {
  const D = window.DATA, B = D.battle;
  const PHYS_FX = ['slash', 'flurry', 'cross', 'thrust', 'whirl', 'bloodslash', 'dragon', 'execute'];
  const TACT_FX = ['bolt', 'fire', 'thunder', 'rock', 'paw', 'water'];
  // id: [型態, [四招個人計謀名], [兩招軍師計名]]
  const T = {
    chengyuanzhi: ['b', ['黃巾劈山', '咬牙硬撐', '橫掃千軍', '裂地崩山'], ['屯田聚糧', '黃巾戰鼓']],
    qushuai:      ['b', ['渠帥重斬', '爆喝壯膽', '旋刀亂舞', '斷嶽一刀'], ['義氣相挺', '山寨令旗']],
    bocai:        ['s', ['長社火矢', '疾馳突襲', '穿營斬將', '潁川疾風'], ['潁川奇襲令', '焚營亂敵']],
    pengtuo:      ['b', ['鐵拳轟擊', '肉盾迎擊', '橫衝直撞', '震山拳'], ['蠻牛陣', '山賊號角']],
    zhaohong:     ['b', ['宛城槍術', '死守宛城', '槍林彈雨', '穿心一槍'], ['固城令', '烈士鼓']],
    hanzhong:     ['b', ['堅城重壓', '鐵壁', '破城錘', '攻城雷霆'], ['堅守待援', '宛城烽火']],
    busi:         ['b', ['卜卦攻心', '天機護體', '亂刀陣', '兇卦斬'], ['問卜安軍', '卦象亂敵']],
    zhangliang:   ['t', ['地公符火', '黃天護符', '地裂符陣', '五雷咒'], ['地公祝禱', '符水療軍']],
    zhangbao:     ['b', ['人公妖術', '蒼天號令', '妖風陣', '人公霹靂'], ['妖術迷霧', '黃天戰歌']],
    zhangjiao:    ['t', ['符水療傷', '黃天當立', '天公雷罰', '蒼天已死'], ['太平要術', '符咒封鎮']],
    duyou:        ['t', ['黑山伏火', '扇影迷蹤', '山寨連環', '黑山奇謀'], ['黑山密策', '山林幻陣']],
    zhangyan:     ['s', ['飛燕穿雲', '輕功突擊', '燕子三抄水', '黑山飛騎'], ['飛燕疾令', '百萬黑山軍']],
    zhangchun:    ['b', ['烏桓騎射', '胡馬奔襲', '狼騎突擊', '漁陽鐵騎'], ['突騎令', '北地烽火']],
    huaxiong:     ['b', ['虎牢猛擊', '溫酒斬將', '西涼橫掃', '華雄怒斬'], ['涼州戰歌', '酒壯軍威']],
    lubu:         ['b', ['畫戟連擊', '飛將突襲', '戟風無雙', '無雙亂舞'], ['飛將軍威', '虎牢三英戰']],
    xurong:       ['b', ['西涼鐵壁', '老將穩陣', '連環守陣', '破營一擊'], ['疑兵退敵', '堅壁清野']],
    chezhou:      ['b', ['刺史穩槍', '守土有責', '徐州連刺', '長槍破陣'], ['州郡調度', '刺史令旗']],
    yanliang:     ['b', ['河北大刀', '先鋒猛衝', '雙壁並進', '萬軍劈斬'], ['河北先鋒令', '大刀軍威']],
    wenchou:      ['b', ['雙壁長槍', '替友報仇', '槍纓亂舞', '穿雲一槍'], ['雙壁號令', '藍纓鼓角']],
    zhangkai:     ['b', ['泰山劫道', '亡命一搏', '山賊亂刀', '斷路一斬'], ['劫糧令', '賊寨號角']],
    houcheng:     ['b', ['并州疾刺', '同袍護陣', '連環弩射', '追風一擊'], ['并州軍令', '同進同退']],
    songxian:     ['b', ['長戟鉤擊', '戟陣迴旋', '長戟橫掃', '鉤鎌連擊'], ['戟陣令', '并州鼓角']],
    gaoshun:      ['b', ['陷陣衝鋒', '密陣如牆', '七百死士', '所攻必破'], ['陷陣令', '不飲酒的軍規']]
  };
  // ---- 每位將領的專屬效果設計（個人計謀 4 招：Lv1／5／10／18；軍師計 2 招）。每人效果組合不同，不再套同一個型態模板。
  const ph = function (tp, power, fx, o) { return Object.assign({ tp: tp, kind: 'phys', target: 'one', power: power, fx: fx }, o || {}); };
  const pa = function (tp, power, fx, o) { return Object.assign({ tp: tp, kind: 'phys', target: 'all', power: power, fx: fx }, o || {}); };
  const tc = function (tp, allTp, power, allPower, fx, o) { return Object.assign({ tp: tp, allTp: allTp, kind: 'tact', target: 'one', choice: true, power: power, allPower: allPower, fx: fx }, o || {}); };
  const bs = function (tp, stat, mult, turns, fx, o) { return Object.assign({ tp: tp, kind: 'buff', target: 'self', stat: stat, mult: mult, turns: turns, fx: fx }, o || {}); };
  const ba = function (tp, stat, mult, turns, fx, o) { return Object.assign({ tp: tp, kind: 'buff', target: 'allAlly', stat: stat, mult: mult, turns: turns, fx: fx }, o || {}); };
  const db = function (tp, stat, mult, turns, fx) { return { tp: tp, kind: 'debuff', target: 'all', stat: stat, mult: mult, turns: turns, fx: fx }; };
  const dt = function (tp, pct, turns, fx, chance) { return { tp: tp, kind: 'dot', target: 'all', pct: pct, turns: turns, chance: chance || 0.75, fx: fx }; };
  const hl = function (tp, power, fx) { return { tp: tp, kind: 'heal', target: 'allAlly', power: power, fx: fx || 'heal' }; };
  const ht = function (tp, pct, turns, fx) { return { tp: tp, kind: 'hot', target: 'allAlly', pct: pct, turns: turns, fx: fx || 'bloom' }; };
  const cf = function (tp, turns, fx, target) { return { tp: tp, kind: 'confuse', target: target || 'all', turns: turns, fx: fx || 'star' }; };
  const st = function (tp, turns, fx) { return { tp: tp, kind: 'stun', target: 'all', turns: turns, fx: fx || 'dizzy' }; };
  const cl = function (tp, pct, fx) { return { tp: tp, kind: 'cleanse', target: 'ally', healPct: pct, fx: fx || 'purify' }; };
  const rd = function (stat, mult, turns) { return { stat: stat, mult: mult, turns: turns }; };
  // 每位：[個人1, 個人2, 個人3, 個人4（取代個人1）, 軍師1, 軍師2]
  const KIT = {
    chengyuanzhi: [ph(3, 1.7, 'slash'), bs(3, 'def', 1.6, 3, 'up_b'), pa(6, 0.95, 'whirl', { rider: rd('spd', 0.8, 3) }), ph(8, 3.0, 'bloodslash', { leech: 0.4 }), ht(6, 0.05, 4, 'leaf'), ba(5, 'def', 1.25, 4, 'up_b')],
    qushuai: [ph(3, 1.8, 'cross', { rider: rd('atk', 0.85, 3) }), bs(3, 'atk', 1.5, 3, 'rage', { extra: { stat: 'spd', mult: 1.15 } }), pa(6, 0.6, 'flurry', { hits: 2 }), ph(8, 2.6, 'execute', { lowBonus: 1.6 }), ba(6, 'atk', 1.3, 4, 'up_r', { extra: { stat: 'def', mult: 1.15 } }), db(5, 'spd', 0.75, 3, 'trap')],
    bocai: [ph(4, 0.85, 'flurry', { hits: 2 }), db(4, 'spd', 0.6, 3, 'trap'), dt(6, 0.05, 3, 'fire'), ba(7, 'spd', 1.5, 4, 'wind', { extra: { stat: 'atk', mult: 1.15 } }), ba(6, 'spd', 1.4, 4, 'wind'), dt(6, 0.04, 4, 'smoke', 0.9)],
    pengtuo: [ph(3, 2.0, 'thrust', { rider: rd('def', 0.8, 3) }), bs(4, 'def', 1.8, 2, 'aura'), pa(6, 1.2, 'axe', { rider: rd('spd', 0.8, 3) }), ph(8, 3.4, 'dragon', { rider: rd('def', 0.6, 3) }), ba(6, 'def', 1.35, 4, 'up_b'), db(5, 'atk', 0.7, 3, 'roar')],
    zhaohong: [ph(3, 0.9, 'thrust', { hits: 2 }), bs(3, 'def', 1.5, 3, 'up_b'), ph(6, 0.75, 'multithrust', { hits: 3 }), ph(8, 3.2, 'execute', { lowBonus: 1.2 }), ba(6, 'def', 1.3, 4, 'up_b'), hl(6, 1.5)],
    hanzhong: [ph(3, 1.6, 'cross', { rider: rd('def', 0.85, 3) }), bs(4, 'def', 2.0, 2, 'aura'), pa(6, 1.0, 'axe'), ph(9, 3.0, 'dragon', { rider: rd('def', 0.6, 3) }), ba(6, 'def', 1.5, 3, 'up_b'), ht(6, 0.05, 4, 'bloom')],
    busi: [ph(3, 1.6, 'slash'), cf(4, 2, 'star', 'one'), pa(6, 0.45, 'flurry', { hits: 3 }), ph(8, 3.0, 'execute', { lowBonus: 1.4 }), { tp: 6, kind: 'heal', target: 'ally', power: 3.0, fx: 'heal' }, cf(6, 1, 'star')],
    zhangliang: [tc(4, 6, 2.1, 1.3, 'rock'), ba(4, 'int', 1.4, 3, 'up_y'), dt(6, 0.06, 3, 'smoke'), tc(9, 13, 3.6, 2.1, 'thunder'), ba(6, 'int', 1.35, 4, 'up_y'), ht(6, 0.07, 4, 'leaf')],
    zhangbao: [tc(4, 6, 2.0, 1.2, 'bolt'), bs(3, 'atk', 1.5, 3, 'rage'), cf(6, 2, 'star'), tc(9, 13, 3.4, 2.0, 'fire', { rider: rd('atk', 0.8, 3) }), cf(6, 2, 'mist'), ba(6, 'atk', 1.35, 4, 'up_r')],
    zhangjiao: [{ tp: 4, kind: 'hot', target: 'ally', pct: 0.1, turns: 3, fx: 'bloom' }, ba(4, 'atk', 1.3, 3, 'aura', { extra: { stat: 'def', mult: 1.2 } }), tc(6, 9, 1.6, 2.0, 'thunder'), tc(10, 14, 5.5, 2.4, 'bagua', { replaces: undefined }), hl(7, 2.4, 'purify'), st(6, 1, 'dizzy')],
    duyou: [tc(4, 6, 2.0, 1.2, 'fire'), db(4, 'atk', 0.7, 3, 'mist'), tc(6, 9, 2.0, 1.4, 'rock', { rider: rd('spd', 0.8, 3) }), tc(9, 13, 3.8, 2.0, 'water', { rider: rd('def', 0.75, 3) }), db(6, 'def', 0.7, 3, 'crack'), cf(6, 2, 'star')],
    zhangyan: [ph(4, 0.6, 'flurry', { hits: 3 }), bs(3, 'spd', 1.8, 3, 'wind'), ph(6, 1.9, 'execute', { lowBonus: 1.0 }), pa(8, 0.8, 'multithrust', { hits: 2 }), ba(6, 'spd', 1.5, 4, 'wind'), db(6, 'spd', 0.65, 3, 'trap')],
    zhangchun: [ph(3, 1.9, 'thrust'), bs(3, 'atk', 1.4, 3, 'rage', { extra: { stat: 'spd', mult: 1.2 } }), pa(6, 1.1, 'multithrust', { rider: rd('atk', 0.85, 3) }), ph(8, 3.2, 'bloodslash', { leech: 0.3 }), ba(6, 'spd', 1.3, 4, 'wind', { extra: { stat: 'atk', mult: 1.15 } }), dt(6, 0.05, 3, 'fire')],
    huaxiong: [ph(3, 2.0, 'slash'), bs(3, 'atk', 1.6, 3, 'rage'), ph(6, 2.5, 'execute', { lowBonus: 1.0 }), pa(9, 1.6, 'axe', { rider: rd('def', 0.8, 3) }), ba(6, 'atk', 1.4, 4, 'up_r'), ba(5, 'atk', 1.25, 3, 'aura', { extra: { stat: 'spd', mult: 1.1 } })],
    lubu: [ph(4, 1.1, 'cross', { hits: 2 }), bs(3, 'spd', 1.5, 3, 'wind', { extra: { stat: 'atk', mult: 1.3 } }), pa(6, 0.8, 'whirl', { hits: 2 }), ph(10, 0.95, 'dragon', { hits: 4 }), ba(7, 'atk', 1.5, 3, 'up_r'), db(6, 'atk', 0.55, 3, 'roar')],
    xurong: [ph(3, 1.6, 'thrust', { rider: rd('spd', 0.85, 3) }), ba(4, 'def', 1.3, 3, 'up_b'), pa(6, 0.9, 'whirl', { rider: rd('def', 0.85, 3) }), ph(8, 3.0, 'cross', { rider: rd('def', 0.7, 3) }), cf(6, 2, 'mist'), ba(6, 'def', 1.6, 3, 'aura')],
    zhangkai: [ph(3, 1.7, 'slash', { leech: 0.2 }), bs(3, 'atk', 1.6, 3, 'rage'), pa(6, 0.55, 'flurry', { hits: 2 }), ph(8, 2.9, 'execute', { lowBonus: 1.2 }), db(5, 'def', 0.7, 3, 'crack'), ba(6, 'atk', 1.3, 4, 'up_r')],
    houcheng: [ph(3, 0.95, 'thrust', { hits: 2 }), ba(4, 'def', 1.3, 3, 'up_b'), ph(6, 0.7, 'multithrust', { hits: 3 }), ph(8, 2.8, 'cross', { rider: rd('spd', 0.7, 3) }), ba(6, 'atk', 1.3, 4, 'up_r'), ht(5, 0.05, 4, 'leaf')],
    songxian: [ph(3, 1.8, 'cross', { rider: rd('def', 0.85, 3) }), bs(4, 'def', 1.5, 3, 'up_b', { extra: { stat: 'atk', mult: 1.2 } }), pa(6, 1.2, 'whirl'), ph(9, 1.0, 'axe', { hits: 3 }), ba(6, 'def', 1.35, 4, 'up_b'), db(5, 'spd', 0.7, 3, 'trap')],
    gaoshun: [ph(3, 1.8, 'multithrust'), ba(5, 'def', 1.6, 3, 'aura'), pa(6, 0.7, 'thrust', { hits: 2 }), ph(9, 3.3, 'dragon', { rider: rd('def', 0.6, 3) }), ba(7, 'def', 1.5, 4, 'up_b', { extra: { stat: 'atk', mult: 1.15 } }), cl(6, 0.5, 'purify')],
    chezhou: [ph(3, 1.7, 'thrust'), ba(4, 'def', 1.3, 3, 'up_b'), ph(6, 0.75, 'multithrust', { hits: 3 }), ph(9, 3.2, 'cross', { rider: rd('def', 0.65, 3) }), hl(6, 1.8), ba(6, 'atk', 1.3, 4, 'up_r')],
    yanliang: [ph(3, 2.0, 'slash'), bs(3, 'spd', 1.4, 3, 'wind', { extra: { stat: 'atk', mult: 1.3 } }), pa(6, 1.2, 'axe', { rider: rd('def', 0.8, 3) }), ph(9, 3.5, 'bloodslash', { leech: 0.2 }), ba(6, 'spd', 1.3, 4, 'wind'), db(6, 'atk', 0.65, 3, 'roar')],
    wenchou: [ph(3, 1.0, 'thrust', { hits: 2 }), bs(3, 'atk', 1.6, 3, 'rage'), pa(6, 1.1, 'multithrust', { rider: rd('spd', 0.8, 3) }), ph(9, 3.4, 'execute', { lowBonus: 1.2 }), ba(6, 'atk', 1.35, 4, 'up_r', { extra: { stat: 'spd', mult: 1.1 } }), db(6, 'def', 0.7, 3, 'crack')]
  };
  // 每位 Lv26／36／48 再學的三招：同樣各有名字與效果，不再用共用範本
  const X = function (stat, mult) { return { stat: stat, mult: mult }; };
  const LATE = {
    chengyuanzhi: [['黃巾移山', ph(9, 3.2, 'axe', { rider: rd('def', 0.7, 3) })], ['老兵護陣', ba(9, 'def', 1.7, 3, 'aura', { extra: X('atk', 1.2) })], ['蒼天將傾', pa(12, 1.8, 'whirl', { rider: rd('atk', 0.75, 3) })]],
    qushuai: [['渠帥號令', ba(9, 'atk', 1.5, 4, 'up_r', { extra: X('spd', 1.2) })], ['山寨亂刃', ph(9, 0.8, 'flurry', { hits: 4 })], ['破陣怒吼', db(10, 'atk', 0.55, 4, 'roar')]],
    bocai: [['長社縱火', dt(10, 0.08, 4, 'fire')], ['疾風連襲', ph(9, 0.75, 'flurry', { hits: 4 })], ['潁川風暴', pa(12, 1.6, 'multithrust', { rider: rd('spd', 0.7, 3) })]],
    pengtuo: [['汝南鐵壁', bs(10, 'def', 2.2, 3, 'aura')], ['蠻牛衝撞', pa(11, 1.5, 'axe', { rider: rd('spd', 0.7, 3) })], ['震山重拳', ph(12, 4.0, 'dragon', { rider: rd('def', 0.55, 3) })]],
    zhaohong: [['宛城槍陣', ph(9, 0.7, 'multithrust', { hits: 4 })], ['固城雷霆', ba(10, 'def', 1.7, 3, 'aura')], ['絕命一槍', ph(13, 4.2, 'execute', { lowBonus: 1.6 })]],
    hanzhong: [['宛城死守', ba(10, 'def', 1.8, 3, 'aura', { extra: X('atk', 1.1) })], ['烽火連天', ht(10, 0.08, 4, 'bloom')], ['破城雷錘', pa(12, 1.7, 'axe', { rider: rd('def', 0.65, 3) })]],
    busi: [['卜卦驚魂', cf(10, 2, 'star')], ['凶卦連斬', ph(9, 0.65, 'bloodslash', { hits: 4 })], ['天機斷命', ph(13, 4.0, 'execute', { lowBonus: 2.0 })]],
    zhangliang: [['地公震山', tc(10, 14, 3.8, 2.2, 'rock', { rider: rd('spd', 0.7, 3) })], ['符水續命', ht(10, 0.09, 5, 'revive')], ['九曲雷咒', tc(14, 18, 5.5, 3.0, 'thunder')]],
    zhangbao: [['人公狂風', tc(10, 14, 3.6, 2.2, 'bolt')], ['妖風蔽日', db(10, 'spd', 0.5, 4, 'mist')], ['蒼天降罰', tc(14, 18, 5.8, 2.8, 'fire', { rider: rd('def', 0.7, 3) })]],
    zhangjiao: [['太平清領', ht(11, 0.1, 5, 'leaf')], ['黃天封禁', st(11, 2, 'dizzy')], ['九節雷杖', tc(15, 19, 6.0, 3.2, 'thunder')]],
    duyou: [['黑山伏兵', dt(10, 0.07, 4, 'smoke')], ['扇底藏鋒', cf(10, 3, 'star')], ['山寨奇謀', tc(13, 17, 5.0, 2.8, 'water', { rider: rd('def', 0.7, 3) })]],
    zhangyan: [['飛燕三疊', ph(10, 0.7, 'flurry', { hits: 5 })], ['百萬流雲', ba(10, 'spd', 1.8, 4, 'wind', { extra: X('atk', 1.25) })], ['黑山無影', pa(12, 1.2, 'multithrust', { hits: 2 })]],
    zhangchun: [['烏桓突騎', pa(11, 1.5, 'multithrust', { rider: rd('spd', 0.75, 3) })], ['胡馬疾風', bs(10, 'spd', 1.9, 4, 'wind', { extra: X('atk', 1.3) })], ['漁陽鐵蹄', ph(13, 4.2, 'bloodslash', { leech: 0.4 })]],
    huaxiong: [['虎牢怒斬', ph(10, 3.6, 'slash', { rider: rd('def', 0.7, 3) })], ['酒未涼', bs(10, 'atk', 1.8, 3, 'rage', { extra: X('def', 1.3) })], ['涼州斬陣', pa(13, 1.9, 'axe', { rider: rd('atk', 0.75, 3) })]],
    lubu: [['方天亂舞', ph(11, 0.9, 'dragon', { hits: 5 })], ['人中呂布', bs(11, 'atk', 2.0, 3, 'rage', { extra: X('spd', 1.5) })], ['虎牢三英', pa(15, 2.2, 'whirl', { rider: rd('def', 0.7, 3) })]],
    xurong: [['老將布陣', ba(10, 'def', 1.7, 4, 'up_b', { extra: X('spd', 1.15) })], ['疑兵空營', cf(10, 3, 'mist')], ['破營重擊', ph(13, 4.0, 'cross', { rider: rd('def', 0.6, 3) })]],
    zhangkai: [['泰山截殺', ph(9, 0.8, 'bloodslash', { hits: 4, leech: 0.2 })], ['劫糧而逃', db(10, 'spd', 0.5, 4, 'trap')], ['亡命斷魂', ph(13, 4.2, 'execute', { lowBonus: 1.8 })]],
    houcheng: [['并州連弩', ph(9, 0.6, 'multithrust', { hits: 5 })], ['同袍共進', ba(10, 'spd', 1.6, 4, 'wind', { extra: X('def', 1.2) })], ['追風奪馬', ph(12, 3.8, 'thrust', { rider: rd('spd', 0.6, 3) })]],
    songxian: [['鉤鎌斷足', ph(9, 3.0, 'cross', { rider: rd('spd', 0.6, 3) })], ['戟陣固守', ba(10, 'def', 1.7, 4, 'up_b')], ['長戟回旋', pa(12, 1.8, 'whirl', { rider: rd('def', 0.75, 3) })]],
    gaoshun: [['七百敢死', ba(11, 'atk', 1.5, 4, 'rage', { extra: X('def', 1.4) })], ['陷陣無前', pa(12, 1.7, 'multithrust', { rider: rd('def', 0.7, 3) })], ['所向披靡', ph(14, 4.5, 'dragon', { rider: rd('def', 0.5, 3) })]],
    chezhou: [['刺史鎮州', ba(10, 'def', 1.6, 4, 'up_b')], ['州兵連刺', ph(10, 0.7, 'multithrust', { hits: 4 })], ['守土絕斬', ph(13, 3.8, 'cross', { rider: rd('atk', 0.7, 3) })]],
    yanliang: [['河北先鋒', ba(10, 'atk', 1.5, 4, 'up_r', { extra: X('spd', 1.2) })], ['大刀開山', pa(12, 1.8, 'axe', { rider: rd('def', 0.7, 3) })], ['萬軍取首', ph(14, 4.4, 'execute', { lowBonus: 1.6 })]],
    wenchou: [['藍纓穿雲', ph(10, 0.8, 'thrust', { hits: 4 })], ['雙壁怒火', bs(10, 'atk', 1.9, 3, 'rage', { extra: X('spd', 1.25) })], ['替友雪恨', ph(14, 4.4, 'bloodslash', { leech: 0.35 })]]
  };
  let n = 0;
  Object.keys(T).forEach(function (id) {
    if (!D.characters[id] || !D.characters[id].recruit) return;
    const t = T[id], type = t[0], nm = t[1], an = t[2], i = n++;
    const kit = KIT[id];
    const a = id + '_1', b2 = id + '_2', c = id + '_3', d = id + '_4', x = 'adv_' + id + '_a', y = 'adv_' + id + '_b', S = B.skills;
    if (kit) {
      const ids = [a, b2, c, d, x, y], names = [nm[0], nm[1], nm[2], nm[3], an[0], an[1]];
      kit.forEach(function (sk, k) { const o = Object.assign({}, sk); delete o.replaces; o.name = names[k]; if (k === 3) o.replaces = a; S[ids[k]] = o; });
      B.charSkills[id] = [a, [5, b2], [10, c], [18, d]];
      B.advisorSkills[id] = [[1, x], [8, y]];
      (LATE[id] || []).forEach(function (e, k) { const key = id + '_L' + 'abc'[k], o = Object.assign({}, e[1]); o.name = e[0]; S[key] = o; B.charSkills[id].push([[26, 36, 48][k], key]); });
      return;
    }
    const pf = PHYS_FX[i % PHYS_FX.length], pf2 = PHYS_FX[(i + 3) % PHYS_FX.length], tf = TACT_FX[i % TACT_FX.length], tf2 = TACT_FX[(i + 2) % TACT_FX.length];
    const j = 1 + (i % 4) * 0.05;   // 每人略有差異
    if (type === 'b') {
      S[a] = { name: nm[0], tp: 3, kind: 'phys', target: 'one', power: +(1.7 * j).toFixed(2), fx: pf };
      S[b2] = { name: nm[1], tp: 3, kind: 'buff', target: 'self', stat: i % 2 ? 'def' : 'atk', mult: i % 2 ? 1.5 : 1.45, turns: 3, fx: i % 2 ? 'up_b' : 'rage' };
      S[c] = { name: nm[2], tp: 6, kind: 'phys', target: 'all', power: +(0.95 * j).toFixed(2), fx: pf2 };
      S[d] = { name: nm[3], tp: 8, kind: 'phys', target: 'one', power: +(2.9 * j).toFixed(2), fx: 'execute', lowBonus: 0.8, replaces: a };
      S[x] = { name: an[0], tp: 6, kind: 'buff', target: 'allAlly', stat: 'atk', mult: +(1.35 + (i % 3) * 0.05).toFixed(2), turns: 4, fx: 'up_r' };
      S[y] = { name: an[1], tp: 5, kind: 'debuff', target: 'all', stat: 'def', mult: 0.65, turns: 3, fx: 'crack' };
    } else if (type === 't') {
      S[a] = { name: nm[0], tp: 4, allTp: 6, kind: 'tact', target: 'one', choice: true, power: +(2.1 * j).toFixed(2), allPower: +(1.3 * j).toFixed(2), fx: tf };
      S[b2] = { name: nm[1], tp: 4, kind: i % 2 ? 'confuse' : 'buff', target: i % 2 ? 'one' : 'allAlly', stat: 'def', mult: 1.35, turns: i % 2 ? 2 : 3, fx: i % 2 ? 'confuse' : 'up_b' };
      S[c] = { name: nm[2], tp: 6, kind: 'debuff', target: 'all', stat: 'def', mult: 0.65, turns: 3, fx: 'crack' };
      S[d] = { name: nm[3], tp: 9, allTp: 13, kind: 'tact', target: 'one', choice: true, power: +(3.6 * j).toFixed(2), allPower: +(2.1 * j).toFixed(2), fx: tf2, replaces: a };
      S[x] = { name: an[0], tp: 7, kind: 'heal', target: 'allAlly', power: +(2.0 + (i % 3) * 0.2).toFixed(2), fx: 'heal' };
      S[y] = { name: an[1], tp: 6, kind: 'stun', target: 'all', turns: 1, fx: 'dizzy' };
    } else {
      S[a] = { name: nm[0], tp: 4, kind: 'phys', target: 'one', power: +(0.85 * j).toFixed(2), hits: 2, fx: 'flurry' };
      S[b2] = { name: nm[1], tp: 4, kind: 'debuff', target: 'all', stat: 'spd', mult: 0.6, turns: 3, fx: 'trap' };
      S[c] = { name: nm[2], tp: 6, kind: 'phys', target: 'one', power: +(1.9 * j).toFixed(2), lowBonus: 1.0, fx: 'execute' };
      S[d] = { name: nm[3], tp: 7, kind: 'buff', target: 'allAlly', stat: 'spd', mult: 1.45, turns: 4, fx: 'wind' };
      S[x] = { name: an[0], tp: 6, kind: 'buff', target: 'allAlly', stat: 'spd', mult: 1.4, turns: 4, fx: 'wind' };
      S[y] = { name: an[1], tp: 6, kind: 'debuff', target: 'all', stat: 'atk', mult: 0.6, turns: 3, fx: 'mist' };
    }
    B.charSkills[id] = [a, [5, b2], [10, c], [18, d]];
    B.advisorSkills[id] = [[1, x], [8, y]];
  });
})();
