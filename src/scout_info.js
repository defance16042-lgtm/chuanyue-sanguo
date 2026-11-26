// 戰鬥偵察：精簡單頁，只呈現能力、裝備後攻防、計謀與名將簡史。
(function () {
  window.ScoutInfoRenderer = function (c, scene, t) {
    const D = window.DATA, B = D.battle;
    const ids = Array.isArray(t.eSkills) ? t.eSkills : (t.eSkills ? [t.eSkills] : []);
    const tactics = ids.map(function (entry) {
      const id = Array.isArray(entry) ? entry[entry.length - 1] : entry;
      const skill = B.skills[id];
      return skill ? skill.name : String(id);
    });
    const attack = Number(t.atk || 0) * 2 + Number(t.pow || 0);
    const armor = Number(t.def || 0);
    const lines = [
      '武力 ' + (t.atk || 0) + '　智力 ' + (t.int || 0) + '　統率 ' + (t.lead || 0),
      '速度 ' + (t.spd || 0) + '　運氣 ' + (t.luck || 0),
      '裝備後攻擊 ' + attack + '　防禦 ' + armor,
      '計謀：' + (tactics.length ? tactics.join('、') : '無'),
      ...(t.boss && t.desc ? ['簡史：' + t.desc] : [])
    ];
    c.fillStyle = 'rgba(4,7,20,0.97)'; c.fillRect(4, 4, 248, 216); window.Engine.panel(c, 4, 4, 248, 216);
    window.Engine.text(c, '敵將偵察：' + t.name, 12, 10, { size: 10, color: '#ffd668' });
    window.Engine.text(c, '上下切換敵將　返回', 244, 11, { size: 6, color: '#8a8aa0', align: 'right' });
    lines.forEach(function (line, i) {
      const wrapped = [];
      for (let n = 0; n < line.length; n += 27) wrapped.push(line.slice(n, n + 27));
      wrapped.forEach(function (part, j) { window.Engine.text(c, part, 12, 42 + (i * 2 + j) * 13, { size: 8, color: i === 0 ? '#9ef59e' : '#f4f4ff' }); });
    });
    window.Engine.text(c, '偵察不消耗回合', 12, 204, { size: 7, color: '#8a8aa0' });
  };
})();
