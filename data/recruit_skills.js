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
    zhangkai:     ['b', ['泰山劫道', '亡命一搏', '山賊亂刀', '斷路一斬'], ['劫糧令', '賊寨號角']],
    houcheng:     ['b', ['并州疾刺', '同袍護陣', '連環弩射', '追風一擊'], ['并州軍令', '同進同退']],
    songxian:     ['b', ['長戟鉤擊', '戟陣迴旋', '長戟橫掃', '鉤鎌連擊'], ['戟陣令', '并州鼓角']],
    gaoshun:      ['b', ['陷陣衝鋒', '密陣如牆', '七百死士', '所攻必破'], ['陷陣令', '不飲酒的軍規']]
  };
  let n = 0;
  Object.keys(T).forEach(function (id) {
    if (!D.characters[id] || !D.characters[id].recruit) return;
    const t = T[id], type = t[0], nm = t[1], an = t[2], i = n++;
    const pf = PHYS_FX[i % PHYS_FX.length], pf2 = PHYS_FX[(i + 3) % PHYS_FX.length], tf = TACT_FX[i % TACT_FX.length], tf2 = TACT_FX[(i + 2) % TACT_FX.length];
    const j = 1 + (i % 4) * 0.05;   // 每人略有差異
    const a = id + '_1', b2 = id + '_2', c = id + '_3', d = id + '_4', x = 'adv_' + id + '_a', y = 'adv_' + id + '_b', S = B.skills;
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
